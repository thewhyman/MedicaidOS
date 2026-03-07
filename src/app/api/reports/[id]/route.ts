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

type RouteContext = { params: Promise<{ id: string }> }

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
    const auth = await getOrgId()
    if (auth instanceof NextResponse) return auth
    const { orgId } = auth
    const { id } = await ctx.params

    const admin = createAdminClient()

    // Fetch the report to get storage_path
    const { data: report } = await admin
        .from('reports')
        .select('storage_path')
        .eq('id', id)
        .eq('organization_id', orgId)
        .single()

    if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 })

    // Delete from Storage
    await admin.storage.from('reports').remove([report.storage_path])

    // Delete from DB
    await admin.from('reports').delete().eq('id', id).eq('organization_id', orgId)

    return new NextResponse(null, { status: 204 })
}
