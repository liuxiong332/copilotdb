import { NextRequest } from 'next/server'
import { POST } from '../create-checkout-session/route'
import { createClient } from '@/lib/supabase-server'
import Stripe from 'stripe'

// Mock Stripe
jest.mock('stripe')
jest.mock('@/lib/supabase-server')

const mockStripe = {
    checkout: {
        sessions: {
            create: jest.fn()
        }
    }
} as unknown as Stripe

const mockSupabase = {
    from: jest.fn(() => ({
        select: jest.fn(() => ({
            eq: jest.fn(() => ({
                single: jest.fn()
            }))
        }))
    }))
}

// Mock environment variables
process.env.STRIPE_SECRET_KEY = 'sk_test_123'
process.env.STRIPE_PRO_PRICE_ID = 'price_pro_123'
process.env.STRIPE_ENTERPRISE_PRICE_ID = 'price_enterprise_123'
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'

describe('/api/stripe/create-checkout-session', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(Stripe as unknown as jest.Mock).mockImplementation(() => mockStripe)
        ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
    })

    it('should create checkout session for pro plan', async () => {
        const mockProfile = { email: 'test@example.com' }
        mockSupabase.from().select().eq().single.mockResolvedValue({
            data: mockProfile,
            error: null
        })

        mockStripe.checkout.sessions.create.mockResolvedValue({
            id: 'cs_test_123'
        })

        const request = new NextRequest('http://localhost:3000/api/stripe/create-checkout-session', {
            method: 'POST',
            body: JSON.stringify({
                planId: 'pro',
                userId: 'user123'
            })
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.sessionId).toBe('cs_test_123')
        expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith({
            customer_email: 'test@example.com',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: 'price_pro_123',
                    quantity: 1
                }
            ],
            mode: 'subscription',
            success_url: 'http://localhost:3000/dashboard/billing?success=true&session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'http://localhost:3000/dashboard/billing?canceled=true',
            metadata: {
                userId: 'user123',
                planId: 'pro'
            },
            subscription_data: {
                metadata: {
                    userId: 'user123',
                    planId: 'pro'
                }
            }
        })
    })

    it('should create checkout session for enterprise plan', async () => {
        const mockProfile = { email: 'test@example.com' }
        mockSupabase.from().select().eq().single.mockResolvedValue({
            data: mockProfile,
            error: null
        })

        mockStripe.checkout.sessions.create.mockResolvedValue({
            id: 'cs_test_456'
        })

        const request = new NextRequest('http://localhost:3000/api/stripe/create-checkout-session', {
            method: 'POST',
            body: JSON.stringify({
                planId: 'enterprise',
                userId: 'user123'
            })
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.sessionId).toBe('cs_test_456')
        expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
            expect.objectContaining({
                line_items: [
                    {
                        price: 'price_enterprise_123',
                        quantity: 1
                    }
                ]
            })
        )
    })

    it('should return 400 for missing parameters', async () => {
        const request = new NextRequest('http://localhost:3000/api/stripe/create-checkout-session', {
            method: 'POST',
            body: JSON.stringify({
                planId: 'pro'
                // missing userId
            })
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Missing required parameters')
    })

    it('should return 400 for invalid plan', async () => {
        const mockProfile = { email: 'test@example.com' }
        mockSupabase.from().select().eq().single.mockResolvedValue({
            data: mockProfile,
            error: null
        })

        const request = new NextRequest('http://localhost:3000/api/stripe/create-checkout-session', {
            method: 'POST',
            body: JSON.stringify({
                planId: 'invalid',
                userId: 'user123'
            })
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Invalid plan selected')
    })

    it('should return 404 for user not found', async () => {
        mockSupabase.from().select().eq().single.mockResolvedValue({
            data: null,
            error: new Error('User not found')
        })

        const request = new NextRequest('http://localhost:3000/api/stripe/create-checkout-session', {
            method: 'POST',
            body: JSON.stringify({
                planId: 'pro',
                userId: 'nonexistent'
            })
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(404)
        expect(data.error).toBe('User not found')
    })

    it('should handle Stripe errors', async () => {
        const mockProfile = { email: 'test@example.com' }
        mockSupabase.from().select().eq().single.mockResolvedValue({
            data: mockProfile,
            error: null
        })

        mockStripe.checkout.sessions.create.mockRejectedValue(new Error('Stripe error'))

        const request = new NextRequest('http://localhost:3000/api/stripe/create-checkout-session', {
            method: 'POST',
            body: JSON.stringify({
                planId: 'pro',
                userId: 'user123'
            })
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Internal server error')
    })
})