import type { DatabaseType, SubscriptionTier } from '@database-gui/types';

// Database configuration constants
export const DATABASE_TYPES: Record<DatabaseType, { name: string; defaultPort: number; icon: string }> = {
    mongodb: { name: 'MongoDB', defaultPort: 27017, icon: '🍃' },
    mysql: { name: 'MySQL', defaultPort: 3306, icon: '🐬' },
    postgresql: { name: 'PostgreSQL', defaultPort: 5432, icon: '🐘' },
    sqlite: { name: 'SQLite', defaultPort: 0, icon: '📁' }
};

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

// Query limits and defaults
export const QUERY_LIMITS = {
    DEFAULT_LIMIT: 1000,
    MAX_LIMIT: 10000,
    DEFAULT_TIMEOUT: 30000, // 30 seconds
    MAX_TIMEOUT: 300000 // 5 minutes
};

// UI constants
export const VIEW_MODES = [
    { type: 'table' as const, label: 'Table', icon: '📊' },
    { type: 'tree' as const, label: 'Tree', icon: '🌳' },
    { type: 'json' as const, label: 'JSON', icon: '📄' }
];

export const EXPORT_FORMATS = [
    { format: 'csv' as const, label: 'CSV', icon: '📊' },
    { format: 'json' as const, label: 'JSON', icon: '📄' },
    { format: 'excel' as const, label: 'Excel', icon: '📈' },
    { format: 'sql' as const, label: 'SQL', icon: '💾' }
];

// Error codes
export const ERROR_CODES = {
    CONNECTION_FAILED: 'CONNECTION_FAILED',
    QUERY_SYNTAX_ERROR: 'QUERY_SYNTAX_ERROR',
    AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
    AUTHORIZATION_FAILED: 'AUTHORIZATION_FAILED',
    AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
    PAYMENT_FAILED: 'PAYMENT_FAILED',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
} as const;

// API endpoints
export const API_ENDPOINTS = {
    AUTH: {
        SIGN_UP: '/auth/signup',
        SIGN_IN: '/auth/signin',
        SIGN_OUT: '/auth/signout',
        REFRESH: '/auth/refresh',
        RESET_PASSWORD: '/auth/reset-password'
    },
    CONNECTIONS: {
        LIST: '/api/connections',
        CREATE: '/api/connections',
        UPDATE: '/api/connections/:id',
        DELETE: '/api/connections/:id',
        TEST: '/api/connections/test'
    },
    QUERIES: {
        EXECUTE: '/api/queries/execute',
        HISTORY: '/api/queries/history',
        EXPLAIN: '/api/queries/explain',
        VALIDATE: '/api/queries/validate'
    },
    AI: {
        GENERATE_QUERY: '/api/ai/generate-query',
        CHAT: '/api/ai/chat',
        OPTIMIZE_QUERY: '/api/ai/optimize-query'
    },
    SCHEMA: {
        GET: '/api/schema/:connectionId'
    },
    PAYMENTS: {
        CREATE_INTENT: '/api/payments/create-intent',
        CONFIRM: '/api/payments/confirm',
        SUBSCRIPTIONS: '/api/payments/subscriptions'
    }
} as const;