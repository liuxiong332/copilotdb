'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { Download, Zap, Shield, Database, TrendingUp, CreditCard } from 'lucide-react'
import { UserProfile, UsageStats } from '@database-gui/types'
import BillingNotifications from './BillingNotifications'
import { dashboardService } from '@/lib/dashboard-service'

interface DashboardOverviewProps {
    user: User
}

export default function DashboardOverview({ user }: DashboardOverviewProps) {
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
    const [downloadStats, setDownloadStats] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const [profileData, usageData, downloadData] = await Promise.all([
                    dashboardService.getUserProfile(user.id),
                    dashboardService.getUsageStats(user.id),
                    dashboardService.getDownloadStats(user.id)
                ])

                setProfile(profileData)
                setUsageStats(usageData)
                setDownloadStats(downloadData)
            } catch (error) {
                console.error('Error loading dashboard data:', error)
            } finally {
                setLoading(false)
            }
        }

        loadDashboardData()
    }, [user.id])

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    const getSubscriptionDisplayName = (tier: string) => {
        switch (tier) {
            case 'pro': return 'Pro Plan'
            case 'enterprise': return 'Enterprise Plan'
            default: return 'Free Plan'
        }
    }

    const getUsagePercentage = (used: number, limit: number) => {
        if (limit === -1) return 0 // unlimited
        return Math.min((used / limit) * 100, 100)
    }

    const getUsageColor = (percentage: number) => {
        if (percentage >= 90) return 'text-red-600'
        if (percentage >= 70) return 'text-yellow-600'
        return 'text-green-600'
    }

    const getUsageBgColor = (percentage: number) => {
        if (percentage >= 90) return 'bg-red-100'
        if (percentage >= 70) return 'bg-yellow-100'
        return 'bg-green-100'
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white p-5 rounded-lg shadow animate-pulse">
                            <div className="h-12 bg-gray-200 rounded mb-3"></div>
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const aiUsagePercentage = usageStats ? getUsagePercentage(usageStats.ai_queries_used, usageStats.ai_queries_limit) : 0
    const connectionsPercentage = usageStats ? getUsagePercentage(usageStats.connections_used, usageStats.connections_limit) : 0

    const stats = [
        {
            name: 'Account Status',
            value: profile ? getSubscriptionDisplayName(profile.subscription_tier) : 'Free Plan',
            icon: Shield,
            color: profile?.subscription_tier === 'free' ? 'text-gray-600' : 'text-green-600',
            bgColor: profile?.subscription_tier === 'free' ? 'bg-gray-100' : 'bg-green-100',
        },
        {
            name: 'AI Queries Used',
            value: usageStats 
                ? usageStats.ai_queries_limit === -1 
                    ? `${usageStats.ai_queries_used} / ∞`
                    : `${usageStats.ai_queries_used} / ${usageStats.ai_queries_limit}`
                : '0 / 10',
            icon: Zap,
            color: getUsageColor(aiUsagePercentage),
            bgColor: getUsageBgColor(aiUsagePercentage),
            percentage: aiUsagePercentage,
        },
        {
            name: 'Database Connections',
            value: usageStats 
                ? usageStats.connections_limit === -1 
                    ? `${usageStats.connections_used} / ∞`
                    : `${usageStats.connections_used} / ${usageStats.connections_limit}`
                : '0 / 3',
            icon: Database,
            color: getUsageColor(connectionsPercentage),
            bgColor: getUsageBgColor(connectionsPercentage),
            percentage: connectionsPercentage,
        },
        {
            name: 'Downloads',
            value: downloadStats.length.toString(),
            icon: Download,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
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
            name: profile?.subscription_tier === 'free' ? 'Upgrade to Pro' : 'Manage Billing',
            description: profile?.subscription_tier === 'free' 
                ? 'Unlock unlimited AI queries and advanced features'
                : 'View billing history and manage your subscription',
            href: '/dashboard/billing',
            icon: profile?.subscription_tier === 'free' ? TrendingUp : CreditCard,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
        },
    ]

    return (
        <div className="space-y-6">
            {/* Welcome header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back{profile ? `, ${user.email?.split('@')[0]}` : ''}!
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                    Here's what's happening with your Database GUI Client account.
                </p>
            </div>

            {/* Billing notifications */}
            <BillingNotifications user={user} />

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
                                        {stat.percentage !== undefined && stat.percentage > 0 && (
                                            <dd className="mt-1">
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div 
                                                        className={`h-2 rounded-full ${
                                                            stat.percentage >= 90 ? 'bg-red-500' :
                                                            stat.percentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                                                        }`}
                                                        style={{ width: `${Math.min(stat.percentage, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </dd>
                                        )}
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Usage alerts */}
            {usageStats && (
                <div className="space-y-3">
                    {usageStats.ai_queries_limit !== -1 && aiUsagePercentage >= 80 && (
                        <div className={`rounded-md p-4 ${aiUsagePercentage >= 90 ? 'bg-red-50' : 'bg-yellow-50'}`}>
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <Zap className={`h-5 w-5 ${aiUsagePercentage >= 90 ? 'text-red-400' : 'text-yellow-400'}`} />
                                </div>
                                <div className="ml-3">
                                    <h3 className={`text-sm font-medium ${aiUsagePercentage >= 90 ? 'text-red-800' : 'text-yellow-800'}`}>
                                        {aiUsagePercentage >= 90 ? 'AI Query Limit Almost Reached' : 'AI Query Usage High'}
                                    </h3>
                                    <div className={`mt-2 text-sm ${aiUsagePercentage >= 90 ? 'text-red-700' : 'text-yellow-700'}`}>
                                        <p>
                                            You've used {usageStats.ai_queries_used} of {usageStats.ai_queries_limit} AI queries this month.
                                            {aiUsagePercentage >= 90 && ' Consider upgrading to Pro for unlimited queries.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {usageStats.connections_limit !== -1 && connectionsPercentage >= 80 && (
                        <div className={`rounded-md p-4 ${connectionsPercentage >= 90 ? 'bg-red-50' : 'bg-yellow-50'}`}>
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <Database className={`h-5 w-5 ${connectionsPercentage >= 90 ? 'text-red-400' : 'text-yellow-400'}`} />
                                </div>
                                <div className="ml-3">
                                    <h3 className={`text-sm font-medium ${connectionsPercentage >= 90 ? 'text-red-800' : 'text-yellow-800'}`}>
                                        {connectionsPercentage >= 90 ? 'Connection Limit Almost Reached' : 'Connection Usage High'}
                                    </h3>
                                    <div className={`mt-2 text-sm ${connectionsPercentage >= 90 ? 'text-red-700' : 'text-yellow-700'}`}>
                                        <p>
                                            You have {usageStats.connections_used} of {usageStats.connections_limit} database connections.
                                            {connectionsPercentage >= 90 && ' Consider upgrading to Pro for unlimited connections.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

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

            {/* Recent downloads */}
            {downloadStats.length > 0 && (
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                            Recent Downloads
                        </h3>
                        <div className="space-y-3">
                            {downloadStats.slice(0, 5).map((download) => (
                                <div key={download.downloaded_at} className="flex items-center justify-between py-2">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <Download className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">
                                                {download.platform === 'windows' ? 'Windows' : 'macOS'} App v{download.version}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {formatDate(download.downloaded_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Recent activity placeholder for new users */}
            {downloadStats.length === 0 && (
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Get Started
                        </h3>
                        <div className="mt-5">
                            <div className="text-center py-12">
                                <div className="text-gray-400 mb-4">
                                    <Download className="h-12 w-12 mx-auto" />
                                </div>
                                <p className="text-gray-500">Ready to start managing your databases?</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    Download the desktop app to connect to your databases and start querying.
                                </p>
                                <div className="mt-6">
                                    <a
                                        href="/dashboard/downloads"
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download Now
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}