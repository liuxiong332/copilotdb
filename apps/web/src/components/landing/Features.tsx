import {
    Database,
    Brain,
    Shield,
    Zap,
    Monitor,
    MessageSquare,
    Lock,
    Cpu,
    Globe
} from 'lucide-react'

const features = [
    {
        name: 'Multi-Database Support',
        description: 'Connect to MongoDB, MySQL, PostgreSQL, and SQLite databases from a single interface.',
        icon: Database,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
    },
    {
        name: 'AI Query Assistant',
        description: 'Generate SQL and MongoDB queries using natural language. Get explanations and optimizations.',
        icon: Brain,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
    },
    {
        name: 'Local Security',
        description: 'Your database connections stay local. No data transmitted through cloud services.',
        icon: Shield,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
    },
    {
        name: 'Lightning Fast',
        description: 'Direct database connections with optimized query execution and result caching.',
        icon: Zap,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
    },
    {
        name: 'Cross-Platform Desktop',
        description: 'Native desktop applications for Windows and macOS with consistent experience.',
        icon: Monitor,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100',
    },
    {
        name: 'Natural Language Chat',
        description: 'Chat with your database using plain English. Ask questions and get instant results.',
        icon: MessageSquare,
        color: 'text-pink-600',
        bgColor: 'bg-pink-100',
    },
    {
        name: 'Encrypted Credentials',
        description: 'Database credentials are encrypted and stored securely on your local machine.',
        icon: Lock,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
    },
    {
        name: 'High Performance',
        description: 'Optimized for large datasets with virtual scrolling and intelligent pagination.',
        icon: Cpu,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
    },
    {
        name: 'Web Dashboard',
        description: 'Manage your account, subscriptions, and download desktop clients from anywhere.',
        icon: Globe,
        color: 'text-teal-600',
        bgColor: 'bg-teal-100',
    },
]

export default function Features() {
    return (
        <section id="features" className="py-24 sm:py-32 bg-white">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-base font-semibold leading-7 text-primary-600">
                        Powerful Features
                    </h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Everything you need for database management
                    </p>
                    <p className="mt-6 text-lg leading-8 text-gray-600">
                        From AI-powered query generation to secure local connections,
                        our platform provides all the tools you need to work efficiently with your databases.
                    </p>
                </div>
                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                    <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                        {features.map((feature) => (
                            <div key={feature.name} className="flex flex-col">
                                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${feature.bgColor}`}>
                                        <feature.icon className={`h-6 w-6 ${feature.color}`} aria-hidden="true" />
                                    </div>
                                    {feature.name}
                                </dt>
                                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                                    <p className="flex-auto">{feature.description}</p>
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </section>
    )
}