'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    PiggyBank,
    History,
    FileSpreadsheet,
    Plus,
    ArrowRightLeft,
    CheckCircle2,
    AlertCircle,
    MoreVertical
} from 'lucide-react'
import { cn } from '@/lib/utils'

import { toast } from 'sonner'

const budgetCategories = [
    {
        id: 1,
        name: "Personnel Costs",
        allocated: 250000,
        spent: 185000,
        percentage: 74,
    },
    {
        id: 2,
        name: "Direct Services",
        allocated: 500000,
        spent: 420000,
        percentage: 84,
    },
    {
        id: 3,
        name: "Infrastructure",
        allocated: 150000,
        spent: 45000,
        percentage: 30,
    }
]

const recentTransactions = [
    {
        id: 1,
        grant: "CDPH Outreach",
        category: "Personnel",
        description: "Payroll - March 2026",
        amount: -45000,
        date: "2026-03-01",
        status: "reconciled"
    },
    {
        id: 2,
        grant: "Local Health Initiative",
        category: "Direct Services",
        description: "Supplies - Vendor Alpha",
        amount: -12500,
        date: "2026-02-28",
        status: "pending"
    }
]

export default function BudgetPage() {
    const [activeTab, setActiveTab] = useState('overview')

    const handleAction = (action: string) => {
        toast.success(`${action} initiated`, {
            description: "Mock action triggered successfully.",
        })
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1 italic">Budget Management</h1>
                    <p className="text-zinc-500 italic">Monitor allocations and reconcile expenditures across grants.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button
                        onClick={() => handleAction('Import CSV')}
                        variant="outline" className="rounded-xl border-white/5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all active:scale-95"
                    >
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Import CSV
                    </Button>
                    <Button
                        onClick={() => handleAction('Add Expense')}
                        className="bg-indigo-600 hover:bg-indigo-500 rounded-xl px-6 h-10 text-white font-medium transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Expense
                    </Button>
                </div>
            </div>

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
                                    <p className="text-3xl font-bold text-white">$900,000</p>
                                </CardContent>
                            </Card>
                            <Card className="border-amber-500/20 bg-amber-500/5 backdrop-blur-xl">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">Total Spent</p>
                                        <ArrowDownRight className="w-4 h-4 text-amber-500" />
                                    </div>
                                    <p className="text-3xl font-bold text-white">$650,000</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold text-white">Program Expenditures</CardTitle>
                                <CardDescription className="text-zinc-500 italic">Allocation vs actual spend by category</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                {budgetCategories.map((category) => (
                                    <div key={category.id} className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-zinc-900 rounded-xl border border-white/5 flex items-center justify-center">
                                                    <PiggyBank className="w-5 h-5 text-zinc-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">{category.name}</p>
                                                    <p className="text-xs text-zinc-500 italic">Allocated: ${category.allocated.toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-white">${category.spent.toLocaleString()}</p>
                                                <p className="text-xs text-zinc-500 italic">{category.percentage}% utilized</p>
                                            </div>
                                        </div>
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-1000",
                                                    category.percentage > 90 ? "bg-red-500" :
                                                        category.percentage > 70 ? "bg-amber-500" : "bg-blue-500"
                                                )}
                                                style={{ width: `${category.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="border-white/10 bg-white/5 backdrop-blur-xl h-full">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div>
                                    <CardTitle className="text-lg font-bold text-white italic">Recent Activity</CardTitle>
                                    <CardDescription className="text-zinc-500 italic">Last 24 hours</CardDescription>
                                </div>
                                <History className="w-5 h-5 text-zinc-600" />
                            </CardHeader>
                            <CardContent className="space-y-6 pt-4">
                                {recentTransactions.map((tx) => (
                                    <div key={tx.id} className="flex items-start space-x-4 group cursor-pointer">
                                        <div className={cn(
                                            "mt-1 p-2 rounded-lg border",
                                            tx.amount < 0 ? "bg-red-500/5 border-red-500/10" : "bg-emerald-500/5 border-emerald-500/10"
                                        )}>
                                            <ArrowRightLeft className={cn("w-4 h-4", tx.amount < 0 ? "text-red-400" : "text-emerald-400")} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{tx.description}</p>
                                                <span className={cn("text-sm font-bold", tx.amount < 0 ? "text-red-400" : "text-emerald-400")}>
                                                    {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs text-zinc-500 italic">{tx.grant} • {tx.category}</p>
                                                <div className="flex items-center">
                                                    {tx.status === 'reconciled' ? (
                                                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                    ) : (
                                                        <AlertCircle className="w-3 h-3 text-amber-500" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <Button variant="ghost" className="w-full text-xs text-indigo-400 hover:text-indigo-300 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/10">
                                    View full ledger →
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    )
}
