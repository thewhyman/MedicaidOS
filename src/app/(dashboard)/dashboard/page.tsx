import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { FileStack, Wallet, ShieldCheck, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { getDashboardStats } from '@/lib/supabase/queries'
import { DashboardCharts } from '@/components/dashboard/charts'
import { ExportButton } from '@/components/dashboard/export-button'

function formatCurrency(value: number): string {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`
    return `$${value.toLocaleString()}`
}

function StatCard({
    title,
    value,
    change,
    isPositive,
    icon: Icon,
    color,
}: {
    title: string
    value: string
    change: string
    isPositive: boolean
    icon: React.ElementType
    color: 'blue' | 'indigo' | 'purple' | 'emerald'
}) {
    const colorMap = {
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    }

    return (
        <Card className="border-white/5 bg-white/5 backdrop-blur-xl hover:border-white/20 transition-all group overflow-hidden">
            <CardContent className="p-6 relative">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
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

export default async function DashboardPage() {
    const stats = await getDashboardStats()
    const budgetUtilization = stats.totalAllocated > 0
        ? Math.round((stats.totalSpent / stats.totalAllocated) * 100)
        : 0

    return (
        <div className="space-y-8 relative">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Financial Overview</h1>
                    <p className="text-zinc-400 mt-1">Real-time grant performance and budget tracking.</p>
                </div>
                <ExportButton />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link href="/grants" className="block outline-none">
                    <StatCard
                        title="Total Grants Value"
                        value={formatCurrency(stats.totalGrantsValue)}
                        change={`${stats.activeGrantsCount} active`}
                        isPositive={stats.activeGrantsCount > 0}
                        icon={FileStack}
                        color="blue"
                    />
                </Link>
                <Link href="/budget" className="block outline-none">
                    <StatCard
                        title="Total Budget Spent"
                        value={formatCurrency(stats.totalSpent)}
                        change={`${budgetUtilization}% utilized`}
                        isPositive={budgetUtilization < 90}
                        icon={Wallet}
                        color="indigo"
                    />
                </Link>
                <Link href="/compliance" className="block outline-none">
                    <StatCard
                        title="Compliance Score"
                        value={`${stats.complianceScore}%`}
                        change={stats.complianceScore >= 80 ? "On track" : "Needs attention"}
                        isPositive={stats.complianceScore >= 80}
                        icon={ShieldCheck}
                        color="purple"
                    />
                </Link>
                <Link href="/reporting" className="block outline-none">
                    <StatCard
                        title="Total Allocated"
                        value={formatCurrency(stats.totalAllocated)}
                        change={`${formatCurrency(stats.totalAllocated - stats.totalSpent)} remaining`}
                        isPositive={stats.totalAllocated >= stats.totalSpent}
                        icon={TrendingUp}
                        color="emerald"
                    />
                </Link>
            </div>

            <DashboardCharts data={stats.budgetByCategory} />
        </div>
    )
}
