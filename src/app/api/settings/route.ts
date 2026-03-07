import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
    if (!url || !key) throw new Error('Supabase admin env vars missing.')
    return createSupabaseClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

async function getUser() {
    const userClient = await createClient()
    const { data: { user }, error } = await userClient.auth.getUser()
    if (error || !user) return null
    return { user, userClient }
}

// GET /api/settings — returns profile + org details
export async function GET() {
    const auth = await getUser()
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { user } = auth

    const admin = createAdminClient()
    const { data: profile } = await admin
        .from('profiles')
        .select('full_name, role, organization_id')
        .eq('id', user.id)
        .single()

    const { data: org } = profile?.organization_id
        ? await admin.from('organizations').select('id, name').eq('id', profile.organization_id).single()
        : { data: null }

    return NextResponse.json({
        email: user.email,
        full_name: profile?.full_name ?? '',
        role: profile?.role ?? 'member',
        organization: org ? { id: org.id, name: org.name } : null,
    })
}

// PATCH /api/settings — update name, email, or password
export async function PATCH(req: NextRequest) {
    const auth = await getUser()
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { user, userClient } = auth

    const body = await req.json()
    const { type } = body
    const admin = createAdminClient()

    if (type === 'name') {
        const { full_name } = body
        if (!full_name?.trim()) return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 })

        const { error } = await admin
            .from('profiles')
            .update({ full_name: full_name.trim() })
            .eq('id', user.id)

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        await admin.auth.admin.updateUserById(user.id, {
            user_metadata: { ...user.user_metadata, full_name: full_name.trim() },
        })

        return NextResponse.json({ success: true })
    }

    if (type === 'email') {
        const { email } = body
        if (!email?.trim()) return NextResponse.json({ error: 'Email cannot be empty' }, { status: 400 })

        const { error } = await admin.auth.admin.updateUserById(user.id, { email: email.trim() })
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ success: true })
    }

    if (type === 'password') {
        const { current_password, new_password } = body
        if (!current_password || !new_password) {
            return NextResponse.json({ error: 'Both current and new password are required' }, { status: 400 })
        }
        if (new_password.length < 8) {
            return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 })
        }

        // Verify current password
        const { error: signInError } = await userClient.auth.signInWithPassword({
            email: user.email!,
            password: current_password,
        })
        if (signInError) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })

        const { error } = await admin.auth.admin.updateUserById(user.id, { password: new_password })
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unknown update type' }, { status: 400 })
}
