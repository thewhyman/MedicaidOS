import { Button } from '@/components/ui/button'
import { FileSpreadsheet } from 'lucide-react'
import { getBudgetsWithGrants } from '@/lib/supabase/queries'
import { BudgetContent } from '@/components/budget/budget-content'
import { AddExpenseButton } from '@/components/budget/add-expense-button'

export default async function BudgetPage() {
    const budgets = await getBudgetsWithGrants()
    const totalAllocated = budgets.reduce((sum, b) => sum + b.allocated, 0)
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1 italic">Budget Management</h1>
                    <p className="text-zinc-500 italic">Monitor allocations and reconcile expenditures across grants.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button
                        variant="outline"
                        className="rounded-xl border-white/5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all active:scale-95"
                    >
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Import CSV
                    </Button>
                    <AddExpenseButton />
                </div>
            </div>

            <BudgetContent budgets={budgets} totalAllocated={totalAllocated} totalSpent={totalSpent} />
        </div>
    )
}
