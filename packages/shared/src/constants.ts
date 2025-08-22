import type { SubscriptionTier } from '@database-gui/types';

// Subscription tiers
export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
    free: {
        name: 'free',
        displayName: 'Free',
        price: 0,
        currency: 'USD',
        interval: 'month',
        features: [
            { name: 'Basic database connectivity', description: 'Connect to all supported databases', included: true },
            { name: 'Query execution', description: 'Execute SQL and MongoDB queries', included: true },
            { name: 'Data visualization', description: 'View results in table, tree, and JSON formats', included: true },
            { name: 'AI assistance', description: 'Limited AI query generation', included: true },
            { name: 'Query history', description: 'Save and access query history', included: true }
        ],
        limits: {
            aiQueriesPerMonth: 50,
            maxConnections: 3,
            maxQueryHistoryItems: 100,
            supportLevel: 'community'
        }
    },
    pro: {
        name: 'pro',
        displayName: 'Pro',
        price: 19,
        currency: 'USD',
        interval: 'month',
        features: [
            { name: 'Everything in Free', description: 'All free tier features', included: true },
            { name: 'Unlimited AI assistance', description: 'Unlimited AI query generation and chat', included: true },
            { name: 'Advanced query optimization', description: 'AI-powered query optimization suggestions', included: true },
            { name: 'Export functionality', description: 'Export data in multiple formats', included: true },
            { name: 'Priority support', description: 'Email support with faster response times', included: true }
        ],
        limits: {
            aiQueriesPerMonth: -1, // unlimited
            maxConnections: 10,
            maxQueryHistoryItems: 1000,
            supportLevel: 'email'
        }
    },
    enterprise: {
        name: 'enterprise',
        displayName: 'Enterprise',
        price: 99,
        currency: 'USD',
        interval: 'month',
        features: [
            { name: 'Everything in Pro', description: 'All pro tier features', included: true },
            { name: 'Unlimited connections', description: 'Connect to unlimited databases', included: true },
            { name: 'Team collaboration', description: 'Share connections and queries with team members', included: true },
            { name: 'Advanced security', description: 'Enhanced security features and compliance', included: true },
            { name: 'Priority support', description: 'Dedicated support with SLA guarantees', included: true }
        ],
        limits: {
            aiQueriesPerMonth: -1, // unlimited
            maxConnections: -1, // unlimited
            maxQueryHistoryItems: -1, // unlimited
            supportLevel: 'priority'
        }
    }
};

// Application constants
export const APP_CONFIG = {
    NAME: 'Database GUI Client',
    VERSION: '1.0.0',
    DESCRIPTION: 'Multi-platform database management with AI assistance'
};

// Error codes for web client
export const ERROR_CODES = {
    AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
    AUTHORIZATION_FAILED: 'AUTHORIZATION_FAILED',
    PAYMENT_FAILED: 'PAYMENT_FAILED',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
} as const;

// API endpoints for web client
export const API_ENDPOINTS = {
    AUTH: {
        SIGN_UP: '/auth/signup',
        SIGN_IN: '/auth/signin',
        SIGN_OUT: '/auth/signout',
        REFRESH: '/auth/refresh',
        RESET_PASSWORD: '/auth/reset-password'
    },
    PAYMENTS: {
        CREATE_INTENT: '/api/payments/create-intent',
        CONFIRM: '/api/payments/confirm',
        SUBSCRIPTIONS: '/api/payments/subscriptions'
    },
    DOWNLOADS: {
        WINDOWS: '/api/downloads/windows',
        MACOS: '/api/downloads/macos',
        LATEST: '/api/downloads/latest'
    }
} as const;