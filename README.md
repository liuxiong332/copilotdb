# Database GUI Client

Multi-platform database management application with AI assistance capabilities.

## Project Structure

The project is now organized into three independent applications:

```
database-gui-client/
├── backend/                 # Backend services (Supabase configuration and migrations)
├── apps/
│   ├── desktop/            # Electron desktop application
│   └── web/                # Next.js web application
├── scripts/                # Build and setup scripts
└── docs/                   # Documentation
```

## Applications

### Backend (`backend/`)
- **Purpose**: Supabase configuration, database migrations, and type generation
- **Technology**: Supabase CLI, PostgreSQL
- **Scope**: Authentication and payment management only

### Desktop App (`apps/desktop/`)
- **Purpose**: Full database management with AI assistance
- **Technology**: Electron, React 18, TypeScript, Tailwind CSS, Shadcn UI
- **Features**: 
  - Multi-database support (MongoDB, MySQL, PostgreSQL, SQLite)
  - AI-powered query generation (OpenAI integration)
  - Local database connections without cloud intermediary
  - Cross-platform (Windows, macOS, Linux)

### Web App (`apps/web/`)
- **Purpose**: Product showcase, authentication, and account management
- **Technology**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Features**:
  - Product marketing and showcase
  - User registration and authentication
  - Subscription and payment management
  - Desktop app downloads

## Development Setup

### Prerequisites
- Node.js >= 18.0.0
- npm >= 8.0.0

### Installation
```bash
# Install dependencies for all applications
npm run install:all

# Or install individually
cd backend && npm install
cd apps/web && npm install
cd apps/desktop && npm install
```

### Development Commands

#### Backend Development
```bash
cd backend
npm run db:start          # Start local Supabase
npm run db:stop           # Stop local Supabase
npm run db:status         # Check Supabase status
npm run db:reset          # Reset database to initial state
npm run db:migrate        # Push migrations to Supabase
npm run db:generate-types # Generate TypeScript types and sync to apps
npm run test              # Run backend tests
```

#### Web Development
```bash
cd apps/web
npm run dev               # Start development server
npm run build             # Build for production
npm run start             # Start production server
npm run test              # Run tests
npm run lint              # Lint code
```

#### Desktop Development
```bash
cd apps/desktop
npm run dev               # Start Electron app in development
npm run build             # Build for production
npm run dist              # Package for distribution
npm run dist:win          # Package for Windows
npm run dist:mac          # Package for macOS
npm run dist:linux        # Package for Linux
npm run test              # Run tests
npm run lint              # Lint code
```

#### Root Level Commands
```bash
# Development
npm run dev:web           # Start web app
npm run dev:desktop       # Start desktop app
npm run dev:backend       # Start backend services

# Building
npm run build:web         # Build web app
npm run build:desktop     # Build desktop app

# Testing
npm run test:web          # Test web app
npm run test:desktop      # Test desktop app
npm run test:backend      # Test backend

# Linting
npm run lint:web          # Lint web app
npm run lint:desktop      # Lint desktop app

# Utilities
npm run clean:all         # Clean all build artifacts
```

## Type Management

Each application now has its own copy of TypeScript types in `src/types/`:
- **Backend**: Contains Supabase-generated types and auth-related types
- **Desktop**: Contains all types including database, AI, and UI types
- **Web**: Contains types for authentication, payments, and web-specific features

When Supabase schema changes, run `npm run db:generate-types` in the backend directory to update types across all applications.

## Key Benefits of This Structure

1. **No Dependency Conflicts**: Each app manages its own dependencies independently
2. **Simplified Development**: No complex workspace configuration or shared package management
3. **Independent Deployment**: Each application can be built and deployed separately
4. **Clear Separation**: Backend, desktop, and web concerns are completely separated
5. **Type Safety**: Each app has its own type definitions without cross-dependencies

## Technology Stack

- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Desktop**: Electron, React 18, TypeScript, Tailwind CSS, Shadcn UI
- **Web**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Database Clients**: Native drivers (mongodb, mysql2, sqlite3) in Electron
- **AI Integration**: OpenAI API (desktop only)
- **Payment Processing**: Paddle API integrated with Supabase
- **Testing**: Vitest (desktop), Jest (web/backend), Playwright (E2E)

## Environment Configuration

Each application has its own environment configuration:
- `backend/.env` - Supabase configuration
- `apps/web/.env.local` - Web app configuration
- `apps/desktop/.env.local` - Desktop app configuration