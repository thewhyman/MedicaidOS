'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'

export function ImportCSVButton() {
    const inputRef = useRef<HTMLInputElement>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setLoading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch('/api/grants/import', { method: 'POST', body: formData })
            const json = await res.json()

            if (!res.ok) {
                toast.error(json.error ?? 'Import failed')
            } else {
                const msg = `Imported ${json.imported} grant${json.imported !== 1 ? 's' : ''}`
                if (json.skipped > 0) {
                    toast.warning(`${msg}, ${json.skipped} row${json.skipped !== 1 ? 's' : ''} skipped`)
                } else {
                    toast.success(msg)
                }
                router.refresh()
            }
        } catch {
            toast.error('Network error — import failed')
        } finally {
            setLoading(false)
            // Reset so the same file can be re-selected if needed
            if (inputRef.current) inputRef.current.value = ''
        }
    }

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFile}
            />
            <Button
                variant="outline"
                disabled={loading}
                onClick={() => inputRef.current?.click()}
                className="rounded-xl border-white/5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all active:scale-95"
            >
                <Upload className="w-4 h-4 mr-2" />
                {loading ? 'Importing…' : 'Import CSV'}
            </Button>
        </>
    )
}
