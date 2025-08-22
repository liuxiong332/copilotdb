'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function ForgotPasswordForm() {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const { resetPassword } = useAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        const { error } = await resetPassword(email)

        if (error) {
            setError(error.message)
            setIsLoading(false)
        } else {
            setSuccess(true)
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <div className="text-center">
                <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                    <div className="flex justify-center">
                        <CheckCircle className="h-12 w-12 text-green-400" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-green-900">Check your email</h3>
                    <p className="mt-2 text-sm text-green-700">
                        We've sent a password reset link to <strong>{email}</strong>.
                        Please check your email and follow the instructions to reset your password.
                    </p>
                    <p className="mt-2 text-xs text-green-600">
                        If you don't see the email, check your spam folder.
                    </p>
                </div>
                <Link
                    href="/auth/signin"
                    className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-500 font-medium"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to sign in</span>
                </Link>
            </div>
        )
    }

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                        <div className="ml-3">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                </label>
                <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="Enter your email address"
                    />
                </div>
                <p className="mt-2 text-sm text-gray-600">
                    Enter the email address associated with your account and we'll send you a link to reset your password.
                </p>
            </div>

            <div>
                <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                        'Send reset link'
                    )}
                </button>
            </div>

            <div className="text-center">
                <Link
                    href="/auth/signin"
                    className="inline-flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-500 font-medium"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to sign in</span>
                </Link>
            </div>
        </form>
    )
}