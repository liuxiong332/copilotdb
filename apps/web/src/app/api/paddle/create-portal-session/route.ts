import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
    try {
        const { userId } = await request.json()

        if (!userId) {
            return NextResponse.json(
                { error: 'Missing user ID' },
                { status: 400 }
            )
        }

        const supabase = createServerClient()

        // Get user's subscription
        const { data: subscription, error: subError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active')
            .single()

        if (subError || !subscription) {
            return NextResponse.json(
                { error: 'No active subscription found' },
                { status: 404 }
            )
        }

        // Create Paddle subscription management URL
        const paddleResponse = await fetch('https://vendors.paddle.com/api/2.0/subscription/users_update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                vendor_id: process.env.PADDLE_VENDOR_ID,
                vendor_auth_code: process.env.PADDLE_API_KEY,
                subscription_id: subscription.paddle_subscription_id,
                return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
            })
        })

        if (!paddleResponse.ok) {
            throw new Error('Failed to create Paddle portal session')
        }

        const paddleData = await paddleResponse.json()

        if (!paddleData.success) {
            throw new Error(paddleData.error?.message || 'Paddle API error')
        }

        return NextResponse.json({
            url: paddleData.response.update_url
        })

    } catch (error) {
        console.error('Error creating Paddle portal session:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}