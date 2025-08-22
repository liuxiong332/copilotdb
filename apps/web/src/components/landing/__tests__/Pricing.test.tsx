import { render, screen } from '@testing-library/react'
import Pricing from '../Pricing'

describe('Pricing Component', () => {
    it('renders the pricing section heading', () => {
        render(<Pricing />)

        expect(screen.getByText('Choose the right plan for you')).toBeInTheDocument()
    })

    it('renders all pricing tiers', () => {
        render(<Pricing />)

        expect(screen.getByText('Free')).toBeInTheDocument()
        expect(screen.getByText('Pro')).toBeInTheDocument()
        expect(screen.getByText('Enterprise')).toBeInTheDocument()
    })

    it('displays pricing information', () => {
        render(<Pricing />)

        expect(screen.getByText('$0')).toBeInTheDocument()
        expect(screen.getByText('$19')).toBeInTheDocument()
        expect(screen.getByText('Custom')).toBeInTheDocument()
    })

    it('shows the most popular plan indicator', () => {
        render(<Pricing />)

        expect(screen.getByText('Most popular')).toBeInTheDocument()
    })

    it('renders feature lists for each tier', () => {
        render(<Pricing />)

        // Free tier features
        expect(screen.getByText('Connect to all database types')).toBeInTheDocument()
        expect(screen.getByText('10 AI queries per month')).toBeInTheDocument()

        // Pro tier features
        expect(screen.getByText('Unlimited AI queries')).toBeInTheDocument()
        expect(screen.getByText('Natural language chat')).toBeInTheDocument()

        // Enterprise features
        expect(screen.getByText('Custom AI model training')).toBeInTheDocument()
        expect(screen.getByText('SSO integration')).toBeInTheDocument()
    })

    it('has correct CTA buttons', () => {
        render(<Pricing />)

        const getStartedButtons = screen.getAllByText('Get started')
        const contactSalesButton = screen.getByText('Contact sales')

        expect(getStartedButtons).toHaveLength(2) // Free and Pro tiers
        expect(contactSalesButton).toBeInTheDocument()
    })
})