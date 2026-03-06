'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    BarChart3,
    FileDown,
    FileText,
    Table as TableIcon,
    Download,
    Calendar,
    Clock,
    CheckCircle2,
    Filter,
    ArrowUpRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

const reportHistory = [
    {
        id: 1,
        name: "Q1 Financial Audit Summary",
        type: "PDF",
        date: "2026-03-05",
        size: "2.4 MB",
        status: "completed"
    },
    {
        id: 2,
        name: "Grant Expenditure Detail",
        type: "Excel",
        date: "2026-03-01",
        size: "1.1 MB",
        status: "completed"
    },
    {
        id: 3,
        name: "Compliance Requirements Matrix",
        type: "PDF",
        date: "2026-02-28",
        size: "850 KB",
        status: "completed"
    }
]

import { toast } from 'sonner'

export default function ReportingPage() {
    const handleAction = (action: string) => {
        toast.success(`${action} initiated`, {
            description: "Mock action triggered successfully.",
        })
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1 italic">Reporting Center</h1>
                    <p className="text-zinc-500 italic">Generate and export comprehensive financial and compliance reports.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button
                        onClick={() => handleAction('Customize Data')}
                        variant="outline" className="rounded-xl border-white/5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all active:scale-95"
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Customize Data
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ExportCard
                    title="Financial Summary"
                    description="Overview of total allocations and spendings across all active grants."
                    icon={FileText}
                    type="PDF/Excel"
                    color="blue"
                    onAction={() => handleAction('Generate Financial Summary')}
                />
                <ExportCard
                    title="Grant Utilization"
                    description="Detailed breakdown of budget line items and remaining funds per grant."
                    icon={TableIcon}
                    type="Excel"
                    color="indigo"
                    onAction={() => handleAction('Generate Grant Utilization')}
                />
                <ExportCard
                    title="Compliance Audit"
                    description="Snapshot of all completed and pending compliance requirements."
                    icon={BarChart3}
                    type="PDF"
                    color="purple"
                    onAction={() => handleAction('Generate Compliance Audit')}
                />
            </div>

            <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold text-white italic">Recent Reports</CardTitle>
                        <CardDescription className="text-zinc-500 italic">History of generated exports for your organization</CardDescription>
                    </div>
                    <Button variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-white/5">
                        Clear History
                    </Button>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="pb-4 px-4 text-xs font-bold text-zinc-600 uppercase tracking-widest">Report Name</th>
                                    <th className="pb-4 px-4 text-xs font-bold text-zinc-600 uppercase tracking-widest text-center">Format</th>
                                    <th className="pb-4 px-4 text-xs font-bold text-zinc-600 uppercase tracking-widest text-center">Generated</th>
                                    <th className="pb-4 px-4 text-xs font-bold text-zinc-600 uppercase tracking-widest text-center">Size</th>
                                    <th className="pb-4 px-4 text-xs font-bold text-zinc-600 uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {reportHistory.map((report) => (
                                    <tr key={report.id} className="group hover:bg-white/5 transition-colors">
                                        <td className="py-5 px-4">
                                            <div className="flex items-center space-x-3">
                                                <div className={cn(
                                                    "p-2 rounded-lg bg-white/5 border border-white/10",
                                                    report.type === 'PDF' ? "text-red-400" : "text-emerald-400"
                                                )}>
                                                    {report.type === 'PDF' ? <FileText className="w-4 h-4" /> : <TableIcon className="w-4 h-4" />}
                                                </div>
                                                <span className="font-medium text-white group-hover:text-blue-400 transition-colors">{report.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-5 px-4 text-zinc-400 text-center italic">{report.type}</td>
                                        <td className="py-5 px-4 text-zinc-400 text-center italic">{report.date}</td>
                                        <td className="py-5 px-4 text-zinc-400 text-center italic">{report.size}</td>
                                        <td className="py-5 px-4 text-right">
                                            <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white hover:bg-white/10 rounded-xl">
                                                <Download className="w-4 h-4 mr-2" />
                                                Download
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Button variant="ghost" className="w-full mt-6 text-sm text-zinc-600 hover:text-zinc-300 hover:bg-transparent uppercase font-bold tracking-widest py-8">
                        Load More Reports
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

function ExportCard({ title, description, icon: Icon, type, color, onAction }: any) {
    const colorMap: any = {
        blue: 'from-blue-500/20 to-transparent border-blue-500/20 text-blue-400',
        indigo: 'from-indigo-500/20 to-transparent border-indigo-500/20 text-indigo-400',
        purple: 'from-purple-500/20 to-transparent border-purple-500/20 text-purple-400',
    }

    return (
        <Card className={cn("border-white/5 bg-white/5 backdrop-blur-xl relative overflow-hidden group hover:border-white/20 transition-all", colorMap[color])}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className={cn("p-2 rounded-xl bg-white/5 border border-white/10", colorMap[color])}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest italic">{type}</span>
                </div>
                <CardTitle className="text-lg font-bold text-white mt-4 italic">{title}</CardTitle>
                <CardDescription className="text-zinc-500 text-xs italic leading-relaxed">{description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
                <Button
                    onClick={onAction}
                    className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl group/btn h-10 transition-all active:scale-95"
                >
                    Generate Report
                    <FileDown className="w-4 h-4 ml-2 group-hover/btn:translate-y-0.5 transition-transform" />
                </Button>
            </CardContent>
        </Card>
    )
}
