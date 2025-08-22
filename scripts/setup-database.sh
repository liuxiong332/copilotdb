#!/bin/bash

# Database setup script for Database GUI Client
# This script initializes the Supabase local development environment

set -e

echo "🚀 Setting up Database GUI Client - Supabase Backend"

# Check if Podman is running
if ! podman info > /dev/null 2>&1; then
    echo "❌ Podman is not running. Please start Podman and try again."
    exit 1
fi

# Check if Supabase CLI is available
if ! command -v npx supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install supabase --save-dev
fi

echo "📋 Checking Supabase status..."
npx supabase status || echo "Supabase not running, will start it..."

echo "🔧 Starting Supabase local development environment..."
npx supabase start

echo "📊 Getting Supabase credentials..."
npx supabase status

echo "🗄️ Running database migrations..."
npx supabase db reset

echo "✅ Database setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Copy .env.local.example to .env.local"
echo "2. Update the environment variables with your Supabase credentials"
echo "3. Configure OAuth providers (GitHub, Google) in your Supabase dashboard"
echo "4. Start your Next.js development server"
echo ""
echo "🔗 Useful URLs:"
echo "- Supabase Studio: http://localhost:54323"
echo "- API URL: http://localhost:54321"
echo "- Inbucket (Email testing): http://localhost:54324"