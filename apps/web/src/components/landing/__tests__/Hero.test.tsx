import { render, screen } from '@testing-library/react'
import Hero from '../Hero'

describe('Hero Component', () => {
    it('renders the main heading', () => {
        render(<Hero />)

        expect(screen.getByText(/AI-Powered Database Management/)).toBeInTheDocument()
        expect(screen.getByText(/Made Simple/)).toBeInTheDocument()
    })

    it('renders the description text', () => {
        render(<Hero />)

        expect(screen.getByText(/Connect to MongoDB, MySQL, PostgreSQL, and SQLite databases/)).toBeInTheDocument()
    })

    it('renders call-to-action buttons', () => {
        render(<Hero />)

        expect(screen.getByRole('link', { name: /Get Started Free/ })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /Watch Demo/ })).toBeInTheDocument()
    })

    it('renders feature highlights', () => {
        render(<Hero />)

        expect(screen.getByText('Local Database Connections')).toBeInTheDocument()
        expect(screen.getByText('AI Query Assistant')).toBeInTheDocument()
        expect(screen.getByText('Cross-Platform Desktop')).toBeInTheDocument()
    })

    it('has correct links for CTA buttons', () => {
        render(<Hero />)

        const getStartedLink = screen.getByRole('link', { name: /Get Started Free/ })
        const watchDemoLink = screen.getByRole('link', { name: /Watch Demo/ })

        expect(getStartedLink).toHaveAttribute('href', '/auth/signup')
        expect(watchDemoLink).toHaveAttribute('href', '#demo')
    })
})