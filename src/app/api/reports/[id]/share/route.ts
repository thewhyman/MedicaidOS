import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
    if (!url || !key) throw new Error('Supabase admin env vars missing.')
    return createSupabaseClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

type RouteContext = { params: Promise<{ id: string }> }

// GET /api/reports/[id]/share — returns a fresh 7-day signed URL
export async function GET(_req: NextRequest, ctx: RouteContext) {
    const userClient = await createClient()
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const { data: profile } = await admin
        .from('profiles').select('organization_id').eq('id', user.id).single()
    if (!profile?.organization_id) return NextResponse.json({ error: 'No organization' }, { status: 403 })

    const { id } = await ctx.params
    const { data: report } = await admin
        .from('reports')
        .select('storage_path, name')
        .eq('id', id)
        .eq('organization_id', profile.organization_id)
        .single()

    if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 })

    const { data: signed, error } = await admin.storage
        .from('reports')
        .createSignedUrl(report.storage_path, 60 * 60 * 24 * 7) // 7 days

    if (error || !signed) return NextResponse.json({ error: 'Failed to generate share link' }, { status: 500 })

    return NextResponse.json({ url: signed.signedUrl, expires_in: '7 days' })
}
