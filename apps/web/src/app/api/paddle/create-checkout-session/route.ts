import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
    try {
        const { planId, userId } = await request.json()

        if (!planId || !userId) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            )
        }

        const supabase = await createServerClient()

        // Verify user exists
        const { data: user, error: userError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (userError || !user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Get plan details
        const plans = {
            pro: {
                priceId: process.env.PADDLE_PRO_PRICE_ID,
                name: 'Pro Plan'
            },
            enterprise: {
                priceId: process.env.PADDLE_ENTERPRISE_PRICE_ID,
                name: 'Enterprise Plan'
            }
        }

        const plan = plans[planId as keyof typeof plans]
        if (!plan) {
            return NextResponse.json(
                { error: 'Invalid plan ID' },
                { status: 400 }
            )
        }

        // Create Paddle checkout session
        const paddleResponse = await fetch('https://vendors.paddle.com/api/2.0/product/generate_pay_link', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                vendor_id: process.env.PADDLE_VENDOR_ID,
                vendor_auth_code: process.env.PADDLE_API_KEY,
                product_id: plan.priceId,
                customer_email: user.email,
                passthrough: JSON.stringify({
                    user_id: userId,
                    plan_id: planId
                }),
                return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
                webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/paddle/webhook`
            })
        })

        if (!paddleResponse.ok) {
            throw new Error('Failed to create Paddle checkout session')
        }

        const paddleData = await paddleResponse.json()

        if (!paddleData.success) {
            throw new Error(paddleData.error?.message || 'Paddle API error')
        }

        return NextResponse.json({
            checkoutUrl: paddleData.response.url
        })

    } catch (error) {
        console.error('Error creating Paddle checkout session:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}