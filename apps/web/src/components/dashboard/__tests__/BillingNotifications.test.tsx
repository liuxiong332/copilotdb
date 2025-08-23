import { render, screen, waitFor } from '@testing-library/react'
import { User } from '@supabase/supabase-js'
import BillingNotifications from '../BillingNotifications'
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

const mockPayments = [
    {
        id: 'payment1',
        user_id: 'user123',
        stripe_payment_id: 'pi_123',
        amount: 1900,
        currency: 'USD',
        status: 'succeeded' as const,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        updated_at: new Date().toISOString()
    }
]

describe('BillingNotifications', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(dashboardService.getUserProfile as jest.Mock).mockResolvedValue(mockProfile)
        ;(dashboardService.getPaymentHistory as jest.Mock).mockResolvedValue(mockPayments)
        ;(paymentService.formatPrice as jest.Mock).mockImplementation((amount, currency) => `$${amount}`)
        ;(paymentService.formatDate as jest.Mock).mockImplementation((date) => new Date(date).toLocaleDateString())
        ;(paymentService.manageSubscription as jest.Mock).mockResolvedValue(undefined)
    })

    it('should render successful payment notification for recent payments', async () => {
        render(<BillingNotifications user={mockUser} />)

        await waitFor(() => {
            expect(screen.getByText('Payment Successful')).toBeInTheDocument()
            expect(screen.getByText(/Your payment of \$19 was processed successfully/)).toBeInTheDocument()
        })
    })

    it('should render upgrade prompt for free users', async () => {
        render(<BillingNotifications user={mockUser} />)

        await waitFor(() => {
            expect(screen.getByText('Unlock Premium Features')).toBeInTheDocument()
            expect(screen.getByText(/Upgrade to Pro or Enterprise/)).toBeInTheDocument()
        })
    })

    it('should render failed payment notification', async () => {
        const failedPayments = [
            {
                ...mockPayments[0],
                status: 'failed' as const,
                created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
            }
        ]
        ;(dashboardService.getPaymentHistory as jest.Mock).mockResolvedValue(failedPayments)

        render(<BillingNotifications user={mockUser} />)

        await waitFor(() => {
            expect(screen.getByText('Payment Failed')).toBeInTheDocument()
            expect(screen.getByText(/Your recent payment failed/)).toBeInTheDocument()
            expect(screen.getByText('Update Payment Method')).toBeInTheDocument()
        })
    })

    it('should not render notifications for pro users without recent payments', async () => {
        const proProfile = { ...mockProfile, subscription_tier: 'pro' }
        ;(dashboardService.getUserProfile as jest.Mock).mockResolvedValue(proProfile)
        ;(dashboardService.getPaymentHistory as jest.Mock).mockResolvedValue([])

        render(<BillingNotifications user={mockUser} />)

        await waitFor(() => {
            expect(screen.queryByText('Unlock Premium Features')).not.toBeInTheDocument()
            expect(screen.queryByText('Payment Successful')).not.toBeInTheDocument()
        })
    })

    it('should handle dismissing notifications', async () => {
        render(<BillingNotifications user={mockUser} />)

        await waitFor(() => {
            expect(screen.getByText('Payment Successful')).toBeInTheDocument()
        })

        // Find and click dismiss button
        const dismissButton = screen.getAllByRole('button').find(button => 
            button.querySelector('svg') // Looking for the X icon
        )
        
        if (dismissButton) {
            dismissButton.click()
            
            await waitFor(() => {
                expect(screen.queryByText('Payment Successful')).not.toBeInTheDocument()
            })
        }
    })

    it('should handle service errors gracefully', async () => {
        ;(dashboardService.getUserProfile as jest.Mock).mockRejectedValue(new Error('Service error'))

        render(<BillingNotifications user={mockUser} />)

        // Should not crash and should not show any notifications
        await waitFor(() => {
            expect(screen.queryByText('Payment Successful')).not.toBeInTheDocument()
            expect(screen.queryByText('Unlock Premium Features')).not.toBeInTheDocument()
        })
    })
})