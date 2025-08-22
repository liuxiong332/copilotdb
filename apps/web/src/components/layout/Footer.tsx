import Link from 'next/link'
import { Database, Github, Twitter, Mail } from 'lucide-react'

export default function Footer() {
    const navigation = {
        product: [
            { name: 'Features', href: '#features' },
            { name: 'Demo', href: '#demo' },
            { name: 'Pricing', href: '#pricing' },
            { name: 'Download', href: '/download' },
        ],
        support: [
            { name: 'Documentation', href: '/docs' },
            { name: 'Contact', href: '/contact' },
            { name: 'Support', href: '/support' },
            { name: 'Status', href: '/status' },
        ],
        company: [
            { name: 'About', href: '/about' },
            { name: 'Privacy', href: '/privacy' },
            { name: 'Terms', href: '/terms' },
            { name: 'Security', href: '/security' },
        ],
        social: [
            {
                name: 'GitHub',
                href: '#',
                icon: Github,
            },
            {
                name: 'Twitter',
                href: '#',
                icon: Twitter,
            },
            {
                name: 'Email',
                href: 'mailto:support@databasegui.com',
                icon: Mail,
            },
        ],
    }

    return (
        <footer className="bg-gray-900" aria-labelledby="footer-heading">
            <h2 id="footer-heading" className="sr-only">
                Footer
            </h2>
            <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
                <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                    <div className="space-y-8">
                        <Link href="/" className="flex items-center space-x-2">
                            <Database className="h-8 w-8 text-primary-400" />
                            <span className="text-xl font-bold text-white">Database GUI Client</span>
                        </Link>
                        <p className="text-sm leading-6 text-gray-300">
                            Secure, AI-powered database management for MongoDB, MySQL, PostgreSQL, and SQLite.
                            Connect locally without cloud data transit.
                        </p>
                        <div className="flex space-x-6">
                            {navigation.social.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="text-gray-400 hover:text-gray-300"
                                >
                                    <span className="sr-only">{item.name}</span>
                                    <item.icon className="h-6 w-6" aria-hidden="true" />
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                <h3 className="text-sm font-semibold leading-6 text-white">Product</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    {navigation.product.map((item) => (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                className="text-sm leading-6 text-gray-300 hover:text-white"
                                            >
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mt-10 md:mt-0">
                                <h3 className="text-sm font-semibold leading-6 text-white">Support</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    {navigation.support.map((item) => (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                className="text-sm leading-6 text-gray-300 hover:text-white"
                                            >
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                <h3 className="text-sm font-semibold leading-6 text-white">Company</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    {navigation.company.map((item) => (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                className="text-sm leading-6 text-gray-300 hover:text-white"
                                            >
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-16 border-t border-gray-900/10 pt-8 sm:mt-20 lg:mt-24">
                    <p className="text-xs leading-5 text-gray-400">
                        &copy; 2024 Database GUI Client. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}