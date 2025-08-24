import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
    try {
        const body = await request.text()
        const signature = request.headers.get('paddle-signature')

        // Verify webhook signature
        if (!verifyPaddleWebhook(body, signature)) {
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 401 }
            )
        }

        const data = JSON.parse(body)
        const supabase = createServerClient()

        switch (data.alert_name) {
            case 'payment_succeeded':
                await handlePaymentSucceeded(data, supabase)
                break
            case 'subscription_created':
                await handleSubscriptionCreated(data, supabase)
                break
            case 'subscription_updated':
                await handleSubscriptionUpdated(data, supabase)
                break
            case 'subscription_cancelled':
                await handleSubscriptionCancelled(data, supabase)
                break
            default:
                console.log('Unhandled Paddle webhook event:', data.alert_name)
        }

        return NextResponse.json({ received: true })

    } catch (error) {
        console.error('Error processing Paddle webhook:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

function verifyPaddleWebhook(body: string, signature: string | null): boolean {
    if (!signature || !process.env.PADDLE_WEBHOOK_SECRET) {
        return false
    }

    const expectedSignature = crypto
        .createHmac('sha1', process.env.PADDLE_WEBHOOK_SECRET)
        .update(body)
        .digest('hex')

    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    )
}

async function handlePaymentSucceeded(data: any, supabase: any) {
    const passthrough = JSON.parse(data.passthrough || '{}')
    
    await supabase.from('payments').insert({
        user_id: passthrough.user_id,
        paddle_payment_id: data.order_id,
        amount: Math.round(parseFloat(data.sale_gross) * 100), // Convert to cents
        currency: data.currency,
        status: 'succeeded',
        payment_method: data.payment_method,
    })
}

async function handleSubscriptionCreated(data: any, supabase: any) {
    const passthrough = JSON.parse(data.passthrough || '{}')
    
    await supabase.from('subscriptions').insert({
        user_id: passthrough.user_id,
        paddle_subscription_id: data.subscription_id,
        status: 'active',
        tier: passthrough.plan_id,
        current_period_start: new Date(data.next_bill_date).toISOString(),
        current_period_end: new Date(data.next_bill_date).toISOString(),
        cancel_at_period_end: false,
    })

    // Update user profile
    await supabase
        .from('user_profiles')
        .update({ 
            subscription_tier: passthrough.plan_id,
            updated_at: new Date().toISOString()
        })
        .eq('id', passthrough.user_id)
}

async function handleSubscriptionUpdated(data: any, supabase: any) {
    await supabase
        .from('subscriptions')
        .update({
            status: data.status === 'active' ? 'active' : 'inactive',
            current_period_end: new Date(data.next_bill_date).toISOString(),
            updated_at: new Date().toISOString()
        })
        .eq('paddle_subscription_id', data.subscription_id)
}

async function handleSubscriptionCancelled(data: any, supabase: any) {
    await supabase
        .from('subscriptions')
        .update({
            status: 'canceled',
            cancel_at_period_end: true,
            updated_at: new Date().toISOString()
        })
        .eq('paddle_subscription_id', data.subscription_id)

    // Update user profile to free tier
    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('paddle_subscription_id', data.subscription_id)
        .single()

    if (subscription) {
        await supabase
            .from('user_profiles')
            .update({ 
                subscription_tier: 'free',
                updated_at: new Date().toISOString()
            })
            .eq('id', subscription.user_id)
    }
}