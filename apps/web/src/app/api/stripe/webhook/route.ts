import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase-server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
    try {
        const body = await request.text()
        const signature = request.headers.get('stripe-signature')!

        let event: Stripe.Event

        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
        } catch (err) {
            console.error('Webhook signature verification failed:', err)
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 400 }
            )
        }

        const supabase = createClient()

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session
                const userId = session.metadata?.userId
                const planId = session.metadata?.planId

                if (!userId || !planId) {
                    console.error('Missing metadata in checkout session')
                    break
                }

                // Update user subscription tier
                const { error: updateError } = await supabase
                    .from('user_profiles')
                    .update({ 
                        subscription_tier: planId,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', userId)

                if (updateError) {
                    console.error('Error updating user subscription:', updateError)
                }

                // Record payment
                if (session.payment_intent) {
                    const { error: paymentError } = await supabase
                        .from('payments')
                        .insert({
                            user_id: userId,
                            stripe_payment_id: session.payment_intent as string,
                            stripe_subscription_id: session.subscription as string,
                            amount: session.amount_total || 0,
                            currency: session.currency || 'usd',
                            status: 'succeeded',
                            payment_method: 'card'
                        })

                    if (paymentError) {
                        console.error('Error recording payment:', paymentError)
                    }
                }

                break
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice
                const subscriptionId = invoice.subscription as string

                if (subscriptionId) {
                    // Get subscription details
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
                    const userId = subscription.metadata?.userId

                    if (userId) {
                        // Record recurring payment
                        const { error: paymentError } = await supabase
                            .from('payments')
                            .insert({
                                user_id: userId,
                                stripe_payment_id: invoice.payment_intent as string,
                                stripe_subscription_id: subscriptionId,
                                amount: invoice.amount_paid,
                                currency: invoice.currency,
                                status: 'succeeded',
                                payment_method: 'card'
                            })

                        if (paymentError) {
                            console.error('Error recording recurring payment:', paymentError)
                        }
                    }
                }

                break
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice
                const subscriptionId = invoice.subscription as string

                if (subscriptionId) {
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
                    const userId = subscription.metadata?.userId

                    if (userId) {
                        // Record failed payment
                        const { error: paymentError } = await supabase
                            .from('payments')
                            .insert({
                                user_id: userId,
                                stripe_payment_id: invoice.payment_intent as string,
                                stripe_subscription_id: subscriptionId,
                                amount: invoice.amount_due,
                                currency: invoice.currency,
                                status: 'failed',
                                payment_method: 'card'
                            })

                        if (paymentError) {
                            console.error('Error recording failed payment:', paymentError)
                        }
                    }
                }

                break
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription
                const userId = subscription.metadata?.userId

                if (userId) {
                    // Downgrade user to free tier
                    const { error: updateError } = await supabase
                        .from('user_profiles')
                        .update({ 
                            subscription_tier: 'free',
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', userId)

                    if (updateError) {
                        console.error('Error downgrading user subscription:', updateError)
                    }
                }

                break
            }

            default:
                console.log(`Unhandled event type: ${event.type}`)
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        )
    }
}