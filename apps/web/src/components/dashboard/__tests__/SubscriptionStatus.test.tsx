import { render, screen, waitFor } from '@testing-library/react'
import { User } from '@supabase/supabase-js'
import SubscriptionStatus from '../SubscriptionStatus'
import { dashboardService } from '@/lib/dashboard-service'
import { paymentService } from '@/lib/payment-service'

// Mock services
jest.mock('@/lib/dashboard-service')
jest.mock('@/lib/payment-service')

const mockUser: User = {
    id: 'user123',
    email: 'test@example.com',
    aud: 'authenticated',
    role: 'authenticated',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    app_metadata: {},
    user_metadata: {}
}

const mockProfile = {
    id: 'user123',
    email: 'test@example.com',
    subscription_tier: 'free',
    ai_usage_count: 5,
    ai_usage_reset_date: '2024-01-01T00:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
}

const mockUsageStats = {
    user_id: 'user123',
    period_start: '2024-01-01T00:00:00Z',
    period_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    ai_queries_used: 8,
    ai_queries_limit: 10,
    connections_used: 2,
    connections_limit: 3,
    storage_used: 0,
    storage_limit: 1024 * 1024 * 1024
}

describe('SubscriptionStatus', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(dashboardService.getUserProfile as jest.Mock).mockResolvedValue(mockProfile)
        ;(dashboardService.getUsageStats as jest.Mock).mockResolvedValue(mockUsageStats)
        ;(paymentService.formatDate as jest.Mock).mockImplementation((date) => new Date(date).toLocaleDateString())
    })

    it('should render free plan status', async () => {
        render(<SubscriptionStatus user={mockUser} />)

        await waitFor(() => {
            expect(screen.getByText('Free Plan')).toBeInTheDocument()
            expect(screen.getByText('Upgrade to unlock more features')).toBeInTheDocument()
            expect(screen.getByText('Upgrade')).toBeInTheDocument()
        })
    })

    it('should render pro plan status', async () => {
        const proProfile = { ...mockProfile, subscription_tier: 'pro' }
        ;(dashboardService.getUserProfile as jest.Mock).mockResolvedValue(proProfile)

        render(<SubscriptionStatus user={mockUser} />)

        await waitFor(() => {
            expect(screen.getByText('Pro Plan')).toBeInTheDocument()
            expect(screen.getByText('Active subscription')).toBeInTheDocument()
            expect(screen.queryByText('Upgrade')).not.toBeInTheDocument()
        })
    })

    it('should render enterprise plan status', async () => {
        const enterpriseProfile = { ...mockProfile, subscription_tier: 'enterprise' }
        const enterpriseUsageStats = {
            ...mockUsageStats,
            ai_queries_limit: -1, // unlimited
            connections_limit: -1 // unlimited
        }
        ;(dashboardService.getUserProfile as jest.Mock).mockResolvedValue(enterpriseProfile)
        ;(dashboardService.getUsageStats as jest.Mock).mockResolvedValue(enterpriseUsageStats)

        render(<SubscriptionStatus user={mockUser} />)

        await waitFor(() => {
            expect(screen.getByText('Enterprise Plan')).toBeInTheDocument()
            expect(screen.getByText('Active subscription')).toBeInTheDocument()
        })
    })

    it('should show usage warnings when limits are exceeded', async () => {
        const highUsageStats = {
            ...mockUsageStats,
            ai_queries_used: 9, // 90% of limit
            connections_used: 3 // 100% of limit
        }
        ;(dashboardService.getUsageStats as jest.Mock).mockResolvedValue(highUsageStats)

        render(<SubscriptionStatus user={mockUser} />)

        await waitFor(() => {
            expect(screen.getByText(/You've used 9 of 10 AI queries/)).toBeInTheDocument()
            expect(screen.getByText(/You're using 3 of 3 database connections/)).toBeInTheDocument()
        })
    })

    it('should show usage reset notification when period is ending soon', async () => {
        const soonToResetStats = {
            ...mockUsageStats,
            period_end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from now
        }
        ;(dashboardService.getUsageStats as jest.Mock).mockResolvedValue(soonToResetStats)

        render(<SubscriptionStatus user={mockUser} />)

        await waitFor(() => {
            expect(screen.getByText(/Your usage limits will reset in 3 days/)).toBeInTheDocument()
        })
    })

    it('should not show reset notification for enterprise users', async () => {
        const enterpriseProfile = { ...mockProfile, subscription_tier: 'enterprise' }
        const soonToResetStats = {
            ...mockUsageStats,
            period_end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from now
        }
        ;(dashboardService.getUserProfile as jest.Mock).mockResolvedValue(enterpriseProfile)
        ;(dashboardService.getUsageStats as jest.Mock).mockResolvedValue(soonToResetStats)

        render(<SubscriptionStatus user={mockUser} />)

        await waitFor(() => {
            expect(screen.queryByText(/Your usage limits will reset/)).not.toBeInTheDocument()
        })
    })

    it('should handle loading state', () => {
        ;(dashboardService.getUserProfile as jest.Mock).mockImplementation(() => new Promise(() => {}))
        ;(dashboardService.getUsageStats as jest.Mock).mockImplementation(() => new Promise(() => {}))

        render(<SubscriptionStatus user={mockUser} />)

        expect(screen.getByRole('generic')).toHaveClass('animate-pulse')
    })

    it('should handle service errors gracefully', async () => {
        ;(dashboardService.getUserProfile as jest.Mock).mockRejectedValue(new Error('Service error'))

        render(<SubscriptionStatus user={mockUser} />)

        await waitFor(() => {
            // Should show loading state and not crash
            expect(screen.getByRole('generic')).toHaveClass('animate-pulse')
        })
    })
})