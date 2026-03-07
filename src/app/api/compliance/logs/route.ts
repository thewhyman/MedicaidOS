import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

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

export async function POST(req: NextRequest) {
    const auth = await getOrgId()
    if (auth instanceof NextResponse) return auth
    const { orgId } = auth

    const body = await req.json()
    const { grant_id, requirement, due_date } = body

    if (!grant_id || !requirement?.trim()) {
        return NextResponse.json({ error: 'grant_id and requirement are required' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Verify the grant belongs to the user's org
    const { data: grant } = await admin
        .from('grants').select('id').eq('id', grant_id).eq('organization_id', orgId).single()
    if (!grant) return NextResponse.json({ error: 'Grant not found' }, { status: 404 })

    const { data, error } = await admin
        .from('compliance_logs')
        .insert({ grant_id, requirement: requirement.trim(), status: 'not_started', due_date: due_date || null })
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
}
