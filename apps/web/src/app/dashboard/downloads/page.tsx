import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DownloadsPage from '../../../components/dashboard/DownloadsPage'

export const metadata: Metadata = {
    title: 'Downloads - Database GUI Client',
    description: 'Download the Database GUI Client desktop applications for Windows and macOS.',
}

export default async function Downloads() {
    const supabase = await createServerClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/signin')
    }

    return (
        <DashboardLayout>
            <DownloadsPage user={user} />
        </DashboardLayout>
    )
}