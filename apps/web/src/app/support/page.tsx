import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import {
    Book,
    MessageCircle,
    Mail,
    Download,
    AlertCircle,
    CheckCircle,
    Clock,
    Users
} from 'lucide-react'

export const metadata: Metadata = {
    title: 'Support - Database GUI Client',
    description: 'Get help with Database GUI Client. Find documentation, contact support, and access resources.',
}

const supportOptions = [
    {
        name: 'Documentation',
        description: 'Comprehensive guides and API documentation',
        icon: Book,
        href: '/docs',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
    },
    {
        name: 'Community Forum',
        description: 'Connect with other users and get community support',
        icon: Users,
        href: '#',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
    },
    {
        name: 'Live Chat',
        description: 'Chat with our support team (Pro and Enterprise)',
        icon: MessageCircle,
        href: '#',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
    },
    {
        name: 'Email Support',
        description: 'Send us an email for detailed assistance',
        icon: Mail,
        href: '/contact',
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
    },
]

const commonIssues = [
    {
        title: 'Connection Issues',
        description: 'Troubleshoot database connection problems',
        status: 'resolved',
        href: '/docs/troubleshooting/connections',
    },
    {
        title: 'AI Query Generation',
        description: 'Getting the most out of AI-powered queries',
        status: 'guide',
        href: '/docs/ai/query-generation',
    },
    {
        title: 'Installation Problems',
        description: 'Desktop app installation and setup issues',
        status: 'resolved',
        href: '/docs/installation',
    },
    {
        title: 'Performance Optimization',
        description: 'Optimize query performance and app responsiveness',
        status: 'guide',
        href: '/docs/performance',
    },
]

const systemStatus = [
    { service: 'Web Application', status: 'operational' },
    { service: 'Authentication', status: 'operational' },
    { service: 'AI Services', status: 'operational' },
    { service: 'Payment Processing', status: 'operational' },
]

export default function SupportPage() {
    return (
        <div className="min-h-screen bg-white">
            <Header />
            <main className="py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    {/* Header */}
                    <div className="mx-auto max-w-2xl text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            How can we help you?
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            Find answers to common questions, browse our documentation, or get in touch with our support team.
                        </p>
                    </div>

                    {/* Support Options */}
                    <div className="mx-auto mt-16 max-w-4xl">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {supportOptions.map((option) => (
                                <Link
                                    key={option.name}
                                    href={option.href}
                                    className="group relative rounded-lg p-6 hover:bg-gray-50 transition-colors duration-200"
                                >
                                    <div className={`inline-flex rounded-lg p-3 ${option.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                                        <option.icon className={`h-6 w-6 ${option.color}`} />
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold text-gray-900">{option.name}</h3>
                                    <p className="mt-2 text-sm text-gray-600">{option.description}</p>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* System Status */}
                    <div className="mx-auto mt-16 max-w-4xl">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">System Status</h2>
                        <div className="bg-gray-50 rounded-lg p-6">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {systemStatus.map((item) => (
                                    <div key={item.service} className="flex items-center space-x-3">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{item.service}</p>
                                            <p className="text-xs text-green-600 capitalize">{item.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 flex items-center space-x-2 text-sm text-gray-600">
                                <Clock className="h-4 w-4" />
                                <span>Last updated: {new Date().toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Common Issues */}
                    <div className="mx-auto mt-16 max-w-4xl">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Common Issues & Guides</h2>
                        <div className="space-y-4">
                            {commonIssues.map((issue) => (
                                <Link
                                    key={issue.title}
                                    href={issue.href}
                                    className="block p-6 bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900">{issue.title}</h3>
                                            <p className="mt-2 text-gray-600">{issue.description}</p>
                                        </div>
                                        <div className="ml-4">
                                            {issue.status === 'resolved' ? (
                                                <div className="flex items-center space-x-1 text-green-600">
                                                    <CheckCircle className="h-4 w-4" />
                                                    <span className="text-xs font-medium">Resolved</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center space-x-1 text-blue-600">
                                                    <Book className="h-4 w-4" />
                                                    <span className="text-xs font-medium">Guide</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Contact CTA */}
                    <div className="mx-auto mt-16 max-w-2xl text-center">
                        <div className="bg-primary-50 rounded-lg p-8">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                Still need help?
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Our support team is here to help you get the most out of Database GUI Client.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/contact"
                                    className="btn-primary"
                                >
                                    Contact Support
                                </Link>
                                <Link
                                    href="/docs"
                                    className="btn-secondary"
                                >
                                    Browse Documentation
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}