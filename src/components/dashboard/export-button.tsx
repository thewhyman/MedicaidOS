'use client'

import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function ExportButton() {
    return (
        <Button
            onClick={() => toast.info("Exporting financial report...", {
                description: "Preparing your organization's health summary.",
            })}
            className="bg-blue-600 hover:bg-blue-500 rounded-xl px-6 h-10 text-white font-medium active:scale-95 transition-transform"
        >
            Export Report
        </Button>
    )
}
