# Database GUI Client - Web Application

This is the web application component of the Database GUI Client project, built with Next.js 14, React 18, and TypeScript.

## Features Implemented

### 🎯 Task 6: Web Client Dashboard and Download Functionality

#### 6.1 User Dashboard ✅
- **Enhanced Dashboard Overview** with real-time user data
- **Account Information Display** showing subscription tier and usage stats
- **Usage Alerts** when approaching limits (AI queries, database connections)
- **Dynamic Quick Actions** that adapt based on subscription tier
- **Download Tracking** with history of desktop app downloads
- **Profile Management** with password change and preferences

#### 6.2 Subscription and Payment Management ✅
- **Billing Dashboard** with comprehensive subscription management
- **Three-Tier Plans** (Free, Pro, Enterprise) with detailed features
- **Usage Visualization** with progress bars and limit tracking
- **Upgrade Functionality** with Stripe integration ready
- **Payment History** section for transaction records
- **Current Plan Display** with appropriate actions

## Project Structure

```
apps/web/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── dashboard/          # Dashboard pages
│   │   │   ├── page.tsx        # Main dashboard
│   │   │   ├── downloads/      # Downloads page
│   │   │   ├── profile/        # Profile management
│   │   │   └── billing/        # Billing & subscriptions
│   │   ├── auth/               # Authentication pages
│   │   ├── contact/            # Contact page
│   │   └── support/            # Support page
│   ├── components/             # React components
│   │   ├── dashboard/          # Dashboard-specific components
│   │   ├── auth/               # Authentication components
│   │   ├── landing/            # Landing page components
│   │   ├── layout/             # Layout components
│   │   └── providers/          # Context providers
│   ├── contexts/               # React contexts
│   ├── lib/                    # Utility libraries
│   └── middleware.ts           # Next.js middleware
├── public/                     # Static assets
└── __tests__/                  # Test files
```

## Key Components

### Dashboard Components
- **DashboardOverview**: Main dashboard with stats and quick actions
- **DownloadsPage**: Desktop app downloads with system requirements
- **ProfilePage**: User profile and account management
- **BillingPage**: Subscription plans and payment management
- **DashboardLayout**: Shared layout with navigation sidebar

### Services
- **DashboardService**: Centralized service for user data and operations
- **Supabase Integration**: Authentication and database operations

### Types
- **UserProfile**: User account and subscription information
- **DownloadLink**: Desktop app download metadata
- **SubscriptionPlan**: Subscription tier definitions
- **UsageStats**: User usage tracking and limits

## Environment Setup

### Prerequisites
1. Node.js >= 18.0.0
2. npm or yarn
3. Supabase CLI (optional for local development)

### Environment Variables
Create `.env.local` in the web app directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Supabase (Optional)**
   ```bash
   # If you have Supabase CLI installed
   supabase start
   
   # Or use the setup script
   ./scripts/dev-setup.ps1  # Windows
   ./scripts/dev-setup.sh   # Linux/Mac
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open Application**
   - Web App: http://localhost:3000
   - Supabase Studio: http://localhost:54323 (if running locally)

## Database Schema

The application uses Supabase with the following key tables:

- **user_profiles**: Extended user information and subscription data
- **downloads**: Track desktop app downloads by users
- **payments**: Payment history and transaction records
- **saved_connections**: User database connections (for desktop app)
- **query_history**: Query execution history
- **ai_usage_logs**: AI service usage tracking

## Authentication

- **Supabase Auth**: Email/password authentication
- **Session Management**: Automatic session handling with Next.js
- **Protected Routes**: Middleware-based route protection
- **Password Management**: Secure password updates

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage
- **Component Tests**: All major dashboard components
- **Service Tests**: Dashboard service methods
- **Integration Tests**: Authentication flows
- **Mock Data**: Comprehensive test fixtures

## Deployment

### Build for Production
```bash
npm run build
```

### Environment Configuration
Ensure all environment variables are properly set in your deployment environment:

- Supabase project URL and keys
- Stripe API keys for payment processing
- Application URLs for redirects

## Features in Detail

### Dashboard Overview
- Real-time usage statistics
- Subscription tier display
- Quick action buttons
- Usage limit alerts
- Recent activity tracking

### Downloads Management
- Platform-specific downloads (Windows/macOS)
- System requirements display
- Installation instructions
- Download history tracking
- Version management

### Profile Management
- Account information display
- Password change functionality
- User preferences settings
- Subscription status

### Billing & Subscriptions
- Plan comparison and selection
- Usage visualization
- Upgrade/downgrade functionality
- Payment history
- Billing support links

## Integration Points

### Desktop Applications
- Download links for Windows and macOS apps
- Version tracking and updates
- Usage synchronization

### Payment Processing
- Stripe integration for subscriptions
- Webhook handling for payment events
- Invoice generation and management

### AI Services
- Usage tracking and limits
- Query generation assistance
- Natural language processing

## Security Features

- **Row Level Security (RLS)**: Database-level access control
- **Authentication Middleware**: Route protection
- **Input Validation**: Form and API input sanitization
- **CSRF Protection**: Built-in Next.js security
- **Environment Variables**: Secure configuration management

## Performance Optimizations

- **Next.js 14 App Router**: Optimized routing and rendering
- **Component Code Splitting**: Automatic bundle optimization
- **Image Optimization**: Next.js image component
- **Caching**: Strategic caching for API responses
- **Loading States**: Smooth user experience during data fetching

## Troubleshooting

### Common Issues

1. **Supabase Connection Errors**
   - Verify environment variables are set correctly
   - Check if Supabase local instance is running
   - Ensure network connectivity to Supabase

2. **Authentication Issues**
   - Clear browser cookies and local storage
   - Verify Supabase auth configuration
   - Check redirect URLs in Supabase dashboard

3. **Build Errors**
   - Ensure all dependencies are installed
   - Check TypeScript configuration
   - Verify environment variables for build

### Development Tips

- Use the browser dev tools to inspect network requests
- Check the Supabase Studio for database queries
- Monitor console logs for client-side errors
- Use the Next.js development tools for debugging

## Contributing

When contributing to the web application:

1. Follow the existing code structure and patterns
2. Add tests for new components and features
3. Update documentation for new functionality
4. Ensure TypeScript types are properly defined
5. Test authentication flows thoroughly

## Future Enhancements

- **Real-time Notifications**: WebSocket integration for live updates
- **Advanced Analytics**: Detailed usage analytics dashboard
- **Team Management**: Multi-user account features
- **API Documentation**: Interactive API documentation
- **Mobile Responsiveness**: Enhanced mobile experience