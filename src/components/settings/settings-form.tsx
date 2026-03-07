'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, User, Building2, Shield, LogOut } from 'lucide-react'

interface ProfileData {
    email: string
    full_name: string
    role: string
    organization: { id: string; name: string } | null
}

const roleColors: Record<string, string> = {
    admin: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    member: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
    viewer: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
}

const labelClass = 'block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5'
const inputClass = 'bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-blue-500/50'

export function SettingsForm() {
    const router = useRouter()
    const [profile, setProfile] = useState<ProfileData | null>(null)
    const [loading, setLoading] = useState(true)

    // Form states
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    // Per-section saving
    const [savingName, setSavingName] = useState(false)
    const [savingEmail, setSavingEmail] = useState(false)
    const [savingPassword, setSavingPassword] = useState(false)
    const [signingOut, setSigningOut] = useState(false)

    useEffect(() => {
        fetch('/api/settings')
            .then(r => r.json())
            .then(data => {
                setProfile(data)
                setName(data.full_name ?? '')
                setEmail(data.email ?? '')
            })
            .catch(() => toast.error('Failed to load profile'))
            .finally(() => setLoading(false))
    }, [])

    async function patch(type: string, extra: object) {
        const res = await fetch('/api/settings', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, ...extra }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? 'Update failed')
        return json
    }

    async function handleSaveName() {
        setSavingName(true)
        try {
            await patch('name', { full_name: name })
            setProfile(p => p ? { ...p, full_name: name } : p)
            toast.success('Name updated')
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : 'Failed to update name')
        } finally { setSavingName(false) }
    }

    async function handleSaveEmail() {
        setSavingEmail(true)
        try {
            await patch('email', { email })
            toast.success('Email updated', { description: 'Check your new inbox to confirm the change.' })
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : 'Failed to update email')
        } finally { setSavingEmail(false) }
    }

    async function handleSavePassword() {
        if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return }
        if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return }
        setSavingPassword(true)
        try {
            await patch('password', { current_password: currentPassword, new_password: newPassword })
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
            toast.success('Password updated')
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : 'Failed to update password')
        } finally { setSavingPassword(false) }
    }

    async function handleSignOut() {
        setSigningOut(true)
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="w-6 h-6 text-zinc-600 animate-spin" />
            </div>
        )
    }

    const initials = (profile?.full_name || profile?.email || '?')
        .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

    return (
        <div className="max-w-2xl space-y-6">

            {/* Profile */}
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-400" /> Profile
                    </CardTitle>
                    <CardDescription className="text-zinc-500 italic text-xs">Update your display name and email address.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 pt-4">
                    {/* Avatar + role */}
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-lg">
                            {initials}
                        </div>
                        <div>
                            <p className="text-white font-semibold">{profile?.full_name || '—'}</p>
                            <p className="text-zinc-500 text-sm">{profile?.email}</p>
                        </div>
                        <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-full border ${roleColors[profile?.role ?? 'member'] ?? roleColors.member}`}>
                            {(profile?.role ?? 'member').charAt(0).toUpperCase() + (profile?.role ?? 'member').slice(1)}
                        </span>
                    </div>

                    {/* Name */}
                    <div>
                        <label className={labelClass}>Full Name</label>
                        <div className="flex gap-3">
                            <Input className={`${inputClass} flex-1`} value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
                            <Button onClick={handleSaveName} disabled={savingName || name === profile?.full_name} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shrink-0">
                                {savingName ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                            </Button>
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className={labelClass}>Email Address</label>
                        <div className="flex gap-3">
                            <Input className={`${inputClass} flex-1`} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
                            <Button onClick={handleSaveEmail} disabled={savingEmail || email === profile?.email} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shrink-0">
                                {savingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                            </Button>
                        </div>
                        <p className="text-[10px] text-zinc-600 mt-1.5">A confirmation email will be sent to the new address.</p>
                    </div>
                </CardContent>
            </Card>

            {/* Organization */}
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-indigo-400" /> Organization
                    </CardTitle>
                    <CardDescription className="text-zinc-500 italic text-xs">Your organization details. Contact support to make changes.</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                    <div>
                        <label className={labelClass}>Organization Name</label>
                        <Input className={`${inputClass} opacity-60`} value={profile?.organization?.name ?? '—'} readOnly />
                    </div>
                    <div>
                        <label className={labelClass}>Organization ID</label>
                        <Input className={`${inputClass} opacity-60 font-mono text-xs`} value={profile?.organization?.id ?? '—'} readOnly />
                    </div>
                    <div>
                        <label className={labelClass}>Your Role</label>
                        <Input className={`${inputClass} opacity-60`} value={(profile?.role ?? 'member').charAt(0).toUpperCase() + (profile?.role ?? 'member').slice(1)} readOnly />
                    </div>
                </CardContent>
            </Card>

            {/* Security */}
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                        <Shield className="w-4 h-4 text-purple-400" /> Security
                    </CardTitle>
                    <CardDescription className="text-zinc-500 italic text-xs">Change your password. You'll need your current password to proceed.</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                    <div>
                        <label className={labelClass}>Current Password</label>
                        <Input className={inputClass} type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" />
                    </div>
                    <div>
                        <label className={labelClass}>New Password</label>
                        <Input className={inputClass} type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 8 characters" />
                    </div>
                    <div>
                        <label className={labelClass}>Confirm New Password</label>
                        <Input className={inputClass} type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password" />
                    </div>
                    <Button
                        onClick={handleSavePassword}
                        disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
                        className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl disabled:opacity-50"
                    >
                        {savingPassword ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating…</> : 'Update Password'}
                    </Button>
                </CardContent>
            </Card>

            {/* Sign out */}
            <Card className="border-red-500/10 bg-red-500/5 backdrop-blur-xl">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                        <LogOut className="w-4 h-4 text-red-400" /> Sign Out
                    </CardTitle>
                    <CardDescription className="text-zinc-500 italic text-xs">Sign out of your account on this device.</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                    <Button
                        onClick={handleSignOut}
                        disabled={signingOut}
                        variant="outline"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl"
                    >
                        {signingOut ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing out…</> : 'Sign Out'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
