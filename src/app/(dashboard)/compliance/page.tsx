'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    ShieldAlert,
    CheckCircle2,
    Clock,
    AlertCircle,
    Sparkles,
    FileSearch,
    Calendar,
    MoreVertical,
    Activity,
    ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

const complianceTasks = [
    {
        id: 1,
        grant: "Community Outreach 2026",
        requirement: "Quarterly Financial Statement",
        dueDate: "2026-03-31",
        status: "in_progress",
        priority: "high"
    },
    {
        id: 2,
        grant: "Local Health Initiative",
        requirement: "Beneficiary Impact Report",
        dueDate: "2026-04-15",
        status: "not_started",
        priority: "medium"
    },
    {
        id: 3,
        grant: "Infrastructure Expansion",
        requirement: "Site Safety Certification",
        dueDate: "2026-02-28",
        status: "overdue",
        priority: "critical"
    }
]

import { toast } from 'sonner'

export default function CompliancePage() {
    const handleAction = (action: string) => {
        toast.success(`${action} initiated`, {
            description: "Mock action triggered successfully.",
        })
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1 italic">Compliance Center</h1>
                    <p className="text-zinc-500 italic">Automated tracking of grant requirements and reporting deadlines.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button
                        onClick={() => handleAction('AI Compliance Scan')}
                        className="bg-purple-600 hover:bg-purple-500 rounded-xl px-6 h-10 text-white font-medium group transition-all active:scale-95"
                    >
                        <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                        AI Compliance Scan
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-bold text-white italic">Requirements Checklist</h2>
                        <div className="flex items-center space-x-4">
                            <span className="flex items-center text-xs text-zinc-500 italic"><div className="w-2 h-2 rounded-full bg-red-500 mr-2" /> Overdue</span>
                            <span className="flex items-center text-xs text-zinc-500 italic"><div className="w-2 h-2 rounded-full bg-blue-500 mr-2" /> Active</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {complianceTasks.map((task) => (
                            <ComplianceCard key={task.id} task={task} />
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="border-purple-500/20 bg-purple-600/5 backdrop-blur-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <ShieldAlert className="w-12 h-12 text-purple-400" />
                        </div>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold text-purple-400 flex items-center">
                                <FileSearch className="w-4 h-4 mr-2" />
                                AI POLICY ANALYSIS
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-xs text-zinc-400 italic leading-relaxed">
                                Found a new requirement in <span className="text-white font-medium">CDPH Grant Agreement v2.1</span>:
                                Bi-annual audits are now required for indirect cost recovery.
                            </p>
                            <Button
                                onClick={() => handleAction('Create Task from AI Analysis')}
                                size="sm" variant="outline" className="w-full text-xs border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 rounded-xl transition-all active:scale-95"
                            >
                                Create Task
                                <ArrowRight className="w-3 h-3 ml-2" />
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-zinc-800 bg-zinc-950">
                        <CardHeader className="pb-3 border-b border-zinc-900">
                            <CardTitle className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center justify-between">
                                <span>Compliance Score</span>
                                <Activity className="w-4 h-4 text-emerald-500" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center">
                                <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="58"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="transparent"
                                            className="text-zinc-900"
                                        />
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="58"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="transparent"
                                            strokeDasharray={364.4}
                                            strokeDashoffset={364.4 * (1 - 0.88)}
                                            className="text-emerald-500"
                                        />
                                    </svg>
                                    <span className="absolute text-2xl font-bold text-white">88%</span>
                                </div>
                                <div className="w-full space-y-2">
                                    <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-zinc-600">
                                        <span>Performance</span>
                                        <span className="text-emerald-500">Good</span>
                                    </div>
                                    <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 w-[88%]" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function ComplianceCard({ task }: any) {
    const statusConfig: any = {
        completed: { color: 'text-emerald-400', icon: CheckCircle2, bg: 'bg-emerald-500/5' },
        in_progress: { color: 'text-blue-400', icon: Clock, bg: 'bg-blue-500/5' },
        not_started: { color: 'text-zinc-500', icon: Clock, bg: 'bg-zinc-500/5' },
        overdue: { color: 'text-red-400', icon: AlertCircle, bg: 'bg-red-500/5' },
    }

    const { color, icon: Icon, bg } = statusConfig[task.status]

    return (
        <Card className="border-white/5 bg-white/5 backdrop-blur-xl hover:border-white/20 transition-all">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className={cn("p-3 rounded-2xl border border-white/5", bg)}>
                            <Icon className={cn("w-6 h-6", color)} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-0.5">{task.requirement}</h3>
                            <p className="text-xs text-zinc-500 italic">{task.grant}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1 text-right">Due Date</p>
                            <div className="flex items-center text-sm font-medium text-white">
                                <Calendar className="w-3.5 h-3.5 mr-2 text-zinc-500" />
                                {task.dueDate}
                            </div>
                        </div>
                        <div className="h-12 w-px bg-white/5" />
                        <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white hover:bg-white/5">
                            <MoreVertical className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
