import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    const {
        data: { session },
    } = await supabase.auth.getSession()

    // Protected routes that require authentication
    const protectedRoutes = ['/dashboard', '/profile', '/settings']
    const authRoutes = ['/auth/signin', '/auth/signup', '/auth/forgot-password']

    const isProtectedRoute = protectedRoutes.some(route =>
        req.nextUrl.pathname.startsWith(route)
    )

    const isAuthRoute = authRoutes.some(route =>
        req.nextUrl.pathname.startsWith(route)
    )

    // Redirect to signin if accessing protected route without session
    if (isProtectedRoute && !session) {
        const redirectUrl = new URL('/auth/signin', req.url)
        redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
    }

    // Redirect to dashboard if accessing auth routes with active session
    if (isAuthRoute && session) {
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