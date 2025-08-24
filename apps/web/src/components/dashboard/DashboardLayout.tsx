'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    Database,
    Menu,
    X,
    Home,
    Download,
    CreditCard,
    Settings,
    LogOut,
    User
} from 'lucide-react'
import { createClient } from '@/lib/supabase'

interface DashboardLayoutProps {
    children: React.ReactNode
}

const navigation = [
    { name: 'Overview', href: '/dashboard', icon: Home },
    { name: 'Downloads', href: '/dashboard/downloads', icon: Download },
    { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar */}
            <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                        <button
                            type="button"
                            className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="h-6 w-6 text-white" />
                        </button>
                    </div>
                    <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
                        <div className="flex flex-shrink-0 items-center px-4">
                            <Database className="h-8 w-8 text-primary-600" />
                            <span className="ml-2 text-lg font-semibold text-gray-900">Database GUI</span>
                        </div>
                        <nav className="mt-5 flex-1 space-y-1 px-2">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                >
                                    <item.icon className="mr-4 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
                        <button
                            onClick={handleSignOut}
                            className="group flex w-full items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        >
                            <LogOut className="mr-4 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
                            Sign out
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
                <div className="flex flex-1 flex-col overflow-y-auto border-r border-gray-200 bg-white pt-5 pb-4">
                    <div className="flex flex-shrink-0 items-center px-4">
                        <Database className="h-8 w-8 text-primary-600" />
                        <span className="ml-2 text-lg font-semibold text-gray-900">Database GUI</span>
                    </div>
                    <nav className="mt-5 flex-1 space-y-1 px-2">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            >
                                <item.icon className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                    <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                                    <User className="h-5 w-5 text-primary-600" />
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-700">User</p>
                                <button
                                    onClick={handleSignOut}
                                    className="text-xs text-gray-500 hover:text-gray-700"
                                >
                                    Sign out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <div className="sticky top-0 z-10 bg-white border-b border-gray-200 lg:hidden">
                    <div className="flex h-16 items-center justify-between px-4">
                        <button
                            type="button"
                            className="text-gray-500 hover:text-gray-600"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <div className="flex items-center space-x-2">
                            <Database className="h-6 w-6 text-primary-600" />
                            <span className="font-semibold text-gray-900">Database GUI</span>
                        </div>
                        <div className="w-6" /> {/* Spacer */}
                    </div>
                </div>

                {/* Page content */}
                <main className="py-6">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}