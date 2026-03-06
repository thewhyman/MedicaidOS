'use client'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

export function NewGrantButton() {
    return (
        <Button
            onClick={() => toast.success("New Grant creation triggered", {
                description: "Opening grant initiation workflow.",
            })}
            className="bg-blue-600 hover:bg-blue-500 rounded-xl px-6 h-10 text-white font-medium transition-all active:scale-95"
        >
            <Plus className="w-4 h-4 mr-2" />
            New Grant
        </Button>
    )
}
