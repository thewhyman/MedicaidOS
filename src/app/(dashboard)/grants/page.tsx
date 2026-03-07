import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Filter, Sparkles, Calendar } from 'lucide-react'
import { getGrants } from '@/lib/supabase/queries'
import { GrantsList } from '@/components/grants/grants-list'
import { ImportCSVButton } from '@/components/grants/import-csv-button'

export default async function GrantsPage() {
    const grants = await getGrants()

    const upcomingDeadlines = grants
        .filter(g => g.end_date && g.status === 'active')
        .sort((a, b) => new Date(a.end_date!).getTime() - new Date(b.end_date!).getTime())
        .slice(0, 3)

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1 italic">Grants Management</h1>
                    <p className="text-zinc-500 italic">Track, manage and discover new funding opportunities.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button variant="outline" className="rounded-xl border-white/5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all active:scale-95">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </Button>
                    <ImportCSVButton />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    <GrantsList grants={grants} />
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
                        <CardContent>
                            <p className="text-xs text-zinc-500 italic">
                                AI grant matching is coming soon. Connect your organization profile to receive personalized suggestions.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold text-zinc-400 italic">UPCOMING DEADLINES</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {upcomingDeadlines.length === 0 ? (
                                <p className="text-xs text-zinc-500 italic">No active grants with upcoming end dates.</p>
                            ) : (
                                upcomingDeadlines.map((grant) => (
                                    <Link key={grant.id} href="/compliance" className="flex items-start space-x-3 group cursor-pointer">
                                        <div className="mt-0.5 p-1.5 bg-amber-500/10 rounded-lg group-hover:bg-amber-500/20 transition-colors">
                                            <Calendar className="w-3 h-3 text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-white group-hover:text-amber-400">{grant.title}</p>
                                            <p className="text-[10px] text-zinc-500 italic">Ends {grant.end_date}</p>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
