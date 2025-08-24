import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return req.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        req.cookies.set(name, value)
                        res.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Protected routes that require authentication
    const protectedRoutes = ['/dashboard', '/profile', '/settings']
    const authRoutes = ['/auth/signin', '/auth/signup', '/auth/forgot-password']

    const isProtectedRoute = protectedRoutes.some(route =>
        req.nextUrl.pathname.startsWith(route)
    )

    const isAuthRoute = authRoutes.some(route =>
        req.nextUrl.pathname.startsWith(route)
    )

    // Redirect to signin if accessing protected route without authenticated user
    if (isProtectedRoute && !user) {
        const redirectUrl = new URL('/auth/signin', req.url)
        redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
    }

    // Redirect to dashboard if accessing auth routes with authenticated user
    if (isAuthRoute && user) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return res
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/profile/:path*',
        '/settings/:path*',
        '/auth/:path*'
    ]
}