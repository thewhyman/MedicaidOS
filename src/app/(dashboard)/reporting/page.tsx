'use client'

import { useState } from 'react'
import { ReportGenerator } from '@/components/reporting/report-generator'
import { RecentReports } from '@/components/reporting/recent-reports'

export default function ReportingPage() {
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-1 italic">Reporting Center</h1>
                <p className="text-zinc-500 italic">
                    Generate audit-ready reports. Files are stored securely and shared with your organization.
                </p>
            </div>

            <ReportGenerator onGenerated={() => setRefreshTrigger(t => t + 1)} />

            <RecentReports refreshTrigger={refreshTrigger} />
        </div>
    )
}
