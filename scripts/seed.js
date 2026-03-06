const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
)

async function seed() {
    console.log('🚀 Seeding MedicaidOS...\n')

    // ── 1. Organization ───────────────────────────────────────────────
    const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({ name: 'CareBridge Health' })
        .select()
        .single()

    if (orgError) { console.error('Org error:', orgError.message); process.exit(1) }
    console.log(`✅ Org: ${org.name}`)

    // ── 2. Auth user + profile ────────────────────────────────────────
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'demo@medicaidos.com',
        password: 'demo1234',
        email_confirm: true,
        user_metadata: { full_name: 'Alex Johnson' }
    })

    if (authError) { console.error('Auth error:', authError.message); process.exit(1) }

    await supabase.from('profiles').insert({
        id: authData.user.id,
        organization_id: org.id,
        full_name: 'Alex Johnson',
        role: 'admin',
    })
    console.log(`✅ User: demo@medicaidos.com / demo1234`)

    // ── 3. Grants ─────────────────────────────────────────────────────
    const { data: grants, error: grantsError } = await supabase
        .from('grants')
        .insert([
            {
                organization_id: org.id,
                title: 'Community Health Access Program',
                funder: 'California Dept. of Public Health',
                amount: 250000,
                status: 'active',
                start_date: '2026-01-01',
                end_date: '2026-12-31',
                compliance_requirements: 'Quarterly financial reports; annual beneficiary impact assessment',
            },
            {
                organization_id: org.id,
                title: 'Healthcare Infrastructure Expansion',
                funder: 'Federal Health Resources Administration',
                amount: 1200000,
                status: 'active',
                start_date: '2026-03-01',
                end_date: '2027-06-30',
                compliance_requirements: 'Monthly progress reports; site inspections every 6 months',
            },
            {
                organization_id: org.id,
                title: 'Medicaid Renewal Assistance',
                funder: 'Local Health Initiative',
                amount: 85000,
                status: 'completed',
                start_date: '2025-01-01',
                end_date: '2025-12-31',
                compliance_requirements: 'Bi-annual financial audits',
            },
            {
                organization_id: org.id,
                title: 'Rural Telehealth Expansion',
                funder: 'HRSA Telehealth Program',
                amount: 320000,
                status: 'pending',
                start_date: '2026-06-01',
                end_date: '2027-12-31',
                compliance_requirements: 'Quarterly utilization reports',
            },
        ])
        .select()

    if (grantsError) { console.error('Grants error:', grantsError.message); process.exit(1) }
    console.log(`✅ Grants: ${grants.length} created`)

    const [g1, g2, g3, g4] = grants

    // ── 4. Budgets ────────────────────────────────────────────────────
    const { error: budgetsError } = await supabase.from('budgets').insert([
        // Community Health Access Program
        { grant_id: g1.id, category: 'Personnel',       allocated: 120000, spent: 88000 },
        { grant_id: g1.id, category: 'Direct Services', allocated: 90000,  spent: 71500 },
        { grant_id: g1.id, category: 'Outreach',        allocated: 40000,  spent: 17200 },
        // Healthcare Infrastructure Expansion
        { grant_id: g2.id, category: 'Infrastructure',  allocated: 800000, spent: 423000 },
        { grant_id: g2.id, category: 'Equipment',       allocated: 250000, spent: 97500 },
        { grant_id: g2.id, category: 'Personnel',       allocated: 150000, spent: 61800 },
        // Medicaid Renewal Assistance (completed — fully spent)
        { grant_id: g3.id, category: 'Direct Services', allocated: 60000,  spent: 59200 },
        { grant_id: g3.id, category: 'Admin',           allocated: 25000,  spent: 24100 },
        // Rural Telehealth Expansion (pending — nothing spent yet)
        { grant_id: g4.id, category: 'Technology',      allocated: 200000, spent: 0 },
        { grant_id: g4.id, category: 'Personnel',       allocated: 120000, spent: 0 },
    ])

    if (budgetsError) { console.error('Budgets error:', budgetsError.message); process.exit(1) }
    console.log(`✅ Budgets: 10 created`)

    // ── 5. Compliance logs ────────────────────────────────────────────
    const { error: complianceError } = await supabase.from('compliance_logs').insert([
        // Grant 1
        { grant_id: g1.id, requirement: 'Q1 Financial Report',              status: 'completed',   due_date: '2026-03-31', completed_at: '2026-03-27' },
        { grant_id: g1.id, requirement: 'Q2 Financial Report',              status: 'in_progress', due_date: '2026-06-30' },
        { grant_id: g1.id, requirement: 'Annual Beneficiary Assessment',    status: 'not_started', due_date: '2026-12-15' },
        // Grant 2
        { grant_id: g2.id, requirement: 'Monthly Financial Statement — Feb', status: 'overdue',    due_date: '2026-02-28' },
        { grant_id: g2.id, requirement: 'March Progress Report',            status: 'in_progress', due_date: '2026-03-31' },
        { grant_id: g2.id, requirement: 'Site Inspection #1',               status: 'not_started', due_date: '2026-09-01' },
        // Grant 3 (completed grant)
        { grant_id: g3.id, requirement: 'Final Audit Report',               status: 'completed',   due_date: '2026-01-31', completed_at: '2026-01-29' },
        { grant_id: g3.id, requirement: 'Close-out Financial Statement',    status: 'completed',   due_date: '2026-02-15', completed_at: '2026-02-12' },
        // Grant 4
        { grant_id: g4.id, requirement: 'Kick-off Utilization Report',     status: 'not_started', due_date: '2026-09-30' },
    ])

    if (complianceError) { console.error('Compliance error:', complianceError.message); process.exit(1) }
    console.log(`✅ Compliance logs: 9 created`)

    console.log('\n🎉 Seed complete!')
    console.log('─────────────────────────────')
    console.log('📧  demo@medicaidos.com')
    console.log('🔑  demo1234')
}

seed().catch(console.error)
