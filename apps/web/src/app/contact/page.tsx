import { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ContactForm from '@/components/contact/ContactForm'
import { Mail, MessageSquare, Phone, MapPin } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Contact Us - Database GUI Client',
    description: 'Get in touch with our team for support, sales inquiries, or general questions about Database GUI Client.',
}

const contactMethods = [
    {
        name: 'Email Support',
        description: 'Get help with technical issues or account questions',
        icon: Mail,
        contact: 'support@databasegui.com',
        href: 'mailto:support@databasegui.com',
    },
    {
        name: 'Sales Inquiries',
        description: 'Questions about pricing, enterprise features, or custom solutions',
        icon: MessageSquare,
        contact: 'sales@databasegui.com',
        href: 'mailto:sales@databasegui.com',
    },
    {
        name: 'Phone Support',
        description: 'Speak directly with our support team (Pro and Enterprise only)',
        icon: Phone,
        contact: '+1 (555) 123-4567',
        href: 'tel:+15551234567',
    },
]

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-white">
            <Header />
            <main className="py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Contact Our Team
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            We're here to help you get the most out of Database GUI Client.
                            Reach out with any questions, feedback, or support needs.
                        </p>
                    </div>

                    <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 lg:grid-cols-2">
                        {/* Contact Methods */}
                        <div className="space-y-8">
                            <h2 className="text-2xl font-bold text-gray-900">Get in Touch</h2>
                            <div className="space-y-6">
                                {contactMethods.map((method) => (
                                    <div key={method.name} className="flex items-start space-x-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                                            <method.icon className="h-6 w-6 text-primary-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{method.name}</h3>
                                            <p className="mt-1 text-gray-600">{method.description}</p>
                                            <a
                                                href={method.href}
                                                className="mt-2 inline-block text-primary-600 hover:text-primary-700 font-medium"
                                            >
                                                {method.contact}
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Office Hours</h3>
                                <div className="space-y-2 text-gray-600">
                                    <p><strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM PST</p>
                                    <p><strong>Saturday:</strong> 10:00 AM - 4:00 PM PST</p>
                                    <p><strong>Sunday:</strong> Closed</p>
                                </div>
                                <p className="mt-4 text-sm text-gray-500">
                                    Response times: Email support within 24 hours, phone support for Pro/Enterprise customers.
                                </p>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div>
                            <ContactForm />
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}