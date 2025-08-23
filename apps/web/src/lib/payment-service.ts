import { loadStripe } from '@stripe/stripe-js'
import { createClient } from './supabase'
import { Payment, SubscriptionPlan } from '@database-gui/types'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export class PaymentService {
    private supabase = createClient()

    async createCheckoutSession(planId: string, userId: string): Promise<string> {
        const response = await fetch('/api/stripe/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ planId, userId })
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to create checkout session')
        }

        const { sessionId } = await response.json()
        return sessionId
    }

    async redirectToCheckout(sessionId: string): Promise<void> {
        const stripe = await stripePromise
        if (!stripe) {
            throw new Error('Stripe failed to load')
        }

        const { error } = await stripe.redirectToCheckout({ sessionId })
        if (error) {
            throw new Error(error.message)
        }
    }

    async createPortalSession(userId: string): Promise<string> {
        const response = await fetch('/api/stripe/create-portal-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId })
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to create portal session')
        }

        const { url } = await response.json()
        return url
    }

    async getPaymentHistory(userId: string): Promise<Payment[]> {
        const { data, error } = await this.supabase
            .from('payments')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching payment history:', error)
            throw new Error('Failed to fetch payment history')
        }

        return data || []
    }

    async upgradeSubscription(planId: string, userId: string): Promise<void> {
        try {
            // Create checkout session
            const sessionId = await this.createCheckoutSession(planId, userId)
            
            // Redirect to Stripe checkout
            await this.redirectToCheckout(sessionId)
        } catch (error) {
            console.error('Error upgrading subscription:', error)
            throw error
        }
    }

    async manageSubscription(userId: string): Promise<void> {
        try {
            // Create portal session
            const portalUrl = await this.createPortalSession(userId)
            
            // Redirect to Stripe customer portal
            window.location.href = portalUrl
        } catch (error) {
            console.error('Error accessing customer portal:', error)
            throw error
        }
    }

    getSubscriptionPlans(): SubscriptionPlan[] {
        return [
            {
                id: 'free',
                name: 'Free',
                description: 'Perfect for getting started with database management',
                price: 0,
                currency: 'USD',
                interval: 'month',
                stripePriceId: '',
                features: [
                    '3 database connections',
                    '10 AI queries per month',
                    '100 query history items',
                    'Community support',
                    'Basic query editor'
                ]
            },
            {
                id: 'pro',
                name: 'Pro',
                description: 'For professionals who need more power and flexibility',
                price: 19,
                currency: 'USD',
                interval: 'month',
                stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
                popular: true,
                features: [
                    '50 database connections',
                    '1,000 AI queries per month',
                    '10,000 query history items',
                    'Email support',
                    'Advanced query editor',
                    'Query optimization suggestions',
                    'Export to multiple formats',
                    'Team collaboration (coming soon)'
                ]
            },
            {
                id: 'enterprise',
                name: 'Enterprise',
                description: 'For teams and organizations with advanced needs',
                price: 99,
                currency: 'USD',
                interval: 'month',
                stripePriceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_monthly',
                features: [
                    'Unlimited database connections',
                    'Unlimited AI queries',
                    'Unlimited query history',
                    'Priority support',
                    'Advanced security features',
                    'SSO integration',
                    'Custom integrations',
                    'Dedicated account manager',
                    'SLA guarantee'
                ]
            }
        ]
    }

    formatPrice(price: number, currency: string): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(price)
    }

    formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }
}

export const paymentService = new PaymentService()