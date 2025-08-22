# Project Structure

## Root Directory Organization
```
database-gui-client/
├── apps/                    # Applications (web client for showcase/auth, desktop clients for database management)
├── packages/               # Shared packages (types and utilities for desktop clients)
├── supabase/              # Database configuration and migrations (auth and payments only)
├── scripts/               # Build and setup scripts
├── tests/                 # Integration tests
└── docs/                  # Documentation
```

## Package Architecture
The project follows a monorepo structure with shared packages:

### packages/types/
- **Purpose**: Shared TypeScript type definitions for desktop clients
- **Package Name**: `@database-gui/types`
- **Key Files**:
  - `src/database.ts` - Database connection and query types
  - `src/auth.ts` - Authentication types (Supabase integration)
  - `src/api.ts` - API request/response types
  - `src/supabase.ts` - Auto-generated Supabase types (auth and payments only)
- **Testing**: Vitest with tests in `src/__tests__/`

### packages/shared/
- **Purpose**: Common utilities and helper functions for desktop clients
- **Package Name**: `@database-gui/shared`
- **Key Files**:
  - `src/database-clients.ts` - Database client implementations (MongoDB, MySQL, PostgreSQL, SQLite)
  - `src/database-utils.ts` - Database utility functions
  - `src/encryption.ts` - Local credential encryption utilities
  - `src/validation.ts` - Input validation helpers
  - `src/constants.ts` - Application constants
- **Dependencies**: Uses `@database-gui/types`
- **Testing**: Vitest with tests in `src/__tests__/`

## Database Structure
### supabase/
- `config.toml` - Supabase local development configuration
- `migrations/` - Database schema migrations (user profiles, subscriptions, payments only)
- `seed.sql` - Initial database seed data
- `.temp/` - Temporary CLI files (gitignored)

## Import Conventions
Use TypeScript path mapping for clean imports:
```typescript
// Preferred imports
import { DatabaseType } from '@database-gui/types';
import { validateConnection } from '@database-gui/shared';

// Alternative path-based imports
import { DatabaseType } from '@/types/database';
import { validateConnection } from '@/shared/validation';
```

## File Naming Conventions
- **TypeScript files**: kebab-case (e.g., `database-utils.ts`)
- **Test files**: `*.test.ts` in `__tests__/` directories
- **Type files**: Descriptive names matching their domain (e.g., `database.ts`, `auth.ts`)
- **Configuration files**: Standard names (e.g., `tsconfig.json`, `package.json`)

## Build Outputs
- **packages/*/dist/**: Compiled JavaScript and type definitions
- **packages/*/.turbo/**: Turborepo cache and logs
- **.turbo/**: Root-level Turborepo cache