import { Metadata } from 'next'
import SignInForm from '@/components/auth/SignInForm'
import AuthLayout from '@/components/auth/AuthLayout'

export const metadata: Metadata = {
    title: 'Sign In - Database GUI Client',
    description: 'Sign in to your Database GUI Client account to access your dashboard and download desktop applications.',
}

export default function SignInPage() {
    return (
        <AuthLayout
            title="Sign in to your account"
            subtitle="Welcome back! Please sign in to continue."
        >
            <SignInForm />
        </AuthLayout>
    )
}