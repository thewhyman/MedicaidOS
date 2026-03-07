'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function ExportButton() {
    const [loading, setLoading] = useState(false)

    async function handleExport() {
        setLoading(true)
        try {
            const res = await fetch('/api/reports/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ report_type: 'financial_summary', format: 'csv' }),
            })

            const contentType = res.headers.get('Content-Type') ?? ''
            if (contentType.startsWith('text/csv')) {
                const blob = await res.blob()
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'financial_summary.csv'
                a.click()
                URL.revokeObjectURL(url)
                toast.success('Financial Summary exported')
                return
            }

            const json = await res.json()
            if (!res.ok) { toast.error(json.error ?? 'Export failed'); return }

            if (json.download_url) {
                const a = document.createElement('a')
                a.href = json.download_url
                a.target = '_blank'
                a.click()
            }
            toast.success('Financial Summary exported', { description: 'Saved to report history' })
        } catch {
            toast.error('Export failed — network error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            onClick={handleExport}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 rounded-xl px-6 h-10 text-white font-medium active:scale-95 transition-transform disabled:opacity-70"
        >
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Exporting…</> : 'Export Report'}
        </Button>
    )
}
