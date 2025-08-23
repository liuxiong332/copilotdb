import { paymentService } from '../payment-service'
import { createClient } from '../supabase'

// Mock Stripe
jest.mock('@stripe/stripe-js', () => ({
    loadStripe: jest.fn(() => Promise.resolve({
        redirectToCheckout: jest.fn()
    }))
}))

// Mock Supabase
jest.mock('../supabase', () => ({
    createClient: jest.fn()
}))

// Mock fetch
global.fetch = jest.fn()

describe('PaymentService', () => {
    const mockSupabase = {
        from: jest.fn(() => ({
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    order: jest.fn(() => ({
                        single: jest.fn(),
                        then: jest.fn()
                    }))
                }))
            }))
        }))
    }

    beforeEach(() => {
        jest.clearAllMocks()
        ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
        ;(global.fetch as jest.Mock).mockClear()
    })

    describe('createCheckoutSession', () => {
        it('should create a checkout session successfully', async () => {
            const mockResponse = {
                ok: true,
                json: () => Promise.resolve({ sessionId: 'cs_test_123' })
            }
            ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

            const sessionId = await paymentService.createCheckoutSession('pro', 'user123')

            expect(fetch).toHaveBeenCalledWith('/api/stripe/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ planId: 'pro', userId: 'user123' })
            })
            expect(sessionId).toBe('cs_test_123')
        })

        it('should throw error when API call fails', async () => {
            const mockResponse = {
                ok: false,
                json: () => Promise.resolve({ error: 'Invalid plan' })
            }
            ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

            await expect(paymentService.createCheckoutSession('invalid', 'user123'))
                .rejects.toThrow('Invalid plan')
        })
    })

    describe('createPortalSession', () => {
        it('should create a portal session successfully', async () => {
            const mockResponse = {
                ok: true,
                json: () => Promise.resolve({ url: 'https://billing.stripe.com/session/123' })
            }
            ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

            const url = await paymentService.createPortalSession('user123')

            expect(fetch).toHaveBeenCalledWith('/api/stripe/create-portal-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: 'user123' })
            })
            expect(url).toBe('https://billing.stripe.com/session/123')
        })
    })

    describe('getPaymentHistory', () => {
        it('should fetch payment history successfully', async () => {
            const mockPayments = [
                {
                    id: 'payment1',
                    user_id: 'user123',
                    amount: 1900,
                    currency: 'USD',
                    status: 'succeeded',
                    created_at: '2024-01-01T00:00:00Z'
                }
            ]

            const mockChain = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({ data: mockPayments, error: null })
            }
            mockSupabase.from.mockReturnValue(mockChain)

            const payments = await paymentService.getPaymentHistory('user123')

            expect(mockSupabase.from).toHaveBeenCalledWith('payments')
            expect(payments).toEqual(mockPayments)
        })

        it('should handle errors when fetching payment history', async () => {
            const mockError = new Error('Database error')
            const mockChain = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({ data: null, error: mockError })
            }
            mockSupabase.from.mockReturnValue(mockChain)

            await expect(paymentService.getPaymentHistory('user123'))
                .rejects.toThrow('Failed to fetch payment history')
        })
    })

    describe('getSubscriptionPlans', () => {
        it('should return all subscription plans', () => {
            const plans = paymentService.getSubscriptionPlans()

            expect(plans).toHaveLength(3)
            expect(plans[0].id).toBe('free')
            expect(plans[1].id).toBe('pro')
            expect(plans[2].id).toBe('enterprise')
            expect(plans[1].popular).toBe(true)
        })

        it('should include all required plan properties', () => {
            const plans = paymentService.getSubscriptionPlans()

            plans.forEach(plan => {
                expect(plan).toHaveProperty('id')
                expect(plan).toHaveProperty('name')
                expect(plan).toHaveProperty('description')
                expect(plan).toHaveProperty('price')
                expect(plan).toHaveProperty('currency')
                expect(plan).toHaveProperty('interval')
                expect(plan).toHaveProperty('features')
                expect(plan).toHaveProperty('stripePriceId')
                expect(Array.isArray(plan.features)).toBe(true)
            })
        })
    })

    describe('formatPrice', () => {
        it('should format USD prices correctly', () => {
            expect(paymentService.formatPrice(19, 'USD')).toBe('$19.00')
            expect(paymentService.formatPrice(99, 'USD')).toBe('$99.00')
            expect(paymentService.formatPrice(0, 'USD')).toBe('$0.00')
        })

        it('should format other currencies correctly', () => {
            expect(paymentService.formatPrice(19, 'EUR')).toBe('€19.00')
            expect(paymentService.formatPrice(19, 'GBP')).toBe('£19.00')
        })
    })

    describe('formatDate', () => {
        it('should format dates correctly', () => {
            const date = '2024-01-15T10:30:00Z'
            const formatted = paymentService.formatDate(date)
            expect(formatted).toBe('January 15, 2024')
        })
    })
})