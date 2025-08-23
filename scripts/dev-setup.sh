#!/bin/bash

# Development Setup Script for Database GUI Client
echo "🚀 Setting up Database GUI Client development environment..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Start Supabase local development
echo "📦 Starting Supabase local development server..."
cd "$(dirname "$0")/.."
supabase start

# Check if Supabase started successfully
if [ $? -eq 0 ]; then
    echo "✅ Supabase is running!"
    echo "   - API URL: http://localhost:54321"
    echo "   - Studio URL: http://localhost:54323"
    echo "   - Database URL: postgresql://postgres:postgres@localhost:54322/postgres"
else
    echo "❌ Failed to start Supabase"
    exit 1
fi

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build packages
echo "🔨 Building shared packages..."
npm run build --workspace=@database-gui/types
npm run build --workspace=@database-gui/shared

echo "🎉 Development environment is ready!"
echo ""
echo "Next steps:"
echo "1. Start the web app: npm run dev --workspace=@database-gui/web"
echo "2. Open http://localhost:3000 in your browser"
echo "3. Open Supabase Studio at http://localhost:54323"
echo ""
echo "To stop Supabase: supabase stop"