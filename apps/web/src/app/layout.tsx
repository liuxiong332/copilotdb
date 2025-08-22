import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ClientProviders from '@/components/providers/ClientProviders'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Database GUI Client - Multi-Platform Database Management',
    description: 'Secure, AI-powered database management for MongoDB, MySQL, PostgreSQL, and SQLite. Desktop applications with natural language query assistance.',
    keywords: 'database, GUI, MongoDB, MySQL, PostgreSQL, SQLite, AI, query, desktop, management',
    authors: [{ name: 'Database GUI Client Team' }],
}

export const viewport = {
    width: 'device-width',
    initialScale: 1,
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <ClientProviders>
                    {children}
                </ClientProviders>
            </body>
        </html>
    )
}