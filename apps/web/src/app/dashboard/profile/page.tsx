import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import ProfilePage from '@/components/dashboard/ProfilePage'

export const metadata: Metadata = {
    title: 'Profile - Database GUI Client',
    description: 'Manage your Database GUI Client profile and account settings.',
}

export default async function Profile() {
    const supabase = await createServerClient()

    const {
        data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
        redirect('/auth/signin')
    }

    return (
        <DashboardLayout>
            <ProfilePage user={session.user} />
        </DashboardLayout>
    )
}