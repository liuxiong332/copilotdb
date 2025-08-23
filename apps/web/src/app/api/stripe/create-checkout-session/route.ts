import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase-server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20'
})

export async function POST(request: NextRequest) {
    try {
        const { planId, userId } = await request.json()

        if (!planId || !userId) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            )
        }

        // Get user profile from Supabase
        const supabase = createClient()
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('email')
            .eq('id', userId)
            .single()

        if (profileError || !profile) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Define subscription plans with Stripe price IDs
        const plans = {
            pro: {
                priceId: process.env.STRIPE_PRO_PRICE_ID!,
                name: 'Pro Plan'
            },
            enterprise: {
                priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
                name: 'Enterprise Plan'
            }
        }

        const selectedPlan = plans[planId as keyof typeof plans]
        if (!selectedPlan) {
            return NextResponse.json(
                { error: 'Invalid plan selected' },
                { status: 400 }
            )
        }

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            customer_email: profile.email,
            payment_method_types: ['card'],
            line_items: [
                {
                    price: selectedPlan.priceId,
                    quantity: 1
                }
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing?canceled=true`,
            metadata: {
                userId,
                planId
            },
            subscription_data: {
                metadata: {
                    userId,
                    planId
                }
            }
        })

        return NextResponse.json({ sessionId: session.id })
    } catch (error) {
        console.error('Error creating checkout session:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}