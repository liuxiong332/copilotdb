import { Metadata } from 'next'
import SignUpForm from '@/components/auth/SignUpForm'
import AuthLayout from '@/components/auth/AuthLayout'

export const metadata: Metadata = {
    title: 'Sign Up - Database GUI Client',
    description: 'Create your Database GUI Client account to get started with AI-powered database management.',
}

export default function SignUpPage() {
    return (
        <AuthLayout
            title="Create your account"
            subtitle="Get started with Database GUI Client today."
        >
            <SignUpForm />
        </AuthLayout>
    )
}