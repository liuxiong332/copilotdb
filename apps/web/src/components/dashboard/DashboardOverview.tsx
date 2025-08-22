import { User } from '@supabase/supabase-js'
import { Download, Zap, Shield, Calendar } from 'lucide-react'

interface DashboardOverviewProps {
    user: User
}

const stats = [
    {
        name: 'Account Status',
        value: 'Free Plan',
        icon: Shield,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
    },
    {
        name: 'AI Queries Used',
        value: '3 / 10',
        icon: Zap,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
    },
    {
        name: 'Downloads',
        value: '0',
        icon: Download,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
    },
    {
        name: 'Member Since',
        value: 'Today',
        icon: Calendar,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
    },
]

const quickActions = [
    {
        name: 'Download Windows App',
        description: 'Get the desktop application for Windows',
        href: '/dashboard/downloads',
        icon: Download,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
    },
    {
        name: 'Download macOS App',
        description: 'Get the desktop application for macOS',
        href: '/dashboard/downloads',
        icon: Download,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
    },
    {
        name: 'Upgrade to Pro',
        description: 'Unlock unlimited AI queries and advanced features',
        href: '/dashboard/billing',
        icon: Zap,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
    },
]

export default function DashboardOverview({ user }: DashboardOverviewProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    return (
        <div className="space-y-6">
            {/* Welcome header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back!
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                    Here's what's happening with your Database GUI Client account.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className={`inline-flex items-center justify-center p-3 rounded-md ${stat.bgColor}`}>
                                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            {stat.name}
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {stat.value}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick actions */}
            <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {quickActions.map((action) => (
                        <a
                            key={action.name}
                            href={action.href}
                            className={`relative group ${action.bgColor} p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg hover:shadow-md transition-shadow duration-200`}
                        >
                            <div>
                                <span className={`inline-flex p-3 rounded-lg ${action.bgColor} ring-4 ring-white`}>
                                    <action.icon className={`h-6 w-6 ${action.color}`} />
                                </span>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    <span className="absolute inset-0" aria-hidden="true" />
                                    {action.name}
                                </h3>
                                <p className="mt-2 text-sm text-gray-600">
                                    {action.description}
                                </p>
                            </div>
                        </a>
                    ))}
                </div>
            </div>

            {/* Recent activity placeholder */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Recent Activity
                    </h3>
                    <div className="mt-5">
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <Calendar className="h-12 w-12 mx-auto" />
                            </div>
                            <p className="text-gray-500">No recent activity to show.</p>
                            <p className="text-sm text-gray-400 mt-1">
                                Download the desktop app to start managing your databases.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}