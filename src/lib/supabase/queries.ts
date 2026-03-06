import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from './server'
import type { Grant, BudgetWithGrant, ComplianceLogWithGrant, DashboardStats } from '@/types/database'

// Admin client bypasses RLS — used server-side only with verified user org filtering.
// The service role key is never sent to the browser.
function createAdminClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )
}

// Resolves the authenticated user's organization_id from their verified session.
async function getUserOrgId(): Promise<string | null> {
    const userClient = await createClient()
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return null

    const { data: profile } = await createAdminClient()
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    return profile?.organization_id ?? null
}

export async function getGrants(): Promise<Grant[]> {
    const orgId = await getUserOrgId()
    if (!orgId) return []

    const { data, error } = await createAdminClient()
        .from('grants')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })

    if (error) { console.error('getGrants error:', error.message); return [] }
    return data ?? []
}

export async function getBudgetsWithGrants(): Promise<BudgetWithGrant[]> {
    const orgId = await getUserOrgId()
    if (!orgId) return []

    const { data, error } = await createAdminClient()
        .from('budgets')
        .select('*, grant:grants!inner(title, organization_id)')
        .eq('grants.organization_id', orgId)
        .order('created_at', { ascending: false })

    if (error) { console.error('getBudgetsWithGrants error:', error.message); return [] }
    return (data as BudgetWithGrant[]) ?? []
}

export async function getComplianceLogs(): Promise<ComplianceLogWithGrant[]> {
    const orgId = await getUserOrgId()
    if (!orgId) return []

    const { data, error } = await createAdminClient()
        .from('compliance_logs')
        .select('*, grant:grants!inner(title, organization_id)')
        .eq('grants.organization_id', orgId)
        .order('due_date', { ascending: true })

    if (error) { console.error('getComplianceLogs error:', error.message); return [] }
    return (data as ComplianceLogWithGrant[]) ?? []
}

export async function getDashboardStats(): Promise<DashboardStats> {
    const orgId = await getUserOrgId()
    if (!orgId) return { totalGrantsValue: 0, totalSpent: 0, totalAllocated: 0, complianceScore: 0, activeGrantsCount: 0, budgetByCategory: [] }

    const admin = createAdminClient()

    const [{ data: grants }, { data: budgets }, { data: compliance }] = await Promise.all([
        admin.from('grants').select('amount, status').eq('organization_id', orgId),
        admin.from('budgets').select('allocated, spent, category, grant:grants!inner(organization_id)').eq('grants.organization_id', orgId),
        admin.from('compliance_logs').select('status, grant:grants!inner(organization_id)').eq('grants.organization_id', orgId),
    ])

    const totalGrantsValue = (grants ?? []).reduce((sum, g) => sum + (g.amount ?? 0), 0)
    const totalSpent = (budgets ?? []).reduce((sum, b) => sum + b.spent, 0)
    const totalAllocated = (budgets ?? []).reduce((sum, b) => sum + b.allocated, 0)
    const completedCount = (compliance ?? []).filter(c => c.status === 'completed').length
    const complianceScore = (compliance ?? []).length > 0
        ? Math.round((completedCount / compliance!.length) * 100)
        : 0

    const categoryMap = new Map<string, { allocated: number; spent: number }>()
    for (const b of budgets ?? []) {
        const prev = categoryMap.get(b.category) ?? { allocated: 0, spent: 0 }
        categoryMap.set(b.category, {
            allocated: prev.allocated + b.allocated,
            spent: prev.spent + b.spent,
        })
    }

    return {
        totalGrantsValue,
        totalSpent,
        totalAllocated,
        complianceScore,
        activeGrantsCount: (grants ?? []).filter(g => g.status === 'active').length,
        budgetByCategory: Array.from(categoryMap.entries()).map(([name, vals]) => ({ name, ...vals })),
    }
}
