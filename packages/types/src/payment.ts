// Payment and subscription types
export interface Payment {
    id: string;
    user_id: string;
    stripe_payment_id: string;
    amount: number;
    currency: string;
    status: 'pending' | 'succeeded' | 'failed' | 'canceled' | 'refunded';
    created_at: string;
    updated_at?: string;
    metadata?: Record<string, any>;
}

export interface Subscription {
    id: string;
    user_id: string;
    stripe_subscription_id: string;
    status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
    tier: 'free' | 'pro' | 'enterprise';
    current_period_start: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
    created_at: string;
    updated_at?: string;
}

export interface PaymentIntent {
    id: string;
    client_secret: string;
    amount: number;
    currency: string;
    status: string;
}

export interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    interval: 'month' | 'year';
    features: string[];
    popular?: boolean;
    stripePriceId: string;
}

export interface UsageStats {
    user_id: string;
    period_start: string;
    period_end: string;
    ai_queries_used: number;
    ai_queries_limit: number;
    connections_used: number;
    connections_limit: number;
    storage_used: number;
    storage_limit: number;
}