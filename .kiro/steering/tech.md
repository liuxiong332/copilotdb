# Technology Stack

## Build System
- **Monorepo**: Turborepo for efficient development and builds
- **Package Manager**: npm with workspaces
- **Node.js**: >= 18.0.0 required
- **TypeScript**: v5.9.2 with strict mode enabled

## Core Technologies
- **Backend**: Supabase (PostgreSQL, Auth, Storage) for authentication and payment management only
- **Web Frontend**: Next.js 14 with React 18, TypeScript, Tailwind CSS (product showcase and account management)
- **Desktop**: Electron with React 18, Shadcn UI, TailwindCSS for cross-platform applications (full database management)
- **Database Clients**: Native database drivers (mongodb, mysql2, sqlite3) in Electron main process
- **AI Integration**: OpenAI API for query generation and natural language processing (desktop client only)
- **Payment Processing**: Paddle API integrated with Supabase
- **Testing**: Vitest for unit tests, Jest for integration tests, Playwright for E2E tests

## Development Environment
- **Local Database**: Supabase CLI for local development stack (auth and payments only)
- **Type Generation**: Automatic TypeScript types from Supabase schema
- **Code Quality**: ESLint, TypeScript strict mode, consistent casing enforcement
- **Desktop Development**: Electron with React, Shadcn UI, and TailwindCSS for cross-platform desktop development

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

### Desktop Development (Electron)
```bash
npm run desktop:dev  # Start Electron app in development mode
npm run desktop:build # Build Electron app for production
npm run desktop:dist # Package Electron app for distribution
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
- **@database-gui/types**: Shared TypeScript definitions for desktop and web clients
- **@database-gui/shared**: Common utilities and database client implementations for Electron desktop client
- Both packages use ES modules and require TypeScript 5.0+
- Packages are primarily used by Electron desktop client for database connectivity