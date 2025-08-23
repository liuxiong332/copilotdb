# Development Setup Script for Database GUI Client
Write-Host "🚀 Setting up Database GUI Client development environment..." -ForegroundColor Green

# Check if Supabase CLI is installed
try {
    $null = Get-Command supabase -ErrorAction Stop
    Write-Host "✅ Supabase CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Change to project root
Set-Location (Split-Path $PSScriptRoot -Parent)

# Start Supabase local development
Write-Host "📦 Starting Supabase local development server..." -ForegroundColor Blue
try {
    supabase start
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Supabase is running!" -ForegroundColor Green
        Write-Host "   - API URL: http://localhost:54321" -ForegroundColor Cyan
        Write-Host "   - Studio URL: http://localhost:54323" -ForegroundColor Cyan
        Write-Host "   - Database URL: postgresql://postgres:postgres@localhost:54322/postgres" -ForegroundColor Cyan
    } else {
        throw "Supabase failed to start"
    }
} catch {
    Write-Host "❌ Failed to start Supabase: $_" -ForegroundColor Red
    exit 1
}

# Install dependencies if not already installed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
    npm install
}

# Build packages
Write-Host "🔨 Building shared packages..." -ForegroundColor Blue
npm run build --workspace=@database-gui/types
npm run build --workspace=@database-gui/shared

Write-Host "🎉 Development environment is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start the web app: npm run dev --workspace=@database-gui/web" -ForegroundColor White
Write-Host "2. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "3. Open Supabase Studio at http://localhost:54323" -ForegroundColor White
Write-Host ""
Write-Host "To stop Supabase: supabase stop" -ForegroundColor Yellow