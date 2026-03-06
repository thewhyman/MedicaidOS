'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
    FileStack,
    Wallet,
    ShieldCheck,
    ArrowUpRight,
    ArrowDownRight,
    TrendingUp,
    Search
} from 'lucide-react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from 'recharts'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import { toast } from 'sonner'

const data = [
    { name: 'Jan', spent: 4000, allocated: 2400 },
    { name: 'Feb', spent: 3000, allocated: 1398 },
    { name: 'Mar', spent: 2000, allocated: 9800 },
    { name: 'Apr', spent: 2780, allocated: 3908 },
    { name: 'May', spent: 1890, allocated: 4800 },
    { name: 'Jun', spent: 2390, allocated: 3800 },
]

const budgetData = [
    { name: 'Direct Services', value: 400, color: '#3b82f6' },
    { name: 'Admin', value: 300, color: '#6366f1' },
    { name: 'Equipment', value: 300, color: '#a855f7' },
    { name: 'Outreach', value: 200, color: '#ec4899' },
]

export default function DashboardPage() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return <div className="min-h-screen bg-zinc-950" />

    const handleExport = () => {
        toast.info("Exporting financial report...", {
            description: "Preparing your organization's health summary.",
        })
    }

    return (
        <div className="space-y-8 relative">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Financial Overview</h1>
                    <p className="text-zinc-400 mt-1">Real-time grant performance and budget tracking.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input
                            placeholder="Search grants..."
                            className="bg-white/5 border-white/10 pl-10 w-64 h-10"
                        />
                    </div>
                    <Button
                        onClick={handleExport}
                        className="bg-blue-600 hover:bg-blue-500 rounded-xl px-6 h-10 text-white font-medium active:scale-95 transition-transform"
                    >
                        Export Report
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link href="/grants" className="block outline-none">
                    <StatCard
                        title="Total Grants Value"
                        value="$1,280,000"
                        change="+12.5%"
                        isPositive={true}
                        icon={FileStack}
                        color="blue"
                    />
                </Link>
                <Link href="/budget" className="block outline-none">
                    <StatCard
                        title="Total Budget Spent"
                        value="$452,300"
                        change="-4.2%"
                        isPositive={false}
                        icon={Wallet}
                        color="indigo"
                    />
                </Link>
                <Link href="/compliance" className="block outline-none">
                    <StatCard
                        title="Compliance Score"
                        value="98.2%"
                        change="+1.2%"
                        isPositive={true}
                        icon={ShieldCheck}
                        color="purple"
                    />
                </Link>
                <Link href="/reporting" className="block outline-none">
                    <StatCard
                        title="Active Forecast"
                        value="$2.4M"
                        change="+18%"
                        isPositive={true}
                        icon={TrendingUp}
                        color="emerald"
                    />
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-white/10 bg-white/5 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-white">Expenditure vs Allocation</CardTitle>
                        <CardDescription className="text-zinc-500 italic">Monthly spend analysis across all active grants</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px] pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#52525b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#52525b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#09090b',
                                        border: '1px solid #ffffff10',
                                        borderRadius: '12px',
                                        color: '#fff'
                                    }}
                                />
                                <Bar dataKey="spent" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="allocated" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-white">Budget Allocation</CardTitle>
                        <CardDescription className="text-zinc-500 italic">By program category</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center pt-4">
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={budgetData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {budgetData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#09090b',
                                            border: '1px solid #ffffff10',
                                            borderRadius: '12px',
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-full space-y-3 mt-4">
                            {budgetData.map((item) => (
                                <div key={item.name} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-zinc-400">{item.name}</span>
                                    </div>
                                    <span className="text-white font-medium">${item.value}k</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function StatCard({ title, value, change, isPositive, icon: Icon, color }: any) {
    const colorMap: any = {
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    }

    return (
        <Card className="border-white/5 bg-white/5 backdrop-blur-xl hover:border-white/20 transition-all group overflow-hidden">
            <CardContent className="p-6 relative">
                <div className={`absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity`}>
                    <Icon className="w-24 h-24" />
                </div>

                <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg border ${colorMap[color]}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div className={cn(
                        "flex items-center text-xs font-medium px-2 py-1 rounded-full",
                        isPositive ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"
                    )}>
                        {isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                        {change}
                    </div>
                </div>
                <div>
                    <p className="text-sm font-medium text-zinc-500 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
                </div>
            </CardContent>
        </Card>
    )
}
