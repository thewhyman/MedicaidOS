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

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, ctx: RouteContext) {
    const auth = await getOrgId()
    if (auth instanceof NextResponse) return auth
    const { orgId } = auth
    const { id } = await ctx.params

    const body = await req.json()
    const { title, funder, amount, status, start_date, end_date, compliance_requirements } = body

    if (title !== undefined && !title?.trim()) {
        return NextResponse.json({ error: 'title cannot be empty' }, { status: 400 })
    }

    const updates: Record<string, unknown> = {}
    if (title !== undefined) updates.title = title.trim()
    if (funder !== undefined) updates.funder = funder?.trim() || null
    if (amount !== undefined) updates.amount = amount != null && amount !== '' ? Number(amount) : null
    if (status !== undefined) updates.status = VALID_STATUSES.includes(status) ? status : 'pending'
    if (start_date !== undefined) updates.start_date = start_date || null
    if (end_date !== undefined) updates.end_date = end_date || null
    if (compliance_requirements !== undefined) updates.compliance_requirements = compliance_requirements?.trim() || null

    const { data, error } = await createAdminClient()
        .from('grants')
        .update(updates)
        .eq('id', id)
        .eq('organization_id', orgId) // ensures the grant belongs to the user's org
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: 'Grant not found' }, { status: 404 })
    return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
    const auth = await getOrgId()
    if (auth instanceof NextResponse) return auth
    const { orgId } = auth
    const { id } = await ctx.params

    const { error, count } = await createAdminClient()
        .from('grants')
        .delete({ count: 'exact' })
        .eq('id', id)
        .eq('organization_id', orgId) // ensures the grant belongs to the user's org

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (count === 0) return NextResponse.json({ error: 'Grant not found' }, { status: 404 })
    return new NextResponse(null, { status: 204 })
}
