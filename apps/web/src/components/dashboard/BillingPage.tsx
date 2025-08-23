'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import {
    CreditCard,
    Calendar,
    CheckCircle,
    XCircle,
    AlertCircle,
    Download,
    Zap,
    Crown,
    Building,
    ArrowUpCircle,
    ExternalLink
} from 'lucide-react'
import { UserProfile, Payment, SubscriptionPlan, UsageStats } from '@database-gui/types'
import { dashboardService } from '@/lib/dashboard-service'
import { paymentService } from '@/lib/payment-service'

interface BillingPageProps {
    user: User
}

export default function BillingPage({ user }: BillingPageProps) {
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
    const [payments, setPayments] = useState<Payment[]>([])
    const [loading, setLoading] = useState(true)
    const [upgrading, setUpgrading] = useState<string | null>(null)

    useEffect(() => {
        const loadBillingData = async () => {
            try {
                const [profileData, usageData, paymentData] = await Promise.all([
                    dashboardService.getUserProfile(user.id),
                    dashboardService.getUsageStats(user.id),
                    dashboardService.getPaymentHistory(user.id)
                ])

                setProfile(profileData)
                setUsageStats(usageData)
                setPayments(paymentData)
            } catch (error) {
                console.error('Error loading billing data:', error)
            } finally {
                setLoading(false)
            }
        }

        loadBillingData()
    }, [user.id])

    const subscriptionPlans = paymentService.getSubscriptionPlans()

    const handleUpgrade = async (planId: string) => {
        setUpgrading(planId)

        try {
            await paymentService.upgradeSubscription(planId, user.id)
        } catch (error) {
            console.error('Error upgrading plan:', error)
            alert('Failed to initiate upgrade. Please try again.')
        } finally {
            setUpgrading(null)
        }
    }

    const handleManageSubscription = async () => {
        try {
            await paymentService.manageSubscription(user.id)
        } catch (error) {
            console.error('Error accessing customer portal:', error)
            alert('Failed to access subscription management. Please try again.')
        }
    }

    const formatDate = paymentService.formatDate

    const formatPrice = paymentService.formatPrice

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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
                            <div className="h-6 bg-gray-200 rounded mb-4"></div>
                            <div className="h-32 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const currentPlan = subscriptionPlans.find(plan => plan.id === profile?.subscription_tier) || subscriptionPlans[0]
    const aiUsagePercentage = usageStats ? getUsagePercentage(usageStats.ai_queries_used, usageStats.ai_queries_limit) : 0
    const connectionsPercentage = usageStats ? getUsagePercentage(usageStats.connections_used, usageStats.connections_limit) : 0

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Manage your subscription plan and billing information.
                </p>
            </div>

            {/* Current Plan */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Current Plan</h3>
                </div>
                <div className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                {currentPlan.id === 'free' && <Zap className="h-8 w-8 text-gray-600" />}
                                {currentPlan.id === 'pro' && <Crown className="h-8 w-8 text-purple-600" />}
                                {currentPlan.id === 'enterprise' && <Building className="h-8 w-8 text-blue-600" />}
                            </div>
                            <div className="ml-4">
                                <h4 className="text-xl font-semibold text-gray-900">{currentPlan.name}</h4>
                                <p className="text-sm text-gray-600">{currentPlan.description}</p>
                                <p className="text-lg font-medium text-gray-900 mt-1">
                                    {currentPlan.price === 0 ? 'Free' : `${formatPrice(currentPlan.price, currentPlan.currency)}/${currentPlan.interval}`}
                                </p>
                            </div>
                        </div>
                        {currentPlan.id === 'free' ? (
                            <button
                                onClick={() => handleUpgrade('pro')}
                                disabled={upgrading === 'pro'}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                            >
                                {upgrading === 'pro' ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Upgrading...
                                    </>
                                ) : (
                                    <>
                                        <ArrowUpCircle className="h-4 w-4 mr-2" />
                                        Upgrade
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={handleManageSubscription}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                            >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Manage Subscription
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Usage Overview */}
            {usageStats && (
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Usage Overview</h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* AI Queries */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-medium text-gray-900">AI Queries</h4>
                                    <span className={`text-sm font-medium ${getUsageColor(aiUsagePercentage)}`}>
                                        {usageStats.ai_queries_limit === -1
                                            ? `${usageStats.ai_queries_used} / ∞`
                                            : `${usageStats.ai_queries_used} / ${usageStats.ai_queries_limit}`
                                        }
                                    </span>
                                </div>
                                {usageStats.ai_queries_limit !== -1 && (
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${aiUsagePercentage >= 90 ? 'bg-red-500' :
                                                aiUsagePercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                                                }`}
                                            style={{ width: `${Math.min(aiUsagePercentage, 100)}%` }}
                                        ></div>
                                    </div>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    Resets on {formatDate(usageStats.period_end)}
                                </p>
                            </div>

                            {/* Database Connections */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-medium text-gray-900">Database Connections</h4>
                                    <span className={`text-sm font-medium ${getUsageColor(connectionsPercentage)}`}>
                                        {usageStats.connections_limit === -1
                                            ? `${usageStats.connections_used} / ∞`
                                            : `${usageStats.connections_used} / ${usageStats.connections_limit}`
                                        }
                                    </span>
                                </div>
                                {usageStats.connections_limit !== -1 && (
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${connectionsPercentage >= 90 ? 'bg-red-500' :
                                                connectionsPercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                                                }`}
                                            style={{ width: `${Math.min(connectionsPercentage, 100)}%` }}
                                        ></div>
                                    </div>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    Active connections in your account
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Available Plans */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Available Plans</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {subscriptionPlans.map((plan) => {
                            const isCurrentPlan = plan.id === profile?.subscription_tier
                            const canUpgrade = plan.id !== 'free' && profile?.subscription_tier === 'free'

                            return (
                                <div
                                    key={plan.id}
                                    className={`relative rounded-lg border-2 p-6 ${isCurrentPlan
                                        ? 'border-purple-500 bg-purple-50'
                                        : plan.popular
                                            ? 'border-purple-200 bg-white'
                                            : 'border-gray-200 bg-white'
                                        }`}
                                >
                                    {plan.popular && !isCurrentPlan && (
                                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                Most Popular
                                            </span>
                                        </div>
                                    )}

                                    {isCurrentPlan && (
                                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Current Plan
                                            </span>
                                        </div>
                                    )}

                                    <div className="text-center">
                                        <div className="flex items-center justify-center mb-4">
                                            {plan.id === 'free' && <Zap className="h-8 w-8 text-gray-600" />}
                                            {plan.id === 'pro' && <Crown className="h-8 w-8 text-purple-600" />}
                                            {plan.id === 'enterprise' && <Building className="h-8 w-8 text-blue-600" />}
                                        </div>

                                        <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                                        <p className="text-sm text-gray-600 mt-1">{plan.description}</p>

                                        <div className="mt-4">
                                            <span className="text-3xl font-bold text-gray-900">
                                                {plan.price === 0 ? 'Free' : formatPrice(plan.price, plan.currency)}
                                            </span>
                                            {plan.price > 0 && (
                                                <span className="text-sm text-gray-600">/{plan.interval}</span>
                                            )}
                                        </div>
                                    </div>

                                    <ul className="mt-6 space-y-3">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-start">
                                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                                                <span className="text-sm text-gray-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="mt-6">
                                        {isCurrentPlan ? (
                                            <button
                                                disabled
                                                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-500 bg-gray-100 cursor-not-allowed"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Current Plan
                                            </button>
                                        ) : canUpgrade ? (
                                            <button
                                                onClick={() => handleUpgrade(plan.id)}
                                                disabled={upgrading === plan.id}
                                                className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${plan.popular
                                                    ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
                                                    : 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500'
                                                    } focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50`}
                                            >
                                                {upgrading === plan.id ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Upgrading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <ArrowUpCircle className="h-4 w-4 mr-2" />
                                                        Upgrade to {plan.name}
                                                    </>
                                                )}
                                            </button>
                                        ) : (
                                            <button
                                                disabled
                                                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-500 bg-gray-100 cursor-not-allowed"
                                            >
                                                Contact Sales
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Payment History */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Payment History</h3>
                </div>
                <div className="p-6">
                    {payments.length > 0 ? (
                        <div className="space-y-4">
                            {payments.map((payment) => (
                                <div key={payment.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            {payment.status === 'succeeded' ? (
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                            ) : payment.status === 'failed' ? (
                                                <XCircle className="h-5 w-5 text-red-500" />
                                            ) : (
                                                <AlertCircle className="h-5 w-5 text-yellow-500" />
                                            )}
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">
                                                {formatPrice(payment.amount / 100, payment.currency)}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {formatDate(payment.created_at)} • {payment.status}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <button className="text-sm text-primary-600 hover:text-primary-500">
                                            <Download className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <CreditCard className="h-12 w-12 mx-auto" />
                            </div>
                            <p className="text-gray-500">No payment history yet.</p>
                            <p className="text-sm text-gray-400 mt-1">
                                Payments will appear here once you upgrade to a paid plan.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Help Section */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Need Help?</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <a
                            href="/support"
                            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all duration-200"
                        >
                            <AlertCircle className="h-6 w-6 text-primary-600 mr-3" />
                            <div>
                                <h4 className="text-sm font-medium text-gray-900">Billing Support</h4>
                                <p className="text-sm text-gray-500">Get help with billing questions</p>
                            </div>
                        </a>

                        <a
                            href="mailto:billing@databasegui.com"
                            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all duration-200"
                        >
                            <ExternalLink className="h-6 w-6 text-primary-600 mr-3" />
                            <div>
                                <h4 className="text-sm font-medium text-gray-900">Contact Billing</h4>
                                <p className="text-sm text-gray-500">Email our billing team directly</p>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}