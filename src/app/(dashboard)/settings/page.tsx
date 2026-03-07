import { SettingsForm } from '@/components/settings/settings-form'

export default function SettingsPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-1 italic">Settings</h1>
                <p className="text-zinc-500 italic">Manage your profile, organization details, and account security.</p>
            </div>
            <SettingsForm />
        </div>
    )
}
