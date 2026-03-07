'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
    FileText,
    Table as TableIcon,
    Download,
    Share2,
    Trash2,
    X,
    Loader2,
    FolderOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Report {
    id: string
    name: string
    report_type: string
    format: string
    size_bytes: number
    created_at: string
    storage_path: string
}

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

interface RecentReportsProps {
    refreshTrigger: number
}

export function RecentReports({ refreshTrigger }: RecentReportsProps) {
    const [reports, setReports] = useState<Report[]>([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState<string | null>(null)
    const [sharing, setSharing] = useState<string | null>(null)
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

    const fetchReports = useCallback(async () => {
        try {
            const res = await fetch('/api/reports')
            const json = await res.json()
            setReports(json.reports ?? [])
        } catch {
            setReports([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchReports() }, [fetchReports, refreshTrigger])

    async function handleShare(report: Report) {
        setSharing(report.id)
        try {
            const res = await fetch(`/api/reports/${report.id}/share`)
            const json = await res.json()
            if (!res.ok || !json.url) {
                toast.error(json.error ?? 'Could not generate share link')
                return
            }
            await navigator.clipboard.writeText(json.url)
            toast.success('Share link copied to clipboard', {
                description: `Valid for ${json.expires_in} · org members only`,
            })
        } catch {
            toast.error('Failed to copy link')
        } finally {
            setSharing(null)
        }
    }

    async function handleDelete(report: Report) {
        setDeleting(report.id)
        try {
            const res = await fetch(`/api/reports/${report.id}`, { method: 'DELETE' })
            if (!res.ok) {
                const json = await res.json()
                toast.error(json.error ?? 'Delete failed')
            } else {
                toast.success('Report deleted')
                setReports(prev => prev.filter(r => r.id !== report.id))
            }
        } catch {
            toast.error('Network error')
        } finally {
            setDeleting(null)
            setConfirmDelete(null)
        }
    }

    async function handleDownload(report: Report) {
        const res = await fetch(`/api/reports/${report.id}/share`)
        const json = await res.json()
        if (!res.ok || !json.url) { toast.error('Could not retrieve download link'); return }
        const a = document.createElement('a')
        a.href = json.url
        a.target = '_blank'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }

    return (
        <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
            <CardHeader>
                <CardTitle className="text-xl font-bold text-white italic">Recent Reports</CardTitle>
                <CardDescription className="text-zinc-500 italic">
                    Reports are stored securely and shared with your organization · Links expire after 7 days
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 text-zinc-600 animate-spin" />
                    </div>
                ) : reports.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <FolderOpen className="w-10 h-10 text-zinc-700 mb-3" />
                        <p className="text-zinc-500 text-sm italic">No reports generated yet.</p>
                        <p className="text-zinc-600 text-xs mt-1">Generate a report above to see it here.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="pb-4 px-4 text-xs font-bold text-zinc-600 uppercase tracking-widest">Report</th>
                                    <th className="pb-4 px-4 text-xs font-bold text-zinc-600 uppercase tracking-widest text-center">Format</th>
                                    <th className="pb-4 px-4 text-xs font-bold text-zinc-600 uppercase tracking-widest text-center">Generated</th>
                                    <th className="pb-4 px-4 text-xs font-bold text-zinc-600 uppercase tracking-widest text-center">Size</th>
                                    <th className="pb-4 px-4 text-xs font-bold text-zinc-600 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {reports.map((report) => (
                                    <tr key={report.id} className="group hover:bg-white/5 transition-colors">
                                        <td className="py-5 px-4">
                                            <div className="flex items-center space-x-3">
                                                <div className={cn(
                                                    'p-2 rounded-lg bg-white/5 border border-white/10',
                                                    report.format === 'csv' ? 'text-emerald-400' : 'text-red-400'
                                                )}>
                                                    {report.format === 'csv' ? <TableIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                                </div>
                                                <span className="font-medium text-white group-hover:text-blue-400 transition-colors">
                                                    {report.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-5 px-4 text-zinc-400 text-center italic uppercase text-xs font-bold">
                                            {report.format === 'csv' ? 'Excel' : 'PDF'}
                                        </td>
                                        <td className="py-5 px-4 text-zinc-400 text-center italic text-xs">
                                            {formatDate(report.created_at)}
                                        </td>
                                        <td className="py-5 px-4 text-zinc-400 text-center italic text-xs">
                                            {report.size_bytes ? formatBytes(report.size_bytes) : '—'}
                                        </td>
                                        <td className="py-5 px-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost" size="sm"
                                                    onClick={() => handleDownload(report)}
                                                    className="text-zinc-500 hover:text-white hover:bg-white/10 rounded-xl"
                                                    title="Download"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost" size="sm"
                                                    onClick={() => handleShare(report)}
                                                    disabled={sharing === report.id}
                                                    className="text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl"
                                                    title="Copy share link"
                                                >
                                                    {sharing === report.id
                                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                                        : <Share2 className="w-4 h-4" />}
                                                </Button>
                                                {confirmDelete === report.id ? (
                                                    <>
                                                        <Button
                                                            variant="ghost" size="sm"
                                                            onClick={() => handleDelete(report)}
                                                            disabled={deleting === report.id}
                                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl"
                                                            title="Confirm delete"
                                                        >
                                                            {deleting === report.id
                                                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                                                : <Trash2 className="w-4 h-4" />}
                                                        </Button>
                                                        <Button
                                                            variant="ghost" size="sm"
                                                            onClick={() => setConfirmDelete(null)}
                                                            className="text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button
                                                        variant="ghost" size="sm"
                                                        onClick={() => setConfirmDelete(report.id)}
                                                        className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
