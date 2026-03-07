'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    FileStack,
    Search,
    Calendar,
    Building,
    DollarSign,
    CheckCircle2,
    Clock,
    AlertCircle,
    Pencil,
    Trash2,
    Plus,
    X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Grant } from '@/types/database'

// ── Types ──────────────────────────────────────────────────────────────────

type GrantStatus = 'pending' | 'active' | 'completed' | 'cancelled'

interface FormState {
    title: string
    funder: string
    amount: string
    status: GrantStatus
    start_date: string
    end_date: string
    compliance_requirements: string
}

function emptyForm(): FormState {
    return { title: '', funder: '', amount: '', status: 'pending', start_date: '', end_date: '', compliance_requirements: '' }
}

function grantToForm(g: Grant): FormState {
    return {
        title: g.title,
        funder: g.funder ?? '',
        amount: g.amount?.toString() ?? '',
        status: g.status,
        start_date: g.start_date ?? '',
        end_date: g.end_date ?? '',
        compliance_requirements: g.compliance_requirements ?? '',
    }
}

// ── Status helpers ─────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
    active: 'text-emerald-400 bg-emerald-500/5 border-emerald-500/20',
    pending: 'text-amber-400 bg-amber-500/5 border-amber-500/20',
    completed: 'text-blue-400 bg-blue-500/5 border-blue-500/20',
    cancelled: 'text-zinc-500 bg-zinc-500/5 border-zinc-500/20',
}

const statusIcons: Record<string, React.ElementType> = {
    active: CheckCircle2,
    pending: Clock,
    completed: CheckCircle2,
    cancelled: AlertCircle,
}

// ── Form modal ─────────────────────────────────────────────────────────────

function GrantFormModal({ grant, onClose }: { grant?: Grant; onClose: () => void }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState<FormState>(grant ? grantToForm(grant) : emptyForm())

    function set(field: keyof FormState, value: string) {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!form.title.trim()) { toast.error('Title is required'); return }

        setLoading(true)
        const body = {
            title: form.title.trim(),
            funder: form.funder || null,
            amount: form.amount !== '' ? Number(form.amount) : null,
            status: form.status,
            start_date: form.start_date || null,
            end_date: form.end_date || null,
            compliance_requirements: form.compliance_requirements || null,
        }

        try {
            const res = await fetch(grant ? `/api/grants/${grant.id}` : '/api/grants', {
                method: grant ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            const json = await res.json()

            if (!res.ok) {
                toast.error(json.error ?? 'Failed to save grant')
            } else {
                toast.success(grant ? 'Grant updated' : 'Grant created')
                router.refresh()
                onClose()
            }
        } catch {
            toast.error('Network error')
        } finally {
            setLoading(false)
        }
    }

    const inputClass = "bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-blue-500/50"
    const labelClass = "block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5"

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
                    <h2 className="text-lg font-bold text-white">{grant ? 'Edit Grant' : 'New Grant'}</h2>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className={labelClass}>Title *</label>
                        <Input
                            className={inputClass}
                            placeholder="Grant title"
                            value={form.title}
                            onChange={e => set('title', e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Funder</label>
                            <Input className={inputClass} placeholder="Organization name" value={form.funder} onChange={e => set('funder', e.target.value)} />
                        </div>
                        <div>
                            <label className={labelClass}>Amount ($)</label>
                            <Input className={inputClass} type="number" min="0" placeholder="0" value={form.amount} onChange={e => set('amount', e.target.value)} />
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Status</label>
                        <select
                            value={form.status}
                            onChange={e => set('status', e.target.value as GrantStatus)}
                            className="w-full h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:border-blue-500/50"
                        >
                            <option value="pending" className="bg-zinc-900">Pending</option>
                            <option value="active" className="bg-zinc-900">Active</option>
                            <option value="completed" className="bg-zinc-900">Completed</option>
                            <option value="cancelled" className="bg-zinc-900">Cancelled</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Start Date</label>
                            <Input className={inputClass} type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
                        </div>
                        <div>
                            <label className={labelClass}>End Date</label>
                            <Input className={inputClass} type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} />
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Compliance Requirements</label>
                        <textarea
                            value={form.compliance_requirements}
                            onChange={e => set('compliance_requirements', e.target.value)}
                            placeholder="e.g. Quarterly financial reports; annual beneficiary assessment"
                            rows={3}
                            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-white/10 bg-white/5 text-zinc-400 hover:text-white">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                            {loading ? 'Saving…' : grant ? 'Save Changes' : 'Create Grant'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ── Grant card ─────────────────────────────────────────────────────────────

function GrantCard({ grant, onEdit }: { grant: Grant; onEdit: () => void }) {
    const StatusIcon = statusIcons[grant.status] ?? AlertCircle
    const router = useRouter()
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [deleting, setDeleting] = useState(false)

    async function handleDelete() {
        setDeleting(true)
        try {
            const res = await fetch(`/api/grants/${grant.id}`, { method: 'DELETE' })
            if (!res.ok) {
                const json = await res.json()
                toast.error(json.error ?? 'Delete failed')
            } else {
                toast.success(`"${grant.title}" deleted`)
                router.refresh()
            }
        } catch {
            toast.error('Network error')
        } finally {
            setDeleting(false)
            setConfirmDelete(false)
        }
    }

    return (
        <Card className="border-white/5 bg-white/5 backdrop-blur-xl hover:border-white/20 transition-all group">
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-zinc-900 rounded-2xl border border-white/10 group-hover:border-blue-500/30 transition-all">
                            <FileStack className="w-6 h-6 text-zinc-400 group-hover:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{grant.title}</h3>
                            <div className="flex items-center space-x-4 text-sm text-zinc-500 italic">
                                {grant.funder && (
                                    <span className="flex items-center">
                                        <Building className="w-3.5 h-3.5 mr-1.5 text-zinc-600" />
                                        {grant.funder}
                                    </span>
                                )}
                                {grant.amount != null && (
                                    <span className="flex items-center text-emerald-400/80">
                                        <DollarSign className="w-3.5 h-3.5 mr-1" />
                                        ${grant.amount.toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className={cn("flex items-center px-3 py-1 rounded-full text-xs font-bold border", statusColors[grant.status])}>
                            <StatusIcon className="w-3 h-3 mr-1.5" />
                            {grant.status.charAt(0).toUpperCase() + grant.status.slice(1)}
                        </div>
                        <Button
                            variant="ghost" size="icon"
                            onClick={onEdit}
                            className="text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10"
                            title="Edit grant"
                        >
                            <Pencil className="w-4 h-4" />
                        </Button>
                        {confirmDelete ? (
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost" size="icon"
                                    disabled={deleting}
                                    onClick={handleDelete}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    title="Confirm delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost" size="icon"
                                    onClick={() => setConfirmDelete(false)}
                                    className="text-zinc-500 hover:text-white hover:bg-white/5"
                                    title="Cancel"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <Button
                                variant="ghost" size="icon"
                                onClick={() => setConfirmDelete(true)}
                                className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                                title="Delete grant"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {grant.end_date && (
                    <div className="pt-4 border-t border-white/5">
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">End Date</p>
                        <div className="flex items-center text-sm text-zinc-300">
                            <Calendar className="w-4 h-4 mr-2 text-zinc-500" />
                            {grant.end_date}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

// ── Grants list ────────────────────────────────────────────────────────────

export function GrantsList({ grants }: { grants: Grant[] }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [modalGrant, setModalGrant] = useState<Grant | null | 'new'>(null)

    const filtered = grants.filter(g =>
        g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (g.funder ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex gap-3">
                <div className="relative group flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
                    <Input
                        placeholder="Search by title or funder..."
                        className="bg-white/5 border-white/10 pl-12 h-12 text-lg focus:ring-blue-500/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button
                    onClick={() => setModalGrant('new')}
                    className="h-12 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl active:scale-95 transition-all shrink-0"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Grant
                </Button>
            </div>

            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <FileStack className="w-12 h-12 text-zinc-700 mb-4" />
                    <p className="text-zinc-400 font-medium">
                        {searchTerm ? 'No grants match your search.' : 'No grants yet.'}
                    </p>
                    <p className="text-zinc-600 text-sm mt-1">
                        {searchTerm ? 'Try a different search term.' : 'Create your first grant to get started.'}
                    </p>
                    {!searchTerm && (
                        <Button
                            onClick={() => setModalGrant('new')}
                            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Grant
                        </Button>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((grant) => (
                        <GrantCard
                            key={grant.id}
                            grant={grant}
                            onEdit={() => setModalGrant(grant)}
                        />
                    ))}
                </div>
            )}

            {modalGrant !== null && (
                <GrantFormModal
                    grant={modalGrant === 'new' ? undefined : modalGrant}
                    onClose={() => setModalGrant(null)}
                />
            )}
        </div>
    )
}
