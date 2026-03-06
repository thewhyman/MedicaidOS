import { Sidebar } from '@/components/dashboard/sidebar'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[20%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-[120px]" />
            </div>

            <Sidebar />
            <main className="pl-64 min-h-screen relative">
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
