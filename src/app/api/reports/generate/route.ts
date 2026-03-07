import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// ── Admin client ───────────────────────────────────────────────────────────

function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
    if (!url || !key) throw new Error('Supabase admin env vars missing.')
    return createSupabaseClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

async function getAuth(): Promise<{ orgId: string; userId: string } | NextResponse> {
    const userClient = await createClient()
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await createAdminClient()
        .from('profiles').select('organization_id').eq('id', user.id).single()
    if (!profile?.organization_id) return NextResponse.json({ error: 'No organization' }, { status: 403 })

    return { orgId: profile.organization_id, userId: user.id }
}

// ── Content generators ─────────────────────────────────────────────────────

type Grant = { title: string; funder: string | null; amount: number | null; status: string; start_date: string | null; end_date: string | null }
type Budget = { category: string; allocated: number; spent: number; grant: { title: string } }
type Compliance = { requirement: string; status: string; due_date: string | null; completed_at: string | null; grant: { title: string } }

function fmt(n: number) { return `$${n.toLocaleString()}` }
function pct(spent: number, allocated: number) {
    return allocated > 0 ? `${Math.round((spent / allocated) * 100)}%` : '0%'
}

function generateFinancialCSV(grants: Grant[], budgets: Budget[]): string {
    const totalValue = grants.reduce((s, g) => s + (g.amount ?? 0), 0)
    const totalAllocated = budgets.reduce((s, b) => s + b.allocated, 0)
    const totalSpent = budgets.reduce((s, b) => s + b.spent, 0)

    const catMap = new Map<string, { allocated: number; spent: number }>()
    for (const b of budgets) {
        const p = catMap.get(b.category) ?? { allocated: 0, spent: 0 }
        catMap.set(b.category, { allocated: p.allocated + b.allocated, spent: p.spent + b.spent })
    }

    const lines: string[] = [
        `FINANCIAL SUMMARY REPORT`,
        `Generated,${new Date().toLocaleDateString()}`,
        ``,
        `KEY METRICS`,
        `Total Grants Value,${fmt(totalValue)}`,
        `Total Allocated,${fmt(totalAllocated)}`,
        `Total Spent,${fmt(totalSpent)}`,
        `Total Remaining,${fmt(totalAllocated - totalSpent)}`,
        `Overall Utilization,${pct(totalSpent, totalAllocated)}`,
        `Active Grants,${grants.filter(g => g.status === 'active').length}`,
        ``,
        `GRANTS OVERVIEW`,
        `Title,Funder,Award Amount,Status,Start Date,End Date`,
        ...grants.map(g =>
            [g.title, g.funder ?? '', g.amount != null ? fmt(g.amount) : '', g.status, g.start_date ?? '', g.end_date ?? ''].join(',')
        ),
        ``,
        `BUDGET BY CATEGORY`,
        `Category,Allocated,Spent,Remaining,Utilization`,
        ...Array.from(catMap.entries()).map(([cat, v]) =>
            [cat, fmt(v.allocated), fmt(v.spent), fmt(v.allocated - v.spent), pct(v.spent, v.allocated)].join(',')
        ),
    ]
    return lines.join('\n')
}

function generateUtilizationCSV(budgets: Budget[]): string {
    const lines: string[] = [
        `GRANT UTILIZATION REPORT`,
        `Generated,${new Date().toLocaleDateString()}`,
        ``,
        `Grant,Category,Allocated,Spent,Remaining,Utilization`,
        ...budgets.map(b =>
            [b.grant.title, b.category, fmt(b.allocated), fmt(b.spent), fmt(b.allocated - b.spent), pct(b.spent, b.allocated)].join(',')
        ),
    ]
    return lines.join('\n')
}

function generateComplianceCSV(logs: Compliance[]): string {
    const total = logs.length
    const completed = logs.filter(l => l.status === 'completed').length
    const score = total > 0 ? Math.round((completed / total) * 100) : 0

    const lines: string[] = [
        `COMPLIANCE AUDIT REPORT`,
        `Generated,${new Date().toLocaleDateString()}`,
        ``,
        `SUMMARY`,
        `Total Requirements,${total}`,
        `Completed,${completed}`,
        `Overdue,${logs.filter(l => l.status === 'overdue').length}`,
        `Compliance Score,${score}%`,
        ``,
        `REQUIREMENTS`,
        `Grant,Requirement,Status,Due Date,Completed Date`,
        ...logs.map(l =>
            [l.grant.title, `"${l.requirement}"`, l.status, l.due_date ?? '', l.completed_at ?? ''].join(',')
        ),
    ]
    return lines.join('\n')
}

function generateFinancialHTML(grants: Grant[], budgets: Budget[]): string {
    const totalValue = grants.reduce((s, g) => s + (g.amount ?? 0), 0)
    const totalAllocated = budgets.reduce((s, b) => s + b.allocated, 0)
    const totalSpent = budgets.reduce((s, b) => s + b.spent, 0)

    const catMap = new Map<string, { allocated: number; spent: number }>()
    for (const b of budgets) {
        const p = catMap.get(b.category) ?? { allocated: 0, spent: 0 }
        catMap.set(b.category, { allocated: p.allocated + b.allocated, spent: p.spent + b.spent })
    }

    const grantRows = grants.map(g => `
        <tr>
            <td>${g.title}</td>
            <td>${g.funder ?? '—'}</td>
            <td>${g.amount != null ? fmt(g.amount) : '—'}</td>
            <td><span class="badge badge-${g.status}">${g.status}</span></td>
            <td>${g.start_date ?? '—'}</td>
            <td>${g.end_date ?? '—'}</td>
        </tr>`).join('')

    const catRows = Array.from(catMap.entries()).map(([cat, v]) => `
        <tr>
            <td>${cat}</td>
            <td>${fmt(v.allocated)}</td>
            <td>${fmt(v.spent)}</td>
            <td>${fmt(v.allocated - v.spent)}</td>
            <td>${pct(v.spent, v.allocated)}</td>
        </tr>`).join('')

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Financial Summary Report</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #1a1a1a; padding: 48px; font-size: 13px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1a1a1a; padding-bottom: 20px; margin-bottom: 32px; }
  h1 { font-size: 22px; font-weight: 800; }
  .subtitle { color: #666; margin-top: 4px; font-size: 12px; }
  .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
  .metric { background: #f8f8f8; border: 1px solid #e5e5e5; border-radius: 8px; padding: 16px; }
  .metric-value { font-size: 20px; font-weight: 800; color: #1a1a1a; }
  .metric-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; color: #666; margin-top: 4px; }
  h2 { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 24px 0 12px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #666; padding: 8px 10px; background: #f5f5f5; border-bottom: 2px solid #ddd; }
  td { padding: 10px; border-bottom: 1px solid #f0f0f0; }
  .badge { padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
  .badge-active { background: #dcfce7; color: #16a34a; }
  .badge-pending { background: #fef9c3; color: #ca8a04; }
  .badge-completed { background: #dbeafe; color: #2563eb; }
  .badge-cancelled { background: #f4f4f5; color: #71717a; }
  .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #eee; font-size: 10px; color: #999; }
  @media print { body { padding: 24px; } .metrics { break-inside: avoid; } }
</style>
</head>
<body>
<div class="header">
  <div>
    <h1>Financial Summary Report</h1>
    <p class="subtitle">Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} · Confidential</p>
  </div>
</div>
<div class="metrics">
  <div class="metric"><div class="metric-value">${fmt(totalValue)}</div><div class="metric-label">Total Grants Value</div></div>
  <div class="metric"><div class="metric-value">${fmt(totalSpent)}</div><div class="metric-label">Total Spent</div></div>
  <div class="metric"><div class="metric-value">${pct(totalSpent, totalAllocated)}</div><div class="metric-label">Overall Utilization</div></div>
</div>
<h2>Grants Overview</h2>
<table>
  <thead><tr><th>Title</th><th>Funder</th><th>Award Amount</th><th>Status</th><th>Start Date</th><th>End Date</th></tr></thead>
  <tbody>${grantRows}</tbody>
</table>
<h2>Budget by Category</h2>
<table>
  <thead><tr><th>Category</th><th>Allocated</th><th>Spent</th><th>Remaining</th><th>Utilization</th></tr></thead>
  <tbody>${catRows}</tbody>
</table>
<div class="footer">This report is auto-generated by MedicaidOS and is intended for internal use only.</div>
<script>window.addEventListener('load', () => window.print());</script>
</body>
</html>`
}

function generateComplianceHTML(logs: Compliance[]): string {
    const total = logs.length
    const completed = logs.filter(l => l.status === 'completed').length
    const overdue = logs.filter(l => l.status === 'overdue').length
    const score = total > 0 ? Math.round((completed / total) * 100) : 0

    const rows = logs.map(l => `
        <tr>
            <td>${l.grant.title}</td>
            <td>${l.requirement}</td>
            <td><span class="badge badge-${l.status.replace('_', '-')}">${l.status.replace('_', ' ')}</span></td>
            <td>${l.due_date ?? '—'}</td>
            <td>${l.completed_at ?? '—'}</td>
        </tr>`).join('')

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Compliance Audit Report</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #1a1a1a; padding: 48px; font-size: 13px; }
  .header { border-bottom: 3px solid #1a1a1a; padding-bottom: 20px; margin-bottom: 32px; }
  h1 { font-size: 22px; font-weight: 800; }
  .subtitle { color: #666; margin-top: 4px; font-size: 12px; }
  .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
  .metric { background: #f8f8f8; border: 1px solid #e5e5e5; border-radius: 8px; padding: 16px; }
  .metric-value { font-size: 20px; font-weight: 800; }
  .metric-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; color: #666; margin-top: 4px; }
  h2 { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 24px 0 12px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #666; padding: 8px 10px; background: #f5f5f5; border-bottom: 2px solid #ddd; }
  td { padding: 10px; border-bottom: 1px solid #f0f0f0; }
  .badge { padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
  .badge-completed { background: #dcfce7; color: #16a34a; }
  .badge-in-progress { background: #dbeafe; color: #2563eb; }
  .badge-not-started { background: #f4f4f5; color: #71717a; }
  .badge-overdue { background: #fee2e2; color: #dc2626; }
  .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #eee; font-size: 10px; color: #999; }
  @media print { body { padding: 24px; } }
</style>
</head>
<body>
<div class="header">
  <h1>Compliance Audit Report</h1>
  <p class="subtitle">Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} · Confidential</p>
</div>
<div class="metrics">
  <div class="metric"><div class="metric-value">${score}%</div><div class="metric-label">Compliance Score</div></div>
  <div class="metric"><div class="metric-value">${total}</div><div class="metric-label">Total Requirements</div></div>
  <div class="metric"><div class="metric-value">${completed}</div><div class="metric-label">Completed</div></div>
  <div class="metric"><div class="metric-value">${overdue}</div><div class="metric-label">Overdue</div></div>
</div>
<h2>Requirements</h2>
<table>
  <thead><tr><th>Grant</th><th>Requirement</th><th>Status</th><th>Due Date</th><th>Completed</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
<div class="footer">This report is auto-generated by MedicaidOS and is intended for internal use only.</div>
<script>window.addEventListener('load', () => window.print());</script>
</body>
</html>`
}

// ── Route handler ──────────────────────────────────────────────────────────

const REPORT_CONFIGS: Record<string, { name: string; formats: string[] }> = {
    financial_summary: { name: 'Financial Summary', formats: ['csv', 'html'] },
    grant_utilization: { name: 'Grant Utilization', formats: ['csv'] },
    compliance_audit: { name: 'Compliance Audit', formats: ['csv', 'html'] },
}

export async function POST(req: NextRequest) {
    const auth = await getAuth()
    if (auth instanceof NextResponse) return auth
    const { orgId, userId } = auth

    const body = await req.json()
    const { report_type, format } = body as { report_type: string; format: string }

    const config = REPORT_CONFIGS[report_type]
    if (!config) return NextResponse.json({ error: 'Unknown report type' }, { status: 400 })
    if (!config.formats.includes(format)) {
        return NextResponse.json({ error: `Format "${format}" not supported for this report` }, { status: 400 })
    }

    const admin = createAdminClient()

    // Fetch data
    const [{ data: grants }, { data: budgets }, { data: compliance }] = await Promise.all([
        admin.from('grants').select('title, funder, amount, status, start_date, end_date').eq('organization_id', orgId).order('created_at', { ascending: false }),
        admin.from('budgets').select('category, allocated, spent, grant:grants!inner(title, organization_id)').eq('grants.organization_id', orgId),
        admin.from('compliance_logs').select('requirement, status, due_date, completed_at, grant:grants!inner(title, organization_id)').eq('grants.organization_id', orgId).order('due_date', { ascending: true }),
    ])

    // Generate content
    let content: string
    let contentType: string
    let fileExt: string

    if (format === 'csv') {
        contentType = 'text/csv'
        fileExt = 'csv'
        if (report_type === 'financial_summary') {
            content = generateFinancialCSV(grants ?? [], (budgets as unknown as Budget[]) ?? [])
        } else if (report_type === 'grant_utilization') {
            content = generateUtilizationCSV((budgets as unknown as Budget[]) ?? [])
        } else {
            content = generateComplianceCSV((compliance as unknown as Compliance[]) ?? [])
        }
    } else {
        contentType = 'text/html'
        fileExt = 'html'
        if (report_type === 'financial_summary') {
            content = generateFinancialHTML(grants ?? [], (budgets as unknown as Budget[]) ?? [])
        } else {
            content = generateComplianceHTML((compliance as unknown as Compliance[]) ?? [])
        }
    }

    const fileBuffer = Buffer.from(content, 'utf-8')
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const fileName = `${report_type}_${timestamp}.${fileExt}`
    const storagePath = `${orgId}/${fileName}`
    const reportName = `${config.name} — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

    // Upload to Storage
    let downloadUrl: string | null = null
    let reportId: string | null = null

    const { error: uploadError } = await admin.storage
        .from('reports')
        .upload(storagePath, fileBuffer, { contentType, upsert: false })

    if (!uploadError) {
        const { data: signed } = await admin.storage
            .from('reports')
            .createSignedUrl(storagePath, 60 * 60 * 24 * 7) // 7 days
        downloadUrl = signed?.signedUrl ?? null

        // Save report metadata (silent fail if table doesn't exist yet)
        try {
            const { data: report } = await admin
                .from('reports')
                .insert({
                    organization_id: orgId,
                    name: reportName,
                    report_type,
                    format: fileExt,
                    storage_path: storagePath,
                    size_bytes: fileBuffer.length,
                    created_by: userId,
                })
                .select()
                .single()
            reportId = report?.id ?? null
        } catch { /* table may not exist yet */ }
    }

    // If Storage upload failed, return file directly for immediate download
    if (!downloadUrl) {
        return new NextResponse(content, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${fileName}"`,
            },
        })
    }

    return NextResponse.json({
        report_id: reportId,
        name: reportName,
        download_url: downloadUrl,
        format: fileExt,
        size_bytes: fileBuffer.length,
        storage_path: storagePath,
    })
}
