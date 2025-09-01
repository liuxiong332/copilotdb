import { createClient } from '@supabase/supabase-js';
import type { SupabaseDatabase } from '@database-gui/types';

// Supabase configuration - handle different environment contexts
const getEnvVar = (key: string, fallback: string = '') => {
    // Check for different environment variable patterns
    if (typeof process !== 'undefined' && process.env) {
        return process.env[key] || process.env[`NEXT_PUBLIC_${key}`] || fallback;
    }
    // Fallback for browser/Vite environments
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        return import.meta.env[`VITE_${key}`] || fallback;
    }
    return fallback;
};

const supabaseUrl = getEnvVar('SUPABASE_URL', 'http://localhost:54321');
const supabaseAnonKey = getEnvVar('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0');

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with TypeScript types
export const supabase = createClient<SupabaseDatabase>(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    },
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
});

// Service role client for server-side operations (use with caution)
export const supabaseAdmin = createClient<SupabaseDatabase>(
    supabaseUrl,
    getEnvVar('SUPABASE_SERVICE_ROLE_KEY', ''),
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

// Helper functions for common operations
export const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

export const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) throw error;
    return data;
};

export const signUpWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });
    if (error) throw error;
    return data;
};

export const signInWithProvider = async (provider: 'github' | 'google') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
        },
    });
    if (error) throw error;
    return data;
};

export const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
    return data;
};

// Database helper functions
export const getUserProfile = async (userId: string) => {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) throw error;
    return data;
};

export const updateUserProfile = async (userId: string, updates: Partial<SupabaseDatabase['public']['Tables']['user_profiles']['Update']>) => {
    const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const getUserConnections = async (userId: string) => {
    const { data, error } = await supabase
        .from('saved_connections')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

export const getQueryHistory = async (userId: string, connectionId?: string, limit = 50) => {
    let query = supabase
        .from('query_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (connectionId) {
        query = query.eq('connection_id', connectionId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
};

export const getChatSessions = async (userId: string, connectionId?: string) => {
    let query = supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

    if (connectionId) {
        query = query.eq('connection_id', connectionId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
};

// Real-time subscriptions
export const subscribeToUserProfile = (userId: string, callback: (payload: any) => void) => {
    return supabase
        .channel(`user_profile:${userId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'user_profiles',
                filter: `id=eq.${userId}`,
            },
            callback
        )
        .subscribe();
};

export const subscribeToConnections = (userId: string, callback: (payload: any) => void) => {
    return supabase
        .channel(`connections:${userId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'saved_connections',
                filter: `user_id=eq.${userId}`,
            },
            callback
        )
        .subscribe();
};

export const subscribeToQueryHistory = (userId: string, callback: (payload: any) => void) => {
    return supabase
        .channel(`query_history:${userId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'query_history',
                filter: `user_id=eq.${userId}`,
            },
            callback
        )
        .subscribe();
};