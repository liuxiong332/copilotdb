import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import BillingPage from '@/components/dashboard/BillingPage'

export const metadata: Metadata = {
    title: 'Billing - Database GUI Client',
    description: 'Manage your Database GUI Client subscription and billing information.',
}

export default async function Billing() {
    const supabase = createServerClient()

    const {
        data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
        redirect('/auth/signin')
    }

    return (
        <DashboardLayout>
            <BillingPage user={session.user} />
        </DashboardLayout>
    )
}