'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { 
    CheckCircle, 
    AlertTriangle, 
    XCircle, 
    Clock,
    CreditCard,
    Calendar,
    Bell
} from 'lucide-react'
import { UserProfile, UsageStats } from '@database-gui/types'
import { dashboardService } from '@/lib/dashboard-service'
import { paymentService } from '@/lib/payment-service'

interface SubscriptionStatusProps {
    user: User
}

export default function SubscriptionStatus({ user }: SubscriptionStatusProps) {
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            try {
                const [profileData, usageData] = await Promise.all([
                    dashboardService.getUserProfile(user.id),
                    dashboardService.getUsageStats(user.id)
                ])

                setProfile(profileData)
                setUsageStats(usageData)
            } catch (error) {
                console.error('Error loading subscription status:', error)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [user.id])

    if (loading || !profile || !usageStats) {
        return (
            <div className="bg-white shadow rounded-lg p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                </div>
            </div>
        )
    }

    const getStatusIcon = (tier: string) => {
        switch (tier) {
            case 'pro':
            case 'enterprise':
                return <CheckCircle className="h-5 w-5 text-green-500" />
            case 'free':
            default:
                return <Clock className="h-5 w-5 text-gray-500" />
        }
    }

    const getStatusColor = (tier: string) => {
        switch (tier) {
            case 'pro':
            case 'enterprise':
                return 'text-green-700 bg-green-50 border-green-200'
            case 'free':
            default:
                return 'text-gray-700 bg-gray-50 border-gray-200'
        }
    }

    const getUsageWarnings = () => {
        const warnings = []

        // Check AI usage
        if (usageStats.ai_queries_limit !== -1) {
            const aiUsagePercentage = (usageStats.ai_queries_used / usageStats.ai_queries_limit) * 100
            if (aiUsagePercentage >= 90) {
                warnings.push({
                    type: 'error',
                    message: `You've used ${usageStats.ai_queries_used} of ${usageStats.ai_queries_limit} AI queries (${Math.round(aiUsagePercentage)}%)`
                })
            } else if (aiUsagePercentage >= 70) {
                warnings.push({
                    type: 'warning',
                    message: `You've used ${usageStats.ai_queries_used} of ${usageStats.ai_queries_limit} AI queries (${Math.round(aiUsagePercentage)}%)`
                })
            }
        }

        // Check connection usage
        if (usageStats.connections_limit !== -1) {
            const connectionUsagePercentage = (usageStats.connections_used / usageStats.connections_limit) * 100
            if (connectionUsagePercentage >= 90) {
                warnings.push({
                    type: 'error',
                    message: `You're using ${usageStats.connections_used} of ${usageStats.connections_limit} database connections (${Math.round(connectionUsagePercentage)}%)`
                })
            } else if (connectionUsagePercentage >= 70) {
                warnings.push({
                    type: 'warning',
                    message: `You're using ${usageStats.connections_used} of ${usageStats.connections_limit} database connections (${Math.round(connectionUsagePercentage)}%)`
                })
            }
        }

        return warnings
    }

    const warnings = getUsageWarnings()
    const periodEndDate = new Date(usageStats.period_end)
    const daysUntilReset = Math.ceil((periodEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

    return (
        <div className="space-y-4">
            {/* Subscription Status */}
            <div className={`border rounded-lg p-4 ${getStatusColor(profile.subscription_tier)}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        {getStatusIcon(profile.subscription_tier)}
                        <div className="ml-3">
                            <h3 className="text-sm font-medium">
                                {profile.subscription_tier === 'free' ? 'Free Plan' : 
                                 profile.subscription_tier === 'pro' ? 'Pro Plan' : 'Enterprise Plan'}
                            </h3>
                            <p className="text-xs">
                                {profile.subscription_tier === 'free' 
                                    ? 'Upgrade to unlock more features'
                                    : 'Active subscription'
                                }
                            </p>
                        </div>
                    </div>
                    {profile.subscription_tier === 'free' && (
                        <button
                            onClick={() => window.location.href = '/dashboard/billing'}
                            className="text-xs font-medium text-blue-600 hover:text-blue-500"
                        >
                            Upgrade
                        </button>
                    )}
                </div>
            </div>

            {/* Usage Warnings */}
            {warnings.length > 0 && (
                <div className="space-y-2">
                    {warnings.map((warning, index) => (
                        <div
                            key={index}
                            className={`border rounded-lg p-3 ${
                                warning.type === 'error'
                                    ? 'text-red-700 bg-red-50 border-red-200'
                                    : 'text-yellow-700 bg-yellow-50 border-yellow-200'
                            }`}
                        >
                            <div className="flex items-start">
                                {warning.type === 'error' ? (
                                    <XCircle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                                ) : (
                                    <AlertTriangle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                                )}
                                <div>
                                    <p className="text-sm">{warning.message}</p>
                                    {profile.subscription_tier === 'free' && (
                                        <button
                                            onClick={() => window.location.href = '/dashboard/billing'}
                                            className="text-xs font-medium underline mt-1"
                                        >
                                            Upgrade for more capacity
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Usage Reset Notification */}
            {profile.subscription_tier !== 'enterprise' && daysUntilReset <= 7 && (
                <div className="border border-blue-200 rounded-lg p-3 text-blue-700 bg-blue-50">
                    <div className="flex items-start">
                        <Bell className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                            <p className="text-sm">
                                Your usage limits will reset in {daysUntilReset} day{daysUntilReset !== 1 ? 's' : ''} 
                                ({paymentService.formatDate(usageStats.period_end)})
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}