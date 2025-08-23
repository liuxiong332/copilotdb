import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase-server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20'
})

export async function POST(request: NextRequest) {
    try {
        const { userId } = await request.json()

        if (!userId) {
            return NextResponse.json(
                { error: 'Missing user ID' },
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

        // Find or create Stripe customer
        let customer: Stripe.Customer | null = null

        // First, try to find existing customer by email
        const existingCustomers = await stripe.customers.list({
            email: profile.email,
            limit: 1
        })

        if (existingCustomers.data.length > 0) {
            customer = existingCustomers.data[0]
        } else {
            // Create new customer if none exists
            customer = await stripe.customers.create({
                email: profile.email,
                metadata: {
                    userId
                }
            })
        }

        // Create billing portal session
        const session = await stripe.billingPortal.sessions.create({
            customer: customer.id,
            return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing`
        })

        return NextResponse.json({ url: session.url })
    } catch (error) {
        console.error('Error creating portal session:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}