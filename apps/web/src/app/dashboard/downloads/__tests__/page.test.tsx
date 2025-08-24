import { render, screen } from '@testing-library/react'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import Downloads from '../page'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
    redirect: jest.fn(),
}))

// Mock Supabase server client
jest.mock('@/lib/supabase-server', () => ({
    createServerClient: jest.fn(),
}))

// Mock the components
jest.mock('@/components/dashboard/DashboardLayout', () => {
    return function MockDashboardLayout({ children }: { children: React.ReactNode }) {
        return <div data-testid="dashboard-layout">{children}</div>
    }
})

jest.mock('../../../../components/dashboard/DownloadsPage', () => {
    return function MockDownloadsPage({ user }: { user: { email: string } }) {
        return <div data-testid="downloads-page">Downloads for {user.email}</div>
    }
})

const mockSupabaseClient = {
    auth: {
        getUser: jest.fn(),
    },
}

const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: {},
}

describe('Downloads Page', () => {
    beforeEach(() => {
        jest.clearAllMocks()
            ; (createServerClient as jest.Mock).mockResolvedValue(mockSupabaseClient)
    })

    it('renders downloads page when user is authenticated', async () => {
        mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: mockUser },
            error: null,
        })

        const DownloadsComponent = await Downloads()
        render(DownloadsComponent)

        expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument()
        expect(screen.getByTestId('downloads-page')).toBeInTheDocument()
        expect(screen.getByText('Downloads for test@example.com')).toBeInTheDocument()
    })

    it('redirects to signin when user is not authenticated', async () => {
        mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: null },
            error: null,
        })

        await Downloads()

        expect(redirect).toHaveBeenCalledWith('/auth/signin')
    })

    it('redirects to signin when getUser returns error', async () => {
        mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: null },
            error: { message: 'Authentication error' },
        })

        await Downloads()

        expect(redirect).toHaveBeenCalledWith('/auth/signin')
    })

    it('creates server client correctly', async () => {
        mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: mockUser },
            error: null,
        })

        await Downloads()

        expect(createServerClient).toHaveBeenCalledTimes(1)
        expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledTimes(1)
    })
})