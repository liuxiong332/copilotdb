import { render, screen, waitFor } from '@testing-library/react'
import { User } from '@supabase/supabase-js'
import DashboardOverview from '../DashboardOverview'
import { dashboardService } from '@/lib/dashboard-service'

// Mock the dashboard service
jest.mock('@/lib/dashboard-service', () => ({
    dashboardService: {
        getUserProfile: jest.fn(),
        getUsageStats: jest.fn(),
        getDownloadStats: jest.fn(),
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

const mockDownloadStats = [
    {
        user_id: 'test-user-id',
        platform: 'windows' as const,
        version: '1.0.0',
        downloaded_at: '2024-01-01T00:00:00Z',
    }
]

describe('DashboardOverview', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders loading state initially', () => {
        ;(dashboardService.getUserProfile as jest.Mock).mockImplementation(() => new Promise(() => {}))
        ;(dashboardService.getUsageStats as jest.Mock).mockImplementation(() => new Promise(() => {}))
        ;(dashboardService.getDownloadStats as jest.Mock).mockImplementation(() => new Promise(() => {}))

        render(<DashboardOverview user={mockUser} />)

        expect(screen.getByText('Welcome back!')).toBeInTheDocument()
        expect(screen.getAllByRole('generic')).toHaveLength(expect.any(Number))
    })

    it('renders dashboard data after loading', async () => {
        ;(dashboardService.getUserProfile as jest.Mock).mockResolvedValue(mockProfile)
        ;(dashboardService.getUsageStats as jest.Mock).mockResolvedValue(mockUsageStats)
        ;(dashboardService.getDownloadStats as jest.Mock).mockResolvedValue(mockDownloadStats)

        render(<DashboardOverview user={mockUser} />)

        await waitFor(() => {
            expect(screen.getByText('Welcome back, test!')).toBeInTheDocument()
        })

        // Check stats are displayed
        expect(screen.getByText('Free Plan')).toBeInTheDocument()
        expect(screen.getByText('3 / 10')).toBeInTheDocument()
        expect(screen.getByText('1 / 3')).toBeInTheDocument()
        expect(screen.getByText('1')).toBeInTheDocument() // Downloads count
    })

    it('shows usage alerts when limits are high', async () => {
        const highUsageStats = {
            ...mockUsageStats,
            ai_queries_used: 9,
            connections_used: 3,
        }

        ;(dashboardService.getUserProfile as jest.Mock).mockResolvedValue(mockProfile)
        ;(dashboardService.getUsageStats as jest.Mock).mockResolvedValue(highUsageStats)
        ;(dashboardService.getDownloadStats as jest.Mock).mockResolvedValue(mockDownloadStats)

        render(<DashboardOverview user={mockUser} />)

        await waitFor(() => {
            expect(screen.getByText('AI Query Usage High')).toBeInTheDocument()
        })

        await waitFor(() => {
            expect(screen.getByText('Connection Limit Almost Reached')).toBeInTheDocument()
        })
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
        ;(dashboardService.getDownloadStats as jest.Mock).mockResolvedValue(mockDownloadStats)

        render(<DashboardOverview user={mockUser} />)

        await waitFor(() => {
            expect(screen.getByText('Pro Plan')).toBeInTheDocument()
        })

        expect(screen.getByText('3 / 1000')).toBeInTheDocument()
        expect(screen.getByText('1 / 50')).toBeInTheDocument()
    })

    it('shows recent downloads when available', async () => {
        ;(dashboardService.getUserProfile as jest.Mock).mockResolvedValue(mockProfile)
        ;(dashboardService.getUsageStats as jest.Mock).mockResolvedValue(mockUsageStats)
        ;(dashboardService.getDownloadStats as jest.Mock).mockResolvedValue(mockDownloadStats)

        render(<DashboardOverview user={mockUser} />)

        await waitFor(() => {
            expect(screen.getByText('Recent Downloads')).toBeInTheDocument()
        })

        expect(screen.getByText('Windows App v1.0.0')).toBeInTheDocument()
    })

    it('shows get started section for new users', async () => {
        ;(dashboardService.getUserProfile as jest.Mock).mockResolvedValue(mockProfile)
        ;(dashboardService.getUsageStats as jest.Mock).mockResolvedValue(mockUsageStats)
        ;(dashboardService.getDownloadStats as jest.Mock).mockResolvedValue([])

        render(<DashboardOverview user={mockUser} />)

        await waitFor(() => {
            expect(screen.getByText('Get Started')).toBeInTheDocument()
        })

        expect(screen.getByText('Ready to start managing your databases?')).toBeInTheDocument()
        expect(screen.getByText('Download Now')).toBeInTheDocument()
    })

    it('handles loading errors gracefully', async () => {
        ;(dashboardService.getUserProfile as jest.Mock).mockRejectedValue(new Error('Network error'))
        ;(dashboardService.getUsageStats as jest.Mock).mockRejectedValue(new Error('Network error'))
        ;(dashboardService.getDownloadStats as jest.Mock).mockRejectedValue(new Error('Network error'))

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

        render(<DashboardOverview user={mockUser} />)

        await waitFor(() => {
            expect(screen.getByText('Welcome back!')).toBeInTheDocument()
        })

        expect(consoleSpy).toHaveBeenCalledWith('Error loading dashboard data:', expect.any(Error))
        consoleSpy.mockRestore()
    })
})