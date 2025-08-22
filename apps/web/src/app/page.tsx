import { Metadata } from 'next'
import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import ProductDemo from '@/components/landing/ProductDemo'
import Pricing from '@/components/landing/Pricing'
import CTA from '@/components/landing/CTA'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
    title: 'Database GUI Client - AI-Powered Database Management',
    description: 'Connect to MongoDB, MySQL, PostgreSQL, and SQLite databases with AI assistance. Secure desktop applications for Windows and macOS.',
}

export default function HomePage() {
    return (
        <div className="min-h-screen bg-white">
            <Header />
            <main>
                <Hero />
                <Features />
                <ProductDemo />
                <Pricing />
                <CTA />
            </main>
            <Footer />
        </div>
    )
}