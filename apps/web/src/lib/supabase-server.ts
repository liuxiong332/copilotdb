import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOuoQ2lQbf9OpI2YpSt5kRAhe-g5lzSqf0XI'

export const createServerClient = () => {
    try {
        return createServerComponentClient({ 
            cookies,
            supabaseUrl,
            supabaseKey: supabaseAnonKey
        })
    } catch (error) {
        console.error('Failed to create server Supabase client:', error)
        // Return a mock client for development when Supabase is not available
        return {
            auth: {
                getSession: () => Promise.resolve({ data: { session: null }, error: null }),
                getUser: () => Promise.resolve({ data: { user: null }, error: null })
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