'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { 
    CreditCard, 
    AlertTriangle, 
    CheckCircle, 
    XCircle,
    Calendar,
    DollarSign,
    X
} from 'lucide-react'
import { UserProfile, Payment } from '@database-gui/types'
import { dashboardService } from '@/lib/dashboard-service'
import { paymentService } from '@/lib/payment-service'

interface BillingNotificationsProps {
    user: User
}

interface Notification {
    id: string
    type: 'success' | 'warning' | 'error' | 'info'
    title: string
    message: string
    action?: {
        label: string
        onClick: () => void
    }
    dismissible?: boolean
}

export default function BillingNotifications({ user }: BillingNotificationsProps) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadNotifications = async () => {
            try {
                const [profile, payments] = await Promise.all([
                    dashboardService.getUserProfile(user.id),
                    dashboardService.getPaymentHistory(user.id)
                ])

                if (!profile) return

                const newNotifications: Notification[] = []

                // Check for recent successful payments
                const recentPayments = payments.filter(payment => {
                    const paymentDate = new Date(payment.created_at)
                    const daysSincePayment = (new Date().getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24)
                    return daysSincePayment <= 7 && payment.status === 'succeeded'
                })

                if (recentPayments.length > 0) {
                    const latestPayment = recentPayments[0]
                    newNotifications.push({
                        id: `payment-success-${latestPayment.id}`,
                        type: 'success',
                        title: 'Payment Successful',
                        message: `Your payment of ${paymentService.formatPrice(latestPayment.amount / 100, latestPayment.currency)} was processed successfully.`,
                        dismissible: true
                    })
                }

                // Check for failed payments
                const failedPayments = payments.filter(payment => {
                    const paymentDate = new Date(payment.created_at)
                    const daysSincePayment = (new Date().getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24)
                    return daysSincePayment <= 30 && payment.status === 'failed'
                })

                if (failedPayments.length > 0) {
                    newNotifications.push({
                        id: `payment-failed-${failedPayments[0].id}`,
                        type: 'error',
                        title: 'Payment Failed',
                        message: 'Your recent payment failed. Please update your payment method to continue using premium features.',
                        action: {
                            label: 'Update Payment Method',
                            onClick: () => paymentService.manageSubscription(user.id)
                        },
                        dismissible: true
                    })
                }

                // Check subscription status for free users
                if (profile.subscription_tier === 'free') {
                    newNotifications.push({
                        id: 'upgrade-prompt',
                        type: 'info',
                        title: 'Unlock Premium Features',
                        message: 'Upgrade to Pro or Enterprise to get unlimited AI queries, more database connections, and priority support.',
                        action: {
                            label: 'View Plans',
                            onClick: () => window.location.href = '/dashboard/billing'
                        },
                        dismissible: true
                    })
                }

                // Filter out dismissed notifications
                const visibleNotifications = newNotifications.filter(
                    notification => !dismissedNotifications.has(notification.id)
                )

                setNotifications(visibleNotifications)
            } catch (error) {
                console.error('Error loading billing notifications:', error)
            } finally {
                setLoading(false)
            }
        }

        loadNotifications()
    }, [user.id, dismissedNotifications])

    const dismissNotification = (notificationId: string) => {
        setDismissedNotifications(prev => new Set([...prev, notificationId]))
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-500" />
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />
            case 'error':
                return <XCircle className="h-5 w-5 text-red-500" />
            case 'info':
            default:
                return <CreditCard className="h-5 w-5 text-blue-500" />
        }
    }

    const getNotificationStyles = (type: string) => {
        switch (type) {
            case 'success':
                return 'border-green-200 bg-green-50'
            case 'warning':
                return 'border-yellow-200 bg-yellow-50'
            case 'error':
                return 'border-red-200 bg-red-50'
            case 'info':
            default:
                return 'border-blue-200 bg-blue-50'
        }
    }

    if (loading || notifications.length === 0) {
        return null
    }

    return (
        <div className="space-y-3">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`border rounded-lg p-4 ${getNotificationStyles(notification.type)}`}
                >
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                        </div>
                        <div className="ml-3 flex-1">
                            <h4 className="text-sm font-medium text-gray-900">
                                {notification.title}
                            </h4>
                            <p className="text-sm text-gray-700 mt-1">
                                {notification.message}
                            </p>
                            {notification.action && (
                                <button
                                    onClick={notification.action.onClick}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-500 mt-2"
                                >
                                    {notification.action.label}
                                </button>
                            )}
                        </div>
                        {notification.dismissible && (
                            <button
                                onClick={() => dismissNotification(notification.id)}
                                className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}