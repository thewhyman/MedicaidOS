'use client'

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
    Pie,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const PALETTE = ['#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#f97316', '#14b8a6']

interface CategoryData {
    name: string
    allocated: number
    spent: number
}

export function DashboardCharts({ data }: { data: CategoryData[] }) {
    if (data.length === 0) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-center h-[420px]">
                    <p className="text-zinc-500 italic text-sm">No budget data to display yet.</p>
                </Card>
                <Card className="border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-center h-[420px]">
                    <p className="text-zinc-500 italic text-sm">No allocation data.</p>
                </Card>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-white/10 bg-white/5 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-white">Expenditure vs Allocation</CardTitle>
                    <CardDescription className="text-zinc-500 italic">Budget analysis by category across all grants</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px] pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                            <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis
                                stroke="#52525b"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#09090b', border: '1px solid #ffffff10', borderRadius: '12px', color: '#fff' }}
                                formatter={(v: number | undefined, name: string | undefined) => [`$${(v ?? 0).toLocaleString()}`, (name ?? '').charAt(0).toUpperCase() + (name ?? '').slice(1)]}
                            />
                            <Bar dataKey="spent" name="spent" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="allocated" name="allocated" fill="#6366f1" radius={[4, 4, 0, 0]} />
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
                                <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="allocated">
                                    {data.map((_, i) => (
                                        <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                    formatter={(v: number | undefined) => [`$${(v ?? 0).toLocaleString()}`, 'Allocated']}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="w-full space-y-3 mt-4">
                        {data.map((item, i) => (
                            <div key={item.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
                                    <span className="text-zinc-400">{item.name}</span>
                                </div>
                                <span className="text-white font-medium">${(item.allocated / 1000).toFixed(0)}k</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
