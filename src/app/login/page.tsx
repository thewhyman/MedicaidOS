'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldCheck, Lock, Mail } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            router.push('/dashboard')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
            </div>

            <Card className="w-full max-w-md border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl relative overflow-hidden transition-all hover:border-white/20">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

                <CardHeader className="space-y-2 text-center pb-8">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                            <ShieldCheck className="w-8 h-8 text-blue-400" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight text-white italic">MedicaidOS</CardTitle>
                    <CardDescription className="text-zinc-400 text-base">
                        Secure access to your financial operating system
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in fade-in slide-in-from-top-1">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
                                <Input
                                    type="email"
                                    placeholder="name@organization.org"
                                    className="bg-zinc-900/50 border-white/10 pl-10 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all text-white h-12"
                                    value={email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    className="bg-zinc-900/50 border-white/10 pl-10 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all text-white h-12"
                                    value={password}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between py-2">
                            <label className="flex items-center space-x-2 text-sm text-zinc-400 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-zinc-900 focus:ring-blue-500/20 transition-all" />
                                <span className="group-hover:text-zinc-300 transition-colors">Remember me</span>
                            </label>
                            <a href="#" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</a>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4 pt-4 pb-8">
                        <Button
                            type="submit"
                            className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
                        </Button>
                        <p className="text-center text-sm text-zinc-500">
                            Don&apos;t have an account?{' '}
                            <a href="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                                Contact your admin
                            </a>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
