'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface PasswordStrength {
    score: number
    feedback: string[]
}

export default function SignUpForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const { signUp } = useAuth()
    const router = useRouter()

    const getPasswordStrength = (password: string): PasswordStrength => {
        let score = 0
        const feedback: string[] = []

        if (password.length >= 8) score++
        else feedback.push('At least 8 characters')

        if (/[A-Z]/.test(password)) score++
        else feedback.push('One uppercase letter')

        if (/[a-z]/.test(password)) score++
        else feedback.push('One lowercase letter')

        if (/\d/.test(password)) score++
        else feedback.push('One number')

        if (/[^A-Za-z0-9]/.test(password)) score++
        else feedback.push('One special character')

        return { score, feedback }
    }

    const passwordStrength = getPasswordStrength(password)
    const passwordsMatch = password === confirmPassword && confirmPassword !== ''

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            setIsLoading(false)
            return
        }

        if (passwordStrength.score < 3) {
            setError('Password is too weak. Please follow the requirements below.')
            setIsLoading(false)
            return
        }

        const { error } = await signUp(email, password)

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
                        We've sent you a verification link at <strong>{email}</strong>.
                        Please check your email and click the link to verify your account.
                    </p>
                </div>
                <Link
                    href="/auth/signin"
                    className="text-primary-600 hover:text-primary-500 font-medium"
                >
                    Back to sign in
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
                        placeholder="Enter your email"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                </label>
                <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="Create a password"
                    />
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                        ) : (
                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                        )}
                    </button>
                </div>

                {password && (
                    <div className="mt-2">
                        <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                                <div
                                    key={level}
                                    className={`h-1 w-full rounded ${level <= passwordStrength.score
                                            ? passwordStrength.score <= 2
                                                ? 'bg-red-400'
                                                : passwordStrength.score <= 3
                                                    ? 'bg-yellow-400'
                                                    : 'bg-green-400'
                                            : 'bg-gray-200'
                                        }`}
                                />
                            ))}
                        </div>
                        {passwordStrength.feedback.length > 0 && (
                            <p className="mt-1 text-xs text-gray-600">
                                Password needs: {passwordStrength.feedback.join(', ')}
                            </p>
                        )}
                    </div>
                )}
            </div>

            <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm password
                </label>
                <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`appearance-none block w-full pl-10 pr-10 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${confirmPassword && !passwordsMatch
                                ? 'border-red-300'
                                : confirmPassword && passwordsMatch
                                    ? 'border-green-300'
                                    : 'border-gray-300'
                            }`}
                        placeholder="Confirm your password"
                    />
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                        ) : (
                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                        )}
                    </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                    <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                )}
                {confirmPassword && passwordsMatch && (
                    <p className="mt-1 text-xs text-green-600">Passwords match</p>
                )}
            </div>

            <div className="flex items-center">
                <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                    I agree to the{' '}
                    <Link href="/terms" className="text-primary-600 hover:text-primary-500">
                        Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-primary-600 hover:text-primary-500">
                        Privacy Policy
                    </Link>
                </label>
            </div>

            <div>
                <button
                    type="submit"
                    disabled={isLoading || !passwordsMatch || passwordStrength.score < 3}
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                        'Create account'
                    )}
                </button>
            </div>

            <div className="text-center">
                <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link
                        href="/auth/signin"
                        className="font-medium text-primary-600 hover:text-primary-500"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </form>
    )
}