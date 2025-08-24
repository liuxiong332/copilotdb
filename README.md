# Database GUI Client

A multi-platform database GUI client with AI assistance for MongoDB, MySQL, PostgreSQL, and SQLite databases.

## Features

- **Multi-Database Support**: Connect to MongoDB, MySQL, PostgreSQL, and SQLite
- **Cross-Platform**: Web application (Next.js) and desktop apps (Flutter for Windows/macOS)
- **AI-Powered**: Query generation and natural language database interactions
- **Real-time**: Live query results and collaboration features
- **Secure**: Encrypted credential storage and secure authentication

## Architecture

- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage) + Edge Functions
- **Web Client**: Next.js 14 with TypeScript, React 18, Tailwind CSS
- **Desktop Clients**: Flutter with Dart
- **Monorepo**: Turborepo for efficient development and builds

## Project Structure

```
database-gui-client/
├── apps/                    # Applications
│   ├── web/                # Next.js web application
│   ├── desktop-windows/    # Flutter Windows app
│   └── desktop-macos/      # Flutter macOS app
├── packages/               # Shared packages
│   ├── types/             # TypeScript type definitions
│   └── shared/            # Shared utilities and constants
├── supabase/              # Supabase configuration and migrations
│   ├── config.toml        # Supabase configuration
│   └── seed.sql           # Database seed data
└── turbo.json             # Turborepo configuration
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 8+
- Supabase CLI (for local development)
- Flutter SDK (for desktop apps)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd database-gui-client
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
# Edit .env.local with your configuration
```

4. Start Supabase locally:
```bash
supabase start
```

5. Start development servers:
```bash
npm run dev
```

## Development

### Available Scripts

- `npm run dev` - Start all development servers
- `npm run build` - Build all applications
- `npm run test` - Run all tests
- `npm run lint` - Lint all code
- `npm run type-check` - Type check all TypeScript code
- `npm run clean` - Clean all build artifacts

### Packages

#### @database-gui/types
Shared TypeScript type definitions for all applications.

#### @database-gui/shared
Shared utilities, constants, and helper functions.

## Environment Variables

See `.env.local.example` for required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `PADDLE_API_KEY` - Paddle API key for payments
- `PADDLE_WEBHOOK_SECRET` - Paddle webhook secret for payment verification

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.