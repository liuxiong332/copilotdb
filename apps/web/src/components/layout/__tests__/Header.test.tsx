import { render, screen, fireEvent } from '@testing-library/react'
import Header from '../Header'

describe('Header Component', () => {
    it('renders the logo and brand name', () => {
        render(<Header />)

        expect(screen.getByText('Database GUI Client')).toBeInTheDocument()
    })

    it('renders navigation links', () => {
        render(<Header />)

        expect(screen.getByText('Features')).toBeInTheDocument()
        expect(screen.getByText('Demo')).toBeInTheDocument()
        expect(screen.getByText('Pricing')).toBeInTheDocument()
        expect(screen.getByText('Contact')).toBeInTheDocument()
    })

    it('renders authentication links', () => {
        render(<Header />)

        expect(screen.getByText('Sign In')).toBeInTheDocument()
        expect(screen.getByText('Get Started')).toBeInTheDocument()
    })

    it('has correct navigation hrefs', () => {
        render(<Header />)

        expect(screen.getByRole('link', { name: /Features/ })).toHaveAttribute('href', '#features')
        expect(screen.getByRole('link', { name: /Demo/ })).toHaveAttribute('href', '#demo')
        expect(screen.getByRole('link', { name: /Pricing/ })).toHaveAttribute('href', '#pricing')
        expect(screen.getByRole('link', { name: /Contact/ })).toHaveAttribute('href', '/contact')
    })

    it('toggles mobile menu when hamburger is clicked', () => {
        render(<Header />)

        // Find and click the mobile menu button
        const menuButton = screen.getByRole('button', { name: /Open main menu/ })
        fireEvent.click(menuButton)

        // Mobile navigation should now be visible - check for multiple Sign In links
        const signInLinks = screen.getAllByText('Sign In')
        expect(signInLinks).toHaveLength(2) // Desktop and mobile versions
    })

    it('has proper accessibility attributes', () => {
        render(<Header />)

        const navigation = screen.getByRole('navigation')
        expect(navigation).toHaveAttribute('aria-label', 'Top')

        const menuButton = screen.getByRole('button')
        expect(menuButton).toHaveAttribute('type', 'button')
    })
})