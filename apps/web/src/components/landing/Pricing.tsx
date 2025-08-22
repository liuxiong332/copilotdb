import Link from 'next/link'
import { Check, Star } from 'lucide-react'

const tiers = [
    {
        name: 'Free',
        id: 'tier-free',
        href: '/auth/signup',
        priceMonthly: '$0',
        description: 'Perfect for getting started with database management.',
        features: [
            'Connect to all database types',
            'Basic query execution',
            '10 AI queries per month',
            'Desktop app for Windows & macOS',
            'Community support',
        ],
        mostPopular: false,
    },
    {
        name: 'Pro',
        id: 'tier-pro',
        href: '/auth/signup',
        priceMonthly: '$19',
        description: 'Best for professionals and small teams.',
        features: [
            'Everything in Free',
            'Unlimited AI queries',
            'Advanced query optimization',
            'Natural language chat',
            'Priority support',
            'Export to multiple formats',
            'Query history and favorites',
        ],
        mostPopular: true,
    },
    {
        name: 'Enterprise',
        id: 'tier-enterprise',
        href: '/contact',
        priceMonthly: 'Custom',
        description: 'Advanced features for large organizations.',
        features: [
            'Everything in Pro',
            'Custom AI model training',
            'SSO integration',
            'Advanced security features',
            'Dedicated support',
            'Custom integrations',
            'Team management',
            'Audit logs',
        ],
        mostPopular: false,
    },
]

export default function Pricing() {
    return (
        <section id="pricing" className="py-24 sm:py-32 bg-white">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-base font-semibold leading-7 text-primary-600">Pricing</h2>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                        Choose the right plan for you
                    </p>
                </div>
                <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
                    Start free and upgrade as you grow. All plans include access to our desktop applications
                    and core database management features.
                </p>
                <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-0">
                    {tiers.map((tier, tierIdx) => (
                        <div
                            key={tier.id}
                            className={`flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 xl:p-10 ${tier.mostPopular
                                    ? 'ring-2 ring-primary-600 relative'
                                    : 'ring-gray-200'
                                }`}
                        >
                            {tier.mostPopular && (
                                <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-primary-600 px-3 py-2 text-sm font-medium text-white text-center">
                                    Most popular
                                </div>
                            )}
                            <div>
                                <div className="flex items-center justify-between gap-x-4">
                                    <h3
                                        id={tier.id}
                                        className={`text-lg font-semibold leading-8 ${tier.mostPopular ? 'text-primary-600' : 'text-gray-900'
                                            }`}
                                    >
                                        {tier.name}
                                    </h3>
                                    {tier.mostPopular && (
                                        <Star className="h-5 w-5 text-primary-600 fill-current" />
                                    )}
                                </div>
                                <p className="mt-4 text-sm leading-6 text-gray-600">{tier.description}</p>
                                <p className="mt-6 flex items-baseline gap-x-1">
                                    <span className="text-4xl font-bold tracking-tight text-gray-900">
                                        {tier.priceMonthly}
                                    </span>
                                    {tier.priceMonthly !== 'Custom' && (
                                        <span className="text-sm font-semibold leading-6 text-gray-600">/month</span>
                                    )}
                                </p>
                                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                                    {tier.features.map((feature) => (
                                        <li key={feature} className="flex gap-x-3">
                                            <Check
                                                className={`h-6 w-5 flex-none ${tier.mostPopular ? 'text-primary-600' : 'text-gray-400'
                                                    }`}
                                                aria-hidden="true"
                                            />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <Link
                                href={tier.href}
                                aria-describedby={tier.id}
                                className={`mt-8 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${tier.mostPopular
                                        ? 'bg-primary-600 text-white shadow-sm hover:bg-primary-500 focus-visible:outline-primary-600'
                                        : 'text-primary-600 ring-1 ring-inset ring-primary-200 hover:ring-primary-300'
                                    }`}
                            >
                                {tier.name === 'Enterprise' ? 'Contact sales' : 'Get started'}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}