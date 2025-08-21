# Database Setup Guide

This guide explains how to set up the Supabase backend infrastructure for the Database GUI Client.

## Prerequisites

- Docker Desktop installed and running
- Node.js 18+ and npm
- Git

## Quick Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up the database:**
   ```bash
   npm run db:setup
   ```

3. **Copy environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```

4. **Update environment variables** in `.env.local` with your Supabase credentials (displayed after running `db:setup`)

## Manual Setup

If you prefer to set up manually:

### 1. Start Supabase

```bash
npm run db:start
```

### 2. Check Status

```bash
npm run db:status
```

### 3. Reset Database (applies migrations)

```bash
npm run db:reset
```

## Database Schema

The database includes the following tables:

### Core Tables

- **`user_profiles`** - Extended user information beyond Supabase Auth
- **`saved_connections`** - Encrypted database connection configurations
- **`query_history`** - History of executed queries
- **`chat_sessions`** - AI chat conversation history
- **`payments`** - Stripe payment and subscription records
- **`ai_usage_logs`** - AI service usage tracking

### Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Encrypted connection storage** for database credentials
- **User isolation** - users can only access their own data
- **Automatic profile creation** via database triggers

## Environment Variables

### Required Variables

```env
# Supabase (get these from `npm run db:status`)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database encryption
DATABASE_ENCRYPTION_KEY=your_32_character_key
```

### OAuth Configuration (Optional)

```env
# GitHub OAuth
SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID=your_github_client_id
SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET=your_github_secret

# Google OAuth  
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=your_google_client_id
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=your_google_secret
```

### AI Services (Optional)

```env
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

### Payment Processing (Optional)

```env
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## OAuth Provider Setup

### GitHub OAuth

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App with:
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:54321/auth/v1/callback`
3. Copy Client ID and Client Secret to your `.env.local`

### Google OAuth

1. Go to Google Cloud Console > APIs & Services > Credentials
2. Create OAuth 2.0 Client ID with:
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:54321/auth/v1/callback`
3. Copy Client ID and Client Secret to your `.env.local`

## Database Commands

```bash
# Start Supabase services
npm run db:start

# Stop Supabase services  
npm run db:stop

# Check service status
npm run db:status

# Reset database (reapply migrations)
npm run db:reset

# Push local migrations to database
npm run db:migrate

# Generate TypeScript types
npm run db:generate-types
```

## Accessing Services

After starting Supabase:

- **Supabase Studio**: http://localhost:54323
- **API Endpoint**: http://localhost:54321
- **Email Testing**: http://localhost:54324

## Troubleshooting

### Docker Issues

```bash
# Check if Docker is running
docker info

# Restart Docker Desktop if needed
```

### Port Conflicts

If ports are in use, you can modify them in `supabase/config.toml`:

```toml
[api]
port = 54321  # Change if needed

[db]  
port = 54322  # Change if needed

[studio]
port = 54323  # Change if needed
```

### Migration Issues

```bash
# Reset everything and start fresh
npm run db:stop
npm run db:start
npm run db:reset
```

### Environment Variable Issues

1. Ensure `.env.local` exists and has correct values
2. Restart your development server after changing environment variables
3. Check that Supabase is running: `npm run db:status`

## Production Deployment

For production deployment:

1. Create a Supabase project at https://supabase.com
2. Run migrations: `supabase db push`
3. Configure OAuth providers in Supabase dashboard
4. Update environment variables with production URLs
5. Enable RLS policies in production

## Security Considerations

- Never commit real API keys to version control
- Use environment variables for all sensitive data
- Enable RLS policies in production
- Regularly rotate encryption keys
- Monitor AI usage and costs
- Implement rate limiting for API endpoints

## Next Steps

After setting up the database:

1. Implement authentication UI components
2. Create database connection management
3. Build query execution interface
4. Integrate AI services
5. Add payment processing