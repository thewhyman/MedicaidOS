export interface Grant {
    id: string
    organization_id: string
    title: string
    funder: string | null
    amount: number | null
    status: 'pending' | 'active' | 'completed' | 'cancelled'
    start_date: string | null
    end_date: string | null
    compliance_requirements: string | null
    created_at: string
}

export interface Budget {
    id: string
    grant_id: string
    category: string
    allocated: number
    spent: number
    created_at: string
}

export interface BudgetWithGrant extends Budget {
    grant: { title: string }
}

export interface ComplianceLog {
    id: string
    grant_id: string
    requirement: string
    status: 'not_started' | 'in_progress' | 'completed' | 'overdue'
    due_date: string | null
    completed_at: string | null
    created_at: string
}

export interface ComplianceLogWithGrant extends ComplianceLog {
    grant: { title: string }
}

export interface DashboardStats {
    totalGrantsValue: number
    totalSpent: number
    totalAllocated: number
    complianceScore: number
    activeGrantsCount: number
    budgetByCategory: Array<{ name: string; allocated: number; spent: number }>
}
