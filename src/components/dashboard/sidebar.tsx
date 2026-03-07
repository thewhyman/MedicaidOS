'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    FileStack,
    Wallet,
    ShieldAlert,
    BarChart3,
    Settings,
    LogOut,
    Plus
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'


const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Grants', href: '/grants', icon: FileStack },
    { name: 'Budget', href: '/budget', icon: Wallet },
    { name: 'Compliance', href: '/compliance', icon: ShieldAlert },
    { name: 'Reporting', href: '/reporting', icon: BarChart3 },
]

export function Sidebar() {
    const pathname = usePathname()
    const supabase = createClient()
    const router = useRouter()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <div className="flex h-full flex-col bg-zinc-950 border-r border-white/5 w-64 fixed left-0 top-0 z-50">
            <div className="flex h-16 items-center px-6 border-b border-white/5">
                <Link href="/dashboard" className="flex items-center space-x-2" suppressHydrationWarning>
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <ShieldAlert className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white italic tracking-tight">MedicaidOS</span>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
                <div>
                    <div className="px-2 mb-4">
                        <button
                            onClick={() => router.push('/grants?new=1')}
                            className="w-full flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl py-2.5 transition-all active:scale-[0.98]"
                            suppressHydrationWarning
                        >
                            <Plus className="w-4 h-4" />
                            <span className="text-sm font-medium">New Grant</span>
                        </button>
                    </div>

                    <nav className="space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    suppressHydrationWarning
                                    className={cn(
                                        "flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                                        isActive
                                            ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                                            : "text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent"
                                    )}
                                >
                                    <item.icon className={cn(
                                        "w-5 h-5",
                                        isActive ? "text-blue-400" : "group-hover:text-white"
                                    )} />
                                    <span>{item.name}</span>
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                <div>
                    <h3 className="px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-4">Support</h3>
                    <nav className="space-y-1">
                        <Link
                            href="/settings"
                            suppressHydrationWarning
                            className={cn(
                                "flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                                pathname === '/settings'
                                    ? "bg-white/10 text-white border border-white/10"
                                    : "text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent"
                            )}
                        >
                            <Settings className="w-5 h-5" />
                            <span>Settings</span>
                        </Link>
                    </nav>
                </div>
            </div>

            <div className="p-4 border-t border-white/5">
                <button
                    onClick={handleSignOut}
                    suppressHydrationWarning
                    className="flex w-full items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    )
}
