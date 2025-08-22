import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const createClient = () => {
    return createClientComponentClient()
}

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'