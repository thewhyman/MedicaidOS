import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
    if (!url || !key) throw new Error('Supabase admin env vars missing.')
    return createSupabaseClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
        const ch = line[i]
        if (ch === '"' && !inQuotes) {
            inQuotes = true
        } else if (ch === '"' && inQuotes) {
            if (line[i + 1] === '"') { current += '"'; i++ }
            else inQuotes = false
        } else if (ch === ',' && !inQuotes) {
            result.push(current); current = ''
        } else {
            current += ch
        }
    }
    result.push(current)
    return result
}

function parseCSV(text: string): Record<string, string>[] {
    const lines = text.trim().split(/\r?\n/)
    if (lines.length < 2) return []

    const headers = parseCSVLine(lines[0]).map(h => h.trim().replace(/^"|"$/g, '').toLowerCase())

    return lines.slice(1)
        .map(line => {
            const values = parseCSVLine(line)
            return Object.fromEntries(headers.map((h, i) => [h, (values[i] ?? '').trim()]))
        })
        .filter(row => Object.values(row).some(v => v !== ''))
}

const VALID_STATUSES = ['pending', 'active', 'completed', 'cancelled']

export async function POST(req: NextRequest) {
    const userClient = await createClient()
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const { data: profile } = await admin
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) {
        return NextResponse.json({ error: 'No organization found for user' }, { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!file.name.endsWith('.csv')) {
        return NextResponse.json({ error: 'File must be a .csv' }, { status: 400 })
    }

    const text = await file.text()
    const rows = parseCSV(text)
    if (rows.length === 0) {
        return NextResponse.json({ error: 'CSV is empty or has no data rows' }, { status: 400 })
    }

    const grants: object[] = []
    const errors: string[] = []

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const rowNum = i + 2 // +1 for header, +1 for 1-index

        if (!row.title) {
            errors.push(`Row ${rowNum}: missing required field "title"`)
            continue
        }

        const status = row.status?.toLowerCase()
        const amount = row.amount ? parseFloat(row.amount.replace(/[$,\s]/g, '')) : null

        if (row.amount && (amount === null || isNaN(amount))) {
            errors.push(`Row ${rowNum}: invalid amount "${row.amount}"`)
            continue
        }

        grants.push({
            organization_id: profile.organization_id,
            title: row.title,
            funder: row.funder || null,
            amount: amount,
            status: VALID_STATUSES.includes(status) ? status : 'pending',
            start_date: row.start_date || null,
            end_date: row.end_date || null,
            compliance_requirements: row.compliance_requirements || null,
        })
    }

    if (grants.length === 0) {
        return NextResponse.json({ error: 'No valid rows to import', details: errors }, { status: 400 })
    }

    // Duplicate check — fetch existing titles for this org
    const { data: existing } = await admin
        .from('grants')
        .select('title')
        .eq('organization_id', profile.organization_id)

    const existingTitles = new Set((existing ?? []).map((g: { title: string }) => g.title.toLowerCase()))

    const deduped: object[] = []
    let duplicates = 0
    for (const grant of grants) {
        const g = grant as { title: string }
        if (existingTitles.has(g.title.toLowerCase())) {
            errors.push(`Skipped duplicate: "${g.title}"`)
            duplicates++
        } else {
            deduped.push(grant)
            existingTitles.add(g.title.toLowerCase()) // prevent intra-file dupes too
        }
    }

    if (deduped.length === 0) {
        return NextResponse.json({ error: 'All rows are duplicates of existing grants', details: errors }, { status: 400 })
    }

    const { error } = await admin.from('grants').insert(deduped)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ imported: deduped.length, skipped: errors.length - duplicates + duplicates, duplicates, details: errors })
}
