import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
    if (!url || !key) throw new Error('Supabase admin env vars missing.')
    return createSupabaseClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

async function getOrgId(): Promise<{ orgId: string } | NextResponse> {
    const userClient = await createClient()
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await createAdminClient()
        .from('profiles').select('organization_id').eq('id', user.id).single()

    if (!profile?.organization_id) return NextResponse.json({ error: 'No organization' }, { status: 403 })
    return { orgId: profile.organization_id }
}

const SYSTEM_PROMPT = `You are a grant compliance expert. Analyze the provided grant document and extract all compliance requirements, reporting obligations, and deadlines.

Return a JSON object with this exact structure:
{
  "summary": "Brief 1-2 sentence summary of the document's compliance requirements",
  "requirements": [
    {
      "requirement": "Descriptive name of the requirement (e.g. Q1 Financial Report)",
      "due_date": "YYYY-MM-DD or null if no specific date",
      "frequency": "one-time | monthly | quarterly | semi-annual | annual | null",
      "category": "financial | progress | audit | inspection | other"
    }
  ]
}

For recurring requirements (e.g. quarterly reports), create one entry with the next logical upcoming due date based on today's date (${new Date().toISOString().split('T')[0]}).
Only include actual compliance obligations, not general program descriptions or eligibility criteria.`

const ALLOWED_EXTENSIONS = ['.txt', '.md', '.pdf']
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

export async function POST(req: NextRequest) {
    const auth = await getOrgId()
    if (auth instanceof NextResponse) return auth

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return NextResponse.json(
            { error: `Unsupported file type "${ext}". Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` },
            { status: 400 }
        )
    }

    if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: 'File too large (max 5 MB)' }, { status: 400 })
    }

    const text = await file.text()
    if (!text.trim()) {
        return NextResponse.json(
            { error: 'Document appears to be empty or unreadable. For scanned PDFs, please use a text-based PDF.' },
            { status: 400 }
        )
    }

    let result: unknown
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                {
                    role: 'user',
                    content: `Extract all compliance requirements from this grant document:\n\n${text.slice(0, 100_000)}`
                },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.1,
        })

        const content = completion.choices[0].message.content
        if (!content) return NextResponse.json({ error: 'No response from AI' }, { status: 500 })
        result = JSON.parse(content)
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'AI analysis failed'
        return NextResponse.json({ error: message }, { status: 500 })
    }

    return NextResponse.json(result)
}
