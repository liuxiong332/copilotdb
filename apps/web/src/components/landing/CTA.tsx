import Link from 'next/link'
import { ArrowRight, Download } from 'lucide-react'

export default function CTA() {
    return (
        <section className="bg-primary-600">
            <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        Ready to transform your database workflow?
                    </h2>
                    <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-100">
                        Join thousands of developers and database administrators who trust our platform
                        for secure, AI-powered database management.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <Link
                            href="/auth/signup"
                            className="rounded-md bg-white px-6 py-3 text-lg font-semibold text-primary-600 shadow-sm hover:bg-primary-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white flex items-center space-x-2"
                        >
                            <span>Start Free Today</span>
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                        <Link
                            href="/contact"
                            className="text-lg font-semibold leading-6 text-white hover:text-primary-100 flex items-center space-x-2"
                        >
                            <span>Contact Sales</span>
                            <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                    <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-primary-200">
                        <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                            <span>Free to start</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                            <span>No credit card required</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 bg-purple-400 rounded-full"></div>
                            <span>Cancel anytime</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}