import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { User } from '@supabase/supabase-js'
import BillingPage from '../BillingPage'
import { dashboardService } from '@/lib/dashboard-service'

// Mock the dashboard service
jest.mock('@/lib/dashboard-service', () => ({
    dashboardService: {
        getUserProfile: jest.fn(),
        getUsageStats: jest.fn(),
        formatDate: jest.fn((date) => new Date(date).toLocaleDateString()),
    }
}))

const mockUser: User = {
    id: 'test-user-id',
    email: 'test@example.com',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    aud: 'authenticated',
    role: 'authenticated',
    app_metadata: {},
    user_metadata: {},
}

const mockProfile = {
    id: 'test-user-id',
    email: 'test@example.com',
    subscription_tier: 'free' as const,
    ai_usage_count: 3,
    ai_usage_reset_date: '2024-01-01T00:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
}

const mockUsageStats = {
    user_id: 'test-user-id',
    period_start: '2024-01-01T00:00:00Z',
    period_end: '2024-02-01T00:00:00Z',
    ai_queries_used: 3,
    ai_queries_limit: 10,
    connections_used: 1,
    connections_limit: 3,
    storage_used: 0,
    storage_limit: 1073741824,
}

describe('BillingPage', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders loading state initially', () => {
        ;(dashboardService.getUserProfile as jest.Mock).mockImplementation(() => new Promise(() => {}))
        ;(dashboardService.getUsageStats as jest.Mock).mockImplementation(() => new Promise(() => {}))

        render(<BillingPage user={mockUser} />)

        expect(screen.getByText('Billing & Subscription')).toBeInTheDocument()
    })

    it('renders billing information after loading', async () => {
        ;(dashboardService.getUserProfile as jest.Mock).mockResolvedValue(mockProfile)
        ;(dashboardService.getUsageStats as jest.Mock).mockResolvedValue(mockUsageStats)

        render(<BillingPage user={mockUser} />)

        await waitFor(() => {
            expect(screen.getByText('Current Plan')).toBeInTheDocument()
        })

        expect(screen.getByText('Free')).toBeInTheDocument()
        expect(screen.getByText('Usage Overview')).toBeInTheDocument()
        expect(screen.getByText('Available Plans')).toBeInTheDocument()
    })

    it('shows upgrade button for free plan users', async () => {
        ;(dashboardService.getUserProfile as jest.Mock).mockResolvedValue(mockProfile)
        ;(dashboardService.getUsageStats as jest.Mock).mockResolvedValue(mockUsageStats)

        render(<BillingPage user={mockUser} />)

        await waitFor(() => {
            expect(screen.getByText('Upgrade')).toBeInTheDocument()
        })

        expect(screen.getAllByText(/Upgrade to/)).toHaveLength(2) // Pro and Enterprise upgrade buttons
    })

    it('shows usage statistics correctly', async () => {
        ;(dashboardService.getUserProfile as jest.Mock).mockResolvedValue(mockProfile)
        ;(dashboardService.getUsageStats as jest.Mock).mockResolvedValue(mockUsageStats)

        render(<BillingPage user={mockUser} />)

        await waitFor(() => {
            expect(screen.getByText('3 / 10')).toBeInTheDocument()
        })

        expect(screen.getByText('1 / 3')).toBeInTheDocument()
    })

    it('handles upgrade button click', async () => {
        ;(dashboardService.getUserProfile as jest.Mock).mockResolvedValue(mockProfile)
        ;(dashboardService.getUsageStats as jest.Mock).mockResolvedValue(mockUsageStats)

        // Mock window.alert
        const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})

        render(<BillingPage user={mockUser} />)

        await waitFor(() => {
            expect(screen.getByText('Upgrade')).toBeInTheDocument()
        })

        const upgradeButton = screen.getByText('Upgrade')
        fireEvent.click(upgradeButton)

        expect(screen.getByText('Upgrading...')).toBeInTheDocument()

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Upgrade to pro plan initiated'))
        }, { timeout: 3000 })

        alertSpy.mockRestore()
    })

    it('shows pro plan features for pro users', async () => {
        const proProfile = {
            ...mockProfile,
            subscription_tier: 'pro' as const,
        }

        const proUsageStats = {
            ...mockUsageStats,
            ai_queries_limit: 1000,
            connections_limit: 50,
        }

        ;(dashboardService.getUserProfile as jest.Mock).mockResolvedValue(proProfile)
        ;(dashboardService.getUsageStats as jest.Mock).mockResolvedValue(proUsageStats)

        render(<BillingPage user={mockUser} />)

        await waitFor(() => {
            expect(screen.getByText('Pro')).toBeInTheDocument()
        })

        expect(screen.getByText('3 / 1000')).toBeInTheDocument()
        expect(screen.getByText('1 / 50')).toBeInTheDocument()
        expect(screen.getByText('Current Plan')).toBeInTheDocument()
    })

    it('shows unlimited usage for enterprise users', async () => {
        const enterpriseProfile = {
            ...mockProfile,
            subscription_tier: 'enterprise' as const,
        }

        const enterpriseUsageStats = {
            ...mockUsageStats,
            ai_queries_limit: -1,
            connections_limit: -1,
        }

        ;(dashboardService.getUserProfile as jest.Mock).mockResolvedValue(enterpriseProfile)
        ;(dashboardService.getUsageStats as jest.Mock).mockResolvedValue(enterpriseUsageStats)

        render(<BillingPage user={mockUser} />)

        await waitFor(() => {
            expect(screen.getByText('Enterprise')).toBeInTheDocument()
        })

        expect(screen.getByText('3 / ∞')).toBeInTheDocument()
        expect(screen.getByText('1 / ∞')).toBeInTheDocument()
    })

    it('shows empty payment history for new users', async () => {
        ;(dashboardService.getUserProfile as jest.Mock).mockResolvedValue(mockProfile)
        ;(dashboardService.getUsageStats as jest.Mock).mockResolvedValue(mockUsageStats)

        render(<BillingPage user={mockUser} />)

        await waitFor(() => {
            expect(screen.getByText('Payment History')).toBeInTheDocument()
        })

        expect(screen.getByText('No payment history yet.')).toBeInTheDocument()
        expect(screen.getByText('Payments will appear here once you upgrade to a paid plan.')).toBeInTheDocument()
    })

    it('shows help and support section', async () => {
        ;(dashboardService.getUserProfile as jest.Mock).mockResolvedValue(mockProfile)
        ;(dashboardService.getUsageStats as jest.Mock).mockResolvedValue(mockUsageStats)

        render(<BillingPage user={mockUser} />)

        await waitFor(() => {
            expect(screen.getByText('Need Help?')).toBeInTheDocument()
        })

        expect(screen.getByText('Billing Support')).toBeInTheDocument()
        expect(screen.getByText('Contact Billing')).toBeInTheDocument()
    })

    it('handles loading errors gracefully', async () => {
        ;(dashboardService.getUserProfile as jest.Mock).mockRejectedValue(new Error('Network error'))
        ;(dashboardService.getUsageStats as jest.Mock).mockRejectedValue(new Error('Network error'))

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

        render(<BillingPage user={mockUser} />)

        await waitFor(() => {
            expect(screen.getByText('Billing & Subscription')).toBeInTheDocument()
        })

        expect(consoleSpy).toHaveBeenCalledWith('Error loading billing data:', expect.any(Error))
        consoleSpy.mockRestore()
    })
})