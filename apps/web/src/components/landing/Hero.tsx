import Link from 'next/link'
import { ArrowRight, Download, Play, Database } from 'lucide-react'

export default function Hero() {
    return (
        <section className="relative bg-gradient-to-br from-primary-50 to-white py-20 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                        AI-Powered Database Management
                        <span className="text-primary-600"> Made Simple</span>
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-gray-600">
                        Connect to MongoDB, MySQL, PostgreSQL, and SQLite databases with intelligent AI assistance.
                        Secure desktop applications that keep your data local while providing powerful query generation
                        and natural language database interactions.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <Link
                            href="/auth/signup"
                            className="btn-primary flex items-center space-x-2 text-lg px-6 py-3"
                        >
                            <span>Get Started Free</span>
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                        <Link
                            href="#demo"
                            className="btn-secondary flex items-center space-x-2 text-lg px-6 py-3"
                        >
                            <Play className="h-5 w-5" />
                            <span>Watch Demo</span>
                        </Link>
                    </div>
                    <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <span>Local Database Connections</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                            <span>AI Query Assistant</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                            <span>Cross-Platform Desktop</span>
                        </div>
                    </div>
                </div>

                {/* Hero Image Placeholder */}
                <div className="mt-16 flow-root sm:mt-24">
                    <div className="relative rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:rounded-2xl lg:p-4">
                        <div className="aspect-video rounded-md bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                            <div className="text-center">
                                <Database className="h-16 w-16 text-primary-600 mx-auto mb-4" />
                                <p className="text-lg font-medium text-primary-800">
                                    Desktop Application Screenshot
                                </p>
                                <p className="text-sm text-primary-600 mt-2">
                                    Coming soon - Database management interface with AI assistance
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

