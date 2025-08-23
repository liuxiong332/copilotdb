import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOuoQ2lQbf9OpI2YpSt5kRAhe-g5lzSqf0XI'

export const createClient = () => {
    try {
        return createClientComponentClient({
            supabaseUrl,
            supabaseKey: supabaseAnonKey
        })
    } catch (error) {
        console.error('Failed to create Supabase client:', error)
        // Return a mock client for development when Supabase is not available
        return {
            auth: {
                getSession: () => Promise.resolve({ data: { session: null }, error: null }),
                getUser: () => Promise.resolve({ data: { user: null }, error: null }),
                signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
                signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
                signOut: () => Promise.resolve({ error: null }),
                onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
                resetPasswordForEmail: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
                updateUser: () => Promise.resolve({ error: { message: 'Supabase not configured' } })
            },
            from: () => ({
                select: () => ({ 
                    eq: () => ({ 
                        single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
                        order: () => Promise.resolve({ data: [], error: { message: 'Supabase not configured' } })
                    }),
                    order: () => Promise.resolve({ data: [], error: { message: 'Supabase not configured' } })
                }),
                insert: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
                update: () => ({ eq: () => Promise.resolve({ error: { message: 'Supabase not configured' } }) }),
                delete: () => ({ eq: () => Promise.resolve({ error: { message: 'Supabase not configured' } }) })
            })
        } as any
    }
}