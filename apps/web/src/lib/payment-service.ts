import { createClient } from './supabase'
import { Payment, SubscriptionPlan } from '../types'

// Initialize Paddle
declare global {
    interface Window {
        Paddle: any;
    }
}

export class PaymentService {
    private supabase = createClient()

    async initializePaddle(): Promise<void> {
        if (typeof window !== 'undefined' && !window.Paddle) {
            // Load Paddle.js
            const script = document.createElement('script')
            script.src = 'https://cdn.paddle.com/paddle/paddle.js'
            script.async = true
            document.head.appendChild(script)
            
            return new Promise((resolve) => {
                script.onload = () => {
                    window.Paddle.Setup({ 
                        vendor: parseInt(process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID!) 
                    })
                    resolve()
                }
            })
        }
    }

    async createCheckoutSession(planId: string, userId: string): Promise<string> {
        const response = await fetch('/api/paddle/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                planId,
                userId,
            }),
        })

        if (!response.ok) {
            throw new Error('Failed to create checkout session')
        }

        const { checkoutUrl } = await response.json()
        return checkoutUrl
    }

    async redirectToCheckout(checkoutUrl: string): Promise<void> {
        await this.initializePaddle()
        
        if (window.Paddle) {
            window.Paddle.Checkout.open({
                override: checkoutUrl
            })
        } else {
            // Fallback to direct redirect
            window.location.href = checkoutUrl
        }
    }

    async createPortalSession(userId: string): Promise<string> {
        const response = await fetch('/api/paddle/create-portal-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
            }),
        })

        if (!response.ok) {
            throw new Error('Failed to create portal session')
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
            throw new Error(`Failed to fetch payment history: ${error.message}`)
        }

        return data || []
    }

    async upgradeSubscription(planId: string, userId: string): Promise<void> {
        try {
            // Create checkout session
            const checkoutUrl = await this.createCheckoutSession(planId, userId)
            
            // Redirect to Paddle checkout
            await this.redirectToCheckout(checkoutUrl)
        } catch (error) {
            throw new Error(`Failed to upgrade subscription: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    async manageSubscription(userId: string): Promise<void> {
        try {
            // Create portal session
            const portalUrl = await this.createPortalSession(userId)
            
            // Redirect to Paddle customer portal
            window.location.href = portalUrl
        } catch (error) {
            throw new Error(`Failed to manage subscription: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    formatPrice(amount: number, currency: string = 'USD'): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
        }).format(amount)
    }

    formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    getSubscriptionPlans(): SubscriptionPlan[] {
        return [
            {
                id: 'free',
                name: 'Free',
                description: 'Perfect for getting started',
                price: 0,
                currency: 'USD',
                interval: 'month',
                paddlePriceId: '',
                features: [
                    '3 database connections',
                    'Basic query editor',
                    'Export to CSV/JSON',
                    'Community support',
                ],
            },
            {
                id: 'pro',
                name: 'Pro',
                description: 'Best for professionals',
                price: 29,
                currency: 'USD',
                interval: 'month',
                paddlePriceId: process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID || 'price_pro_monthly',
                popular: true,
                features: [
                    'Unlimited database connections',
                    'AI-powered query generation',
                    'Advanced data visualization',
                    'Export to multiple formats',
                    'Priority support',
                    'Query optimization suggestions',
                ],
            },
            {
                id: 'enterprise',
                name: 'Enterprise',
                description: 'For teams and organizations',
                price: 99,
                currency: 'USD',
                interval: 'month',
                paddlePriceId: process.env.NEXT_PUBLIC_PADDLE_ENTERPRISE_PRICE_ID || 'price_enterprise_monthly',
                features: [
                    'Unlimited database connections',
                    'Advanced AI features',
                    'Team collaboration',
                    'Custom integrations',
                    'Dedicated support',
                    'SSO integration',
                    'Advanced security features',
                ],
            },
        ]
    }
}

// Export a singleton instance
export const paymentService = new PaymentService()