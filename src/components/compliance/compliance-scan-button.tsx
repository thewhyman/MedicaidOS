'use client'

import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { toast } from 'sonner'

export function ComplianceScanButton() {
    return (
        <Button
            onClick={() => toast.success("AI Compliance Scan initiated", {
                description: "Mock action triggered successfully.",
            })}
            className="bg-purple-600 hover:bg-purple-500 rounded-xl px-6 h-10 text-white font-medium group transition-all active:scale-95"
        >
            <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
            AI Compliance Scan
        </Button>
    )
}
