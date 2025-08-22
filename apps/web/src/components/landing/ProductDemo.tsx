import { Play, Code, Database, MessageSquare } from 'lucide-react'

const demoFeatures = [
    {
        title: 'Connect to Any Database',
        description: 'Easily connect to MongoDB, MySQL, PostgreSQL, and SQLite databases with our intuitive connection manager.',
        icon: Database,
    },
    {
        title: 'AI-Powered Query Generation',
        description: 'Describe what you want in plain English and watch as AI generates the perfect SQL or MongoDB query.',
        icon: Code,
    },
    {
        title: 'Natural Language Chat',
        description: 'Chat with your database like you would with a colleague. Ask questions and get instant insights.',
        icon: MessageSquare,
    },
]

export default function ProductDemo() {
    return (
        <section id="demo" className="py-24 sm:py-32 bg-gray-50">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-base font-semibold leading-7 text-primary-600">
                        See It In Action
                    </h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Experience the power of AI-assisted database management
                    </p>
                    <p className="mt-6 text-lg leading-8 text-gray-600">
                        Watch how our desktop application transforms the way you interact with databases,
                        making complex queries simple and data exploration intuitive.
                    </p>
                </div>

                {/* Demo Video Placeholder */}
                <div className="mt-16 flow-root sm:mt-20">
                    <div className="relative rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:rounded-2xl lg:p-4">
                        <div className="aspect-video rounded-md bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-purple-600/20"></div>
                            <button className="relative z-10 flex items-center justify-center w-20 h-20 bg-white/90 hover:bg-white rounded-full transition-colors duration-200 group">
                                <Play className="h-8 w-8 text-gray-900 ml-1 group-hover:scale-110 transition-transform duration-200" />
                            </button>
                            <div className="absolute bottom-4 left-4 right-4 text-white">
                                <p className="text-lg font-medium">Product Demo Video</p>
                                <p className="text-sm opacity-90">See how AI transforms database management</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Demo Features */}
                <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {demoFeatures.map((feature, index) => (
                        <div key={feature.title} className="relative">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                                    <feature.icon className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                            </div>
                            <p className="text-gray-600">{feature.description}</p>
                        </div>
                    ))}
                </div>

                {/* Screenshots Grid */}
                <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="aspect-square rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        <div className="text-center">
                            <Database className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                            <p className="text-sm font-medium text-blue-800">Connection Manager</p>
                        </div>
                    </div>
                    <div className="aspect-square rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                        <div className="text-center">
                            <Code className="h-12 w-12 text-purple-600 mx-auto mb-2" />
                            <p className="text-sm font-medium text-purple-800">Query Editor</p>
                        </div>
                    </div>
                    <div className="aspect-square rounded-lg bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                        <div className="text-center">
                            <MessageSquare className="h-12 w-12 text-green-600 mx-auto mb-2" />
                            <p className="text-sm font-medium text-green-800">AI Chat Interface</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}