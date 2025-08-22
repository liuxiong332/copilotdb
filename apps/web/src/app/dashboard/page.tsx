import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DashboardOverview from '@/components/dashboard/DashboardOverview'

export const metadata: Metadata = {
    title: 'Dashboard - Database GUI Client',
    description: 'Your Database GUI Client dashboard. Download desktop applications and manage your account.',
}

export default async function DashboardPage() {
    const supabase = createServerClient()

    const {
        data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
        redirect('/auth/signin')
    }

    return (
        <DashboardLayout>
            <DashboardOverview user={session.user} />
        </DashboardLayout>
    )
}