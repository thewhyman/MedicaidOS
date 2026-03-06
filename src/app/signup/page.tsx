'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Mail, Lock, User, ShieldCheck } from 'lucide-react'

export default function SignupPage() {
    const [orgName, setOrgName] = useState('')
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const supabase = createClient()
    const router = useRouter()

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // 1. Sign up the user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                }
            }
        })

        if (authError) {
            setError(authError.message)
            setLoading(false)
            return
        }

        if (authData.user) {
            // 2. Create the organization
            const { data: orgData, error: orgError } = await supabase
                .from('organizations')
                .insert({ name: orgName })
                .select()
                .single()

            if (orgError) {
                setError(orgError.message)
                setLoading(false)
                return
            }

            // 3. Create the profile (linking user to org)
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: authData.user.id,
                    organization_id: orgData.id,
                    full_name: fullName,
                    role: 'admin' // First user is admin
                })

            if (profileError) {
                setError(profileError.message)
                setLoading(false)
                return
            }

            router.push('/dashboard')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black py-12 px-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
            </div>

            <Card className="w-full max-w-lg border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl relative overflow-hidden transition-all hover:border-white/20">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500" />

                <CardHeader className="space-y-2 text-center pb-8">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                            <Building2 className="w-8 h-8 text-indigo-400" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight text-white italic">MedicaidOS</CardTitle>
                    <CardDescription className="text-zinc-400 text-base">
                        Initialize your organization&apos;s financial OS
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSignup}>
                    <CardContent className="space-y-6">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in fade-in slide-in-from-top-1">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400 ml-1">Organization Name</label>
                                <div className="relative group">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <Input
                                        placeholder="CareBridge Health"
                                        className="bg-zinc-900/50 border-white/10 pl-10 h-11"
                                        value={orgName}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOrgName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400 ml-1">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <Input
                                        placeholder="John Doe"
                                        className="bg-zinc-900/50 border-white/10 pl-10 h-11"
                                        value={fullName}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                                <Input
                                    type="email"
                                    placeholder="john@organization.org"
                                    className="bg-zinc-900/50 border-white/10 pl-10 h-11"
                                    value={email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400 ml-1">Secure Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    className="bg-zinc-900/50 border-white/10 pl-10 h-11"
                                    value={password}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <p className="text-[10px] text-zinc-500 px-1">Must be at least 8 characters long.</p>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4 pt-4 pb-8">
                        <Button
                            type="submit"
                            className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Creating Organization...' : 'Create Organization & Administrator'}
                        </Button>
                        <p className="text-center text-sm text-zinc-500">
                            Already have an account?{' '}
                            <a href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                                Sign In
                            </a>
                        </p>
                    </CardFooter>
                </form>
            </Card>

            <div className="fixed bottom-8 flex items-center space-x-2 text-zinc-600 text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Enterprise-grade security enabled</span>
            </div>
        </div>
    )
}
