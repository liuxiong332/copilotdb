'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Database } from 'lucide-react'

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const navigation = [
        { name: 'Features', href: '#features' },
        { name: 'Demo', href: '#demo' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'Contact', href: '/contact' },
    ]

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
                <div className="flex w-full items-center justify-between py-4">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <Database className="h-8 w-8 text-primary-600" />
                            <span className="text-xl font-bold text-gray-900">Database GUI Client</span>
                        </Link>
                    </div>

                    {/* Desktop navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="text-gray-600 hover:text-primary-600 font-medium transition-colors duration-200"
                            >
                                {item.name}
                            </Link>
                        ))}
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/auth/signin"
                                className="text-gray-600 hover:text-primary-600 font-medium transition-colors duration-200"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/auth/signup"
                                className="btn-primary"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            type="button"
                            className="text-gray-600 hover:text-gray-900"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMenuOpen ? (
                                <X className="h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Menu className="h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile navigation */}
                {isMenuOpen && (
                    <div className="md:hidden">
                        <div className="space-y-1 pb-3 pt-2">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary-600"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <div className="border-t border-gray-200 pt-4">
                                <Link
                                    href="/auth/signin"
                                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary-600"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/auth/signup"
                                    className="block px-3 py-2 text-base font-medium text-primary-600 hover:text-primary-700"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Get Started
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    )
}