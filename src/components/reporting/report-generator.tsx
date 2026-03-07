'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
    BarChart3,
    FileDown,
    FileText,
    Table as TableIcon,
    Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Format = 'csv' | 'html'
type ReportType = 'financial_summary' | 'grant_utilization' | 'compliance_audit'

interface ReportConfig {
    type: ReportType
    title: string
    description: string
    icon: React.ElementType
    formats: Format[]
    color: string
}

const REPORTS: ReportConfig[] = [
    {
        type: 'financial_summary',
        title: 'Financial Summary',
        description: 'Overview of total allocations and spending across all grants, with budget utilization by category.',
        icon: FileText,
        formats: ['csv', 'html'],
        color: 'blue',
    },
    {
        type: 'grant_utilization',
        title: 'Grant Utilization',
        description: 'Detailed breakdown of budget line items, remaining funds, and utilization percentages per grant.',
        icon: TableIcon,
        formats: ['csv'],
        color: 'indigo',
    },
    {
        type: 'compliance_audit',
        title: 'Compliance Audit',
        description: 'Snapshot of all compliance requirements — status, due dates, and overall compliance score.',
        icon: BarChart3,
        formats: ['csv', 'html'],
        color: 'purple',
    },
]

const colorMap: Record<string, string> = {
    blue: 'border-blue-500/20 text-blue-400',
    indigo: 'border-indigo-500/20 text-indigo-400',
    purple: 'border-purple-500/20 text-purple-400',
}

const formatLabels: Record<Format, string> = {
    csv: 'Excel (CSV)',
    html: 'PDF (HTML)',
}

function triggerDownload(url: string, filename: string) {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
}

export function ReportGenerator({ onGenerated }: { onGenerated: () => void }) {
    const [loading, setLoading] = useState<string | null>(null)
    const [formats, setFormats] = useState<Record<ReportType, Format>>({
        financial_summary: 'csv',
        grant_utilization: 'csv',
        compliance_audit: 'csv',
    })

    async function handleGenerate(report: ReportConfig) {
        const format = formats[report.type]
        setLoading(report.type)

        try {
            const res = await fetch('/api/reports/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ report_type: report.type, format }),
            })

            // If response is a file (Storage unavailable), download directly
            const contentType = res.headers.get('Content-Type') ?? ''
            if (contentType.startsWith('text/csv') || contentType.startsWith('text/html')) {
                const blob = await res.blob()
                const url = URL.createObjectURL(blob)
                triggerDownload(url, `${report.type}.${format}`)
                URL.revokeObjectURL(url)
                toast.success(`${report.title} downloaded`)
                onGenerated()
                return
            }

            const json = await res.json()
            if (!res.ok) {
                toast.error(json.error ?? 'Generation failed')
                return
            }

            if (json.download_url) {
                triggerDownload(json.download_url, `${report.title}.${format}`)
            }
            toast.success(`${report.title} generated`, {
                description: `Saved to report history · ${format.toUpperCase()}`,
            })
            onGenerated()
        } catch {
            toast.error('Network error — generation failed')
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REPORTS.map((report) => {
                const Icon = report.icon
                const isLoading = loading === report.type
                const selectedFormat = formats[report.type]

                return (
                    <Card
                        key={report.type}
                        className={cn(
                            'border-white/5 bg-white/5 backdrop-blur-xl relative overflow-hidden group hover:border-white/20 transition-all',
                            colorMap[report.color]
                        )}
                    >
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className={cn('p-2 rounded-xl bg-white/5 border border-white/10', colorMap[report.color])}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                {report.formats.length > 1 ? (
                                    <select
                                        value={selectedFormat}
                                        onChange={e => setFormats(prev => ({ ...prev, [report.type]: e.target.value as Format }))}
                                        className="text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-zinc-400 focus:outline-none focus:border-white/30"
                                    >
                                        {report.formats.map(f => (
                                            <option key={f} value={f} className="bg-zinc-900">{formatLabels[f]}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <span className="text-[10px] font-bold uppercase tracking-widest italic text-zinc-500">
                                        {formatLabels[report.formats[0]]}
                                    </span>
                                )}
                            </div>
                            <CardTitle className="text-lg font-bold text-white mt-4 italic">{report.title}</CardTitle>
                            <CardDescription className="text-zinc-500 text-xs italic leading-relaxed">{report.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <Button
                                onClick={() => handleGenerate(report)}
                                disabled={isLoading || loading !== null}
                                className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl group/btn h-10 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating…</>
                                ) : (
                                    <>Generate Report <FileDown className="w-4 h-4 ml-2 group-hover/btn:translate-y-0.5 transition-transform" /></>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
