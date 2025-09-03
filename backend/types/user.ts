// User and profile types
export interface UserProfile {
    id: string; // matches auth.users.id
    email: string;
    subscription_tier: 'free' | 'pro' | 'enterprise';
    ai_usage_count: number;
    ai_usage_reset_date: string;
    created_at: string;
    updated_at: string;
    preferences?: UserPreferences;
}

export interface UserPreferences {
    theme: 'light' | 'dark' | 'system';
    defaultQueryLimit: number;
    autoSaveQueries: boolean;
    showQueryExecutionTime: boolean;
    defaultResultView: 'table' | 'tree' | 'json';
    enableAIAssistance: boolean;
    language: string;
}

export interface SubscriptionTier {
    name: 'free' | 'pro' | 'enterprise';
    displayName: string;
    price: number;
    currency: string;
    interval: 'month' | 'year';
    features: SubscriptionFeature[];
    limits: SubscriptionLimits;
}

export interface SubscriptionFeature {
    name: string;
    description: string;
    included: boolean;
}

export interface SubscriptionLimits {
    aiQueriesPerMonth: number;
    maxConnections: number;
    maxQueryHistoryItems: number;
    supportLevel: 'community' | 'email' | 'priority';
}