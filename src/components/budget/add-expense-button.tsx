'use client'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

export function AddExpenseButton() {
    return (
        <Button
            onClick={() => toast.success("Add Expense initiated", {
                description: "Mock action triggered successfully.",
            })}
            className="bg-indigo-600 hover:bg-indigo-500 rounded-xl px-6 h-10 text-white font-medium transition-all active:scale-95"
        >
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
        </Button>
    )
}
