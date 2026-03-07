'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    FileSearch,
    Upload,
    Loader2,
    CheckCircle2,
    Plus,
    FileText,
    X,
    Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Grant } from '@/types/database'

interface ExtractedRequirement {
    requirement: string
    due_date: string | null
    frequency: string | null
    category: string
}

interface AnalysisResult {
    summary: string
    requirements: ExtractedRequirement[]
}

const categoryColors: Record<string, string> = {
    financial: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    progress: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    audit: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    inspection: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    other: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
}

export function PolicyAnalyzer({ grants }: { grants: Grant[] }) {
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [selectedGrantId, setSelectedGrantId] = useState(grants[0]?.id ?? '')
    const [analyzing, setAnalyzing] = useState(false)
    const [result, setResult] = useState<AnalysisResult | null>(null)
    const [saved, setSaved] = useState<Set<number>>(new Set())
    const [saving, setSaving] = useState<Set<number>>(new Set())

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null
        setSelectedFile(file)
        setResult(null)
        setSaved(new Set())
    }

    function clearFile() {
        setSelectedFile(null)
        setResult(null)
        setSaved(new Set())
        if (inputRef.current) inputRef.current.value = ''
    }

    async function handleAnalyze() {
        if (!selectedFile) return

        setAnalyzing(true)
        setResult(null)

        const formData = new FormData()
        formData.append('file', selectedFile)

        try {
            const res = await fetch('/api/compliance/analyze', { method: 'POST', body: formData })
            const json = await res.json()

            if (!res.ok) {
                toast.error(json.error ?? 'Analysis failed')
            } else {
                setResult(json as AnalysisResult)
            }
        } catch {
            toast.error('Network error — analysis failed')
        } finally {
            setAnalyzing(false)
        }
    }

    async function handleSave(index: number, req: ExtractedRequirement) {
        if (!selectedGrantId) { toast.error('Select a grant first'); return }

        setSaving(prev => new Set(prev).add(index))
        try {
            const res = await fetch('/api/compliance/logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    grant_id: selectedGrantId,
                    requirement: req.requirement,
                    due_date: req.due_date,
                }),
            })
            const json = await res.json()

            if (!res.ok) {
                toast.error(json.error ?? 'Failed to save requirement')
            } else {
                setSaved(prev => new Set(prev).add(index))
                toast.success('Added to compliance checklist')
                router.refresh()
            }
        } catch {
            toast.error('Network error')
        } finally {
            setSaving(prev => { const s = new Set(prev); s.delete(index); return s })
        }
    }

    const activeGrants = grants.filter(g => g.status === 'active' || g.status === 'pending')

    return (
        <Card className="border-purple-500/20 bg-purple-600/5 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <FileSearch className="w-12 h-12 text-purple-400" />
            </div>

            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-purple-400 flex items-center">
                    <FileSearch className="w-4 h-4 mr-2" />
                    AI POLICY ANALYSIS
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                <p className="text-xs text-zinc-400 italic leading-relaxed">
                    Upload a grant agreement to automatically extract reporting dates, conditions, and compliance requirements.
                </p>

                {/* Grant selector */}
                {activeGrants.length > 0 && (
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">
                            Link to Grant
                        </label>
                        <select
                            value={selectedGrantId}
                            onChange={e => setSelectedGrantId(e.target.value)}
                            className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white focus:outline-none focus:border-purple-500/50"
                        >
                            {activeGrants.map(g => (
                                <option key={g.id} value={g.id} className="bg-zinc-900">{g.title}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* File picker */}
                <input
                    ref={inputRef}
                    type="file"
                    accept=".txt,.md,.pdf"
                    className="hidden"
                    onChange={handleFileChange}
                />

                {selectedFile ? (
                    <div className="flex items-center gap-2 p-3 rounded-lg border border-purple-500/20 bg-purple-500/5">
                        <FileText className="w-4 h-4 text-purple-400 shrink-0" />
                        <span className="text-xs text-purple-300 truncate flex-1">{selectedFile.name}</span>
                        <button onClick={clearFile} className="text-zinc-500 hover:text-white shrink-0">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => inputRef.current?.click()}
                        className="w-full border border-dashed border-purple-500/30 rounded-lg p-4 text-center hover:border-purple-500/60 hover:bg-purple-500/5 transition-all group"
                    >
                        <Upload className="w-5 h-5 text-purple-500 mx-auto mb-1.5 group-hover:text-purple-400" />
                        <p className="text-xs text-zinc-500 group-hover:text-zinc-400">.txt, .md, .pdf · max 5 MB</p>
                    </button>
                )}

                <Button
                    size="sm"
                    disabled={!selectedFile || analyzing || !selectedGrantId}
                    onClick={handleAnalyze}
                    className="w-full text-xs bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all disabled:opacity-50"
                >
                    {analyzing ? (
                        <>
                            <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                            Analyzing…
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-3 h-3 mr-2" />
                            Analyze Document
                        </>
                    )}
                </Button>

                {/* Results */}
                {result && (
                    <div className="space-y-3 pt-2 border-t border-white/5">
                        {result.summary && (
                            <p className="text-xs text-zinc-400 italic leading-relaxed">{result.summary}</p>
                        )}

                        {result.requirements.length === 0 ? (
                            <p className="text-xs text-zinc-500 italic">No compliance requirements found in this document.</p>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                                    {result.requirements.length} requirement{result.requirements.length !== 1 ? 's' : ''} found
                                </p>
                                {result.requirements.map((req, i) => (
                                    <div
                                        key={i}
                                        className="rounded-lg border border-white/5 bg-white/5 p-3 space-y-2"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-xs font-medium text-white leading-tight">{req.requirement}</p>
                                            <span className={cn(
                                                "shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full border",
                                                categoryColors[req.category] ?? categoryColors.other
                                            )}>
                                                {req.category}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="text-[10px] text-zinc-500 space-x-2">
                                                {req.due_date && <span>Due: {req.due_date}</span>}
                                                {req.frequency && <span>· {req.frequency}</span>}
                                            </div>
                                            {saved.has(i) ? (
                                                <span className="flex items-center text-[10px] text-emerald-400 font-bold">
                                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Saved
                                                </span>
                                            ) : (
                                                <button
                                                    disabled={saving.has(i)}
                                                    onClick={() => handleSave(i, req)}
                                                    className="flex items-center text-[10px] text-purple-400 hover:text-purple-300 font-bold disabled:opacity-50 transition-colors"
                                                >
                                                    {saving.has(i)
                                                        ? <Loader2 className="w-3 h-3 animate-spin" />
                                                        : <><Plus className="w-3 h-3 mr-0.5" /> Add</>
                                                    }
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
