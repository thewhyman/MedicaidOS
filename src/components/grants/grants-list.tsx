'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    FileStack,
    Search,
    Calendar,
    Building,
    DollarSign,
    MoreVertical,
    CheckCircle2,
    Clock,
    AlertCircle,
    ArrowUpRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Grant } from '@/types/database'

const statusColors: Record<string, string> = {
    active: 'text-emerald-400 bg-emerald-500/5 border-emerald-500/20',
    pending: 'text-amber-400 bg-amber-500/5 border-amber-500/20',
    completed: 'text-blue-400 bg-blue-500/5 border-blue-500/20',
    cancelled: 'text-zinc-500 bg-zinc-500/5 border-zinc-500/20',
}

const statusIcons: Record<string, React.ElementType> = {
    active: CheckCircle2,
    pending: Clock,
    completed: CheckCircle2,
    cancelled: AlertCircle,
}

function GrantCard({ grant }: { grant: Grant }) {
    const StatusIcon = statusIcons[grant.status] ?? AlertCircle

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
                                {grant.funder && (
                                    <span className="flex items-center">
                                        <Building className="w-3.5 h-3.5 mr-1.5 text-zinc-600" />
                                        {grant.funder}
                                    </span>
                                )}
                                {grant.amount != null && (
                                    <span className="flex items-center text-emerald-400/80">
                                        <DollarSign className="w-3.5 h-3.5 mr-1" />
                                        ${grant.amount.toLocaleString()}
                                    </span>
                                )}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-6 border-t border-white/5">
                    {grant.end_date && (
                        <div>
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">End Date</p>
                            <div className="flex items-center text-sm text-zinc-300">
                                <Calendar className="w-4 h-4 mr-2 text-zinc-500" />
                                {grant.end_date}
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end">
                        <Button
                            onClick={() => toast.success(`Managing ${grant.title}`)}
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

export function GrantsList({ grants }: { grants: Grant[] }) {
    const [searchTerm, setSearchTerm] = useState('')

    const filtered = grants.filter(g =>
        g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (g.funder ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
                <Input
                    placeholder="Search by title or funder..."
                    className="bg-white/5 border-white/10 pl-12 h-12 text-lg focus:ring-blue-500/20"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <FileStack className="w-12 h-12 text-zinc-700 mb-4" />
                    <p className="text-zinc-400 font-medium">
                        {searchTerm ? 'No grants match your search.' : 'No grants yet.'}
                    </p>
                    <p className="text-zinc-600 text-sm mt-1">
                        {searchTerm ? 'Try a different search term.' : 'Create your first grant to get started.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((grant) => (
                        <GrantCard key={grant.id} grant={grant} />
                    ))}
                </div>
            )}
        </div>
    )
}
