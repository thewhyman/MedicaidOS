'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    PiggyBank,
    History,
    ArrowRightLeft,
    CheckCircle2,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BudgetWithGrant } from '@/types/database'

interface BudgetContentProps {
    budgets: BudgetWithGrant[]
    totalAllocated: number
    totalSpent: number
}

export function BudgetContent({ budgets, totalAllocated, totalSpent }: BudgetContentProps) {
    const [activeTab, setActiveTab] = useState('overview')

    return (
        <>
            <div className="flex items-center space-x-1 bg-white/5 p-1 rounded-2xl w-fit border border-white/5">
                {['overview', 'reconciliation', 'history'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "px-6 py-2 rounded-xl text-sm font-medium transition-all",
                            activeTab === tab
                                ? "bg-white/10 text-white shadow-lg"
                                : "text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xl">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Total Allocated</p>
                                        <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <p className="text-3xl font-bold text-white">${totalAllocated.toLocaleString()}</p>
                                </CardContent>
                            </Card>
                            <Card className="border-amber-500/20 bg-amber-500/5 backdrop-blur-xl">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">Total Spent</p>
                                        <ArrowDownRight className="w-4 h-4 text-amber-500" />
                                    </div>
                                    <p className="text-3xl font-bold text-white">${totalSpent.toLocaleString()}</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold text-white">Program Expenditures</CardTitle>
                                <CardDescription className="text-zinc-500 italic">Allocation vs actual spend by category</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                {budgets.length === 0 ? (
                                    <p className="text-zinc-500 italic text-sm text-center py-8">No budget categories found.</p>
                                ) : (
                                    budgets.map((b) => {
                                        const pct = b.allocated > 0 ? Math.round((b.spent / b.allocated) * 100) : 0
                                        return (
                                            <div key={b.id} className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 bg-zinc-900 rounded-xl border border-white/5 flex items-center justify-center">
                                                            <PiggyBank className="w-5 h-5 text-zinc-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white">{b.category}</p>
                                                            <p className="text-xs text-zinc-500 italic">{b.grant.title} • Allocated: ${b.allocated.toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-bold text-white">${b.spent.toLocaleString()}</p>
                                                        <p className="text-xs text-zinc-500 italic">{pct}% utilized</p>
                                                    </div>
                                                </div>
                                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            "h-full rounded-full transition-all duration-1000",
                                                            pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-blue-500"
                                                        )}
                                                        style={{ width: `${Math.min(pct, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="border-white/10 bg-white/5 backdrop-blur-xl h-full">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div>
                                    <CardTitle className="text-lg font-bold text-white italic">Recent Activity</CardTitle>
                                    <CardDescription className="text-zinc-500 italic">Latest budget entries</CardDescription>
                                </div>
                                <History className="w-5 h-5 text-zinc-600" />
                            </CardHeader>
                            <CardContent className="space-y-6 pt-4">
                                {budgets.length === 0 ? (
                                    <p className="text-zinc-500 italic text-sm text-center py-4">No activity yet.</p>
                                ) : (
                                    budgets.slice(0, 5).map((b) => (
                                        <div key={b.id} className="flex items-start space-x-4 group cursor-pointer">
                                            <div className="mt-1 p-2 rounded-lg border bg-red-500/5 border-red-500/10">
                                                <ArrowRightLeft className="w-4 h-4 text-red-400" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{b.category}</p>
                                                    <span className="text-sm font-bold text-red-400">-${b.spent.toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs text-zinc-500 italic">{b.grant.title}</p>
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <Button variant="ghost" className="w-full text-xs text-indigo-400 hover:text-indigo-300 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/10">
                                    View full ledger →
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {activeTab === 'reconciliation' && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <AlertCircle className="w-12 h-12 text-zinc-700 mb-4" />
                    <p className="text-zinc-400 font-medium">Reconciliation coming soon.</p>
                    <p className="text-zinc-600 text-sm mt-1">Transaction-level reconciliation will be available once CSV import is enabled.</p>
                </div>
            )}

            {activeTab === 'history' && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <History className="w-12 h-12 text-zinc-700 mb-4" />
                    <p className="text-zinc-400 font-medium">History coming soon.</p>
                    <p className="text-zinc-600 text-sm mt-1">Full transaction history will be available when CSV import is enabled.</p>
                </div>
            )}
        </>
    )
}
