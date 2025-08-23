# Technology Stack

## Build System
- **Monorepo**: Turborepo for efficient development and builds
- **Package Manager**: npm with workspaces
- **Node.js**: >= 18.0.0 required
- **TypeScript**: v5.9.2 with strict mode enabled

## Core Technologies
- **Backend**: Supabase (PostgreSQL, Auth, Storage) for authentication and payment management only
- **Web Frontend**: Next.js 14 with React 18, TypeScript, Tailwind CSS (product showcase and account management)
- **Desktop**: Flutter with Dart for Windows/macOS applications (full database management)
- **Database Clients**: Native database drivers (mongodb, mysql2, pg, sqlite3) in Flutter desktop clients
- **AI Integration**: OpenAI API for query generation and natural language processing (desktop clients only)
- **Payment Processing**: Paddle API integrated with Supabase
- **Testing**: Vitest for unit tests, Jest for integration tests

## Development Environment
- **Local Database**: Supabase CLI for local development stack (auth and payments only)
- **Type Generation**: Automatic TypeScript types from Supabase schema
- **Code Quality**: ESLint, TypeScript strict mode, consistent casing enforcement
- **Desktop Development**: Flutter SDK for cross-platform desktop development

## Common Commands

### Development
```bash
npm run dev          # Start all development servers
npm run build        # Build all applications
npm run test         # Run all tests
npm run lint         # Lint all code
npm run type-check   # Type check all TypeScript
npm run clean        # Clean build artifacts
```

### Database Operations (Supabase - Auth & Payments Only)
```bash
npm run db:setup     # Initial Supabase setup (auth and payments)
npm run db:start     # Start local Supabase
npm run db:stop      # Stop local Supabase
npm run db:status    # Check Supabase status
npm run db:reset     # Reset Supabase database to initial state
npm run db:migrate   # Push migrations to Supabase
npm run db:generate-types  # Generate TypeScript types from Supabase schema
npm run db:validate  # Validate Supabase database schema
npm run test:db      # Run Supabase database tests
```

## Package Structure
- **@database-gui/types**: Shared TypeScript definitions for desktop clients
- **@database-gui/shared**: Common utilities and database client implementations for desktop clients
- Both packages use ES modules and require TypeScript 5.0+
- Packages are primarily used by Flutter desktop clients for database connectivity