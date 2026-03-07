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

const VALID_STATUSES = ['pending', 'active', 'completed', 'cancelled']

export async function POST(req: NextRequest) {
    const auth = await getOrgId()
    if (auth instanceof NextResponse) return auth
    const { orgId } = auth

    const body = await req.json()
    const { title, funder, amount, status, start_date, end_date, compliance_requirements } = body

    if (!title?.trim()) return NextResponse.json({ error: 'title is required' }, { status: 400 })

    const { data, error } = await createAdminClient()
        .from('grants')
        .insert({
            organization_id: orgId,
            title: title.trim(),
            funder: funder?.trim() || null,
            amount: amount != null && amount !== '' ? Number(amount) : null,
            status: VALID_STATUSES.includes(status) ? status : 'pending',
            start_date: start_date || null,
            end_date: end_date || null,
            compliance_requirements: compliance_requirements?.trim() || null,
        })
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
}
