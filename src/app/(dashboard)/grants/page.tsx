'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    FileStack,
    Search,
    Plus,
    Filter,
    Sparkles,
    Calendar,
    Building,
    DollarSign,
    MoreVertical,
    CheckCircle2,
    Clock,
    AlertCircle,
    ArrowUpRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

import { toast } from 'sonner'

const grants = [
    {
        id: 1,
        title: "Community Outreach 2026",
        funder: "California Department of Public Health",
        amount: "$250,000",
        status: "active",
        endDate: "2026-12-31",
        matchScore: 98,
    },
    {
        id: 2,
        title: "Healthcare Infrastructure Expansion",
        funder: "Federal Grant Program",
        amount: "$1,200,000",
        status: "pending",
        endDate: "2027-06-30",
        matchScore: 92,
    },
    {
        id: 3,
        title: "Medicaid Renewal Assistance",
        funder: "Local Health Initiative",
        amount: "$85,000",
        status: "completed",
        endDate: "2025-12-31",
        matchScore: 85,
    }
]

export default function GrantsPage() {
    const [searchTerm, setSearchTerm] = useState('')

    const handleAction = (action: string) => {
        toast.success(`${action} initiated`, {
            description: "Mock action triggered successfully.",
        })
    }

    const filteredGrants = grants.filter(g =>
        g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.funder.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1 italic">Grants Management</h1>
                    <p className="text-zinc-500 italic">Track, manage and discover new funding opportunities.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button
                        onClick={() => handleAction('Filter')}
                        variant="outline" className="rounded-xl border-white/5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all active:scale-95"
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </Button>
                    <Button
                        onClick={() => handleAction('New Grant')}
                        className="bg-blue-600 hover:bg-blue-500 rounded-xl px-6 h-10 text-white font-medium transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Grant
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-6">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
                        <Input
                            placeholder="Search by title, funder, or requirements..."
                            className="bg-white/5 border-white/10 pl-12 h-12 text-lg focus:ring-blue-500/20"
                            value={searchTerm}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="space-y-4">
                        {filteredGrants.map((grant) => (
                            <GrantCard key={grant.id} grant={grant} onAction={() => handleAction(`Manage ${grant.title}`)} />
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="border-blue-500/20 bg-blue-600/5 backdrop-blur-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Sparkles className="w-12 h-12 text-blue-400 group-hover:scale-110 transition-transform" />
                        </div>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold text-blue-400 flex items-center">
                                <Sparkles className="w-4 h-4 mr-2" />
                                AI MATCH SUGGESTIONS
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div
                                onClick={() => handleAction('AI Match Details')}
                                className="p-3 bg-white/5 rounded-xl border border-white/10 hover:border-blue-500/30 transition-all cursor-pointer group/item"
                            >
                                <p className="text-sm font-medium text-white mb-1 group-hover/item:text-blue-400">Rural Health Access Grant</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-zinc-500 italic">DHHS • $500k</span>
                                    <span className="text-xs font-bold text-emerald-400">98% Match</span>
                                </div>
                            </div>
                            <div
                                onClick={() => handleAction('AI Match Details')}
                                className="p-3 bg-white/5 rounded-xl border border-white/10 hover:border-blue-500/30 transition-all cursor-pointer group/item"
                            >
                                <p className="text-sm font-medium text-white mb-1 group-hover/item:text-blue-400">Emergency Preparedness</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-zinc-500 italic">FEMA • $120k</span>
                                    <span className="text-xs font-bold text-emerald-400">94% Match</span>
                                </div>
                            </div>
                            <Button
                                onClick={() => handleAction('View all AI suggestions')}
                                variant="ghost" className="w-full text-xs text-blue-400 hover:text-blue-300 hover:bg-transparent p-0 justify-start"
                            >
                                View all suggestions →
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold text-zinc-400 italic">UPCOMING DEADLINES</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Link href="/compliance" className="flex items-start space-x-3 group cursor-pointer">
                                <div className="mt-0.5 p-1.5 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-colors">
                                    <Clock className="w-3 h-3 text-red-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-white group-hover:text-red-400">Financial Report Due</p>
                                    <p className="text-[10px] text-zinc-500 italic">In 2 days • CDP Grant</p>
                                </div>
                            </Link>
                            <Link href="/compliance" className="flex items-start space-x-3 group cursor-pointer">
                                <div className="mt-0.5 p-1.5 bg-amber-500/10 rounded-lg group-hover:bg-amber-500/20 transition-colors">
                                    <Calendar className="w-3 h-3 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-white group-hover:text-amber-400">Grant Renewal Opens</p>
                                    <p className="text-[10px] text-zinc-500 italic">In 14 days • LHI Assist</p>
                                </div>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function GrantCard({ grant, onAction }: any) {
    const statusColors: any = {
        active: 'text-emerald-400 bg-emerald-500/5 border-emerald-500/20',
        pending: 'text-amber-400 bg-amber-500/5 border-amber-500/20',
        completed: 'text-blue-400 bg-blue-500/5 border-blue-500/20',
        cancelled: 'text-zinc-500 bg-zinc-500/5 border-zinc-500/20',
    }

    const statusIcons: Record<string, any> = {
        active: CheckCircle2,
        pending: Clock,
        completed: CheckCircle2,
        cancelled: AlertCircle,
    }
    const StatusIcon = statusIcons[grant.status] || AlertCircle

    return (
        <Card className="border-white/5 bg-white/5 backdrop-blur-xl hover:border-white/20 transition-all group">
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-zinc-900 rounded-2xl border border-white/10 group-hover:border-blue-500/30 transition-all">
                            <FileStack className="w-6 h-6 text-zinc-400 group-hover:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{grant.title}</h3>
                            <div className="flex items-center space-x-4 text-sm text-zinc-500 italic">
                                <span className="flex items-center"><Building className="w-3.5 h-3.5 mr-1.5 text-zinc-600" /> {grant.funder}</span>
                                <span className="flex items-center text-emerald-400/80"><DollarSign className="w-3.5 h-3.5 mr-1" /> {grant.amount}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className={cn("flex items-center px-3 py-1 rounded-full text-xs font-bold border", statusColors[grant.status])}>
                            <StatusIcon className="w-3 h-3 mr-1.5" />
                            {grant.status.charAt(0).toUpperCase() + grant.status.slice(1)}
                        </div>
                        <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white hover:bg-white/5">
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center pt-6 border-t border-white/5">
                    <div>
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">End Date</p>
                        <div className="flex items-center text-sm text-zinc-300">
                            <Calendar className="w-4 h-4 mr-2 text-zinc-500" />
                            {grant.endDate}
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">AI Match Score</p>
                        <div className="flex items-center space-x-3">
                            <div className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
                                    style={{ width: `${grant.matchScore}%` }}
                                />
                            </div>
                            <span className="text-sm font-bold text-white">{grant.matchScore}%</span>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button
                            onClick={onAction}
                            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl px-6 group/btn active:scale-95 transition-all"
                        >
                            Manage Grant
                            <ArrowUpRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
