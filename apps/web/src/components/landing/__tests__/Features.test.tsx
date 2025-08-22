import { render, screen } from '@testing-library/react'
import Features from '../Features'

describe('Features Component', () => {
    it('renders the section heading', () => {
        render(<Features />)

        expect(screen.getByText('Powerful Features')).toBeInTheDocument()
        expect(screen.getByText('Everything you need for database management')).toBeInTheDocument()
    })

    it('renders all feature items', () => {
        render(<Features />)

        // Check for key features
        expect(screen.getByText('Multi-Database Support')).toBeInTheDocument()
        expect(screen.getByText('AI Query Assistant')).toBeInTheDocument()
        expect(screen.getByText('Local Security')).toBeInTheDocument()
        expect(screen.getByText('Lightning Fast')).toBeInTheDocument()
        expect(screen.getByText('Cross-Platform Desktop')).toBeInTheDocument()
        expect(screen.getByText('Natural Language Chat')).toBeInTheDocument()
    })

    it('renders feature descriptions', () => {
        render(<Features />)

        expect(screen.getByText(/Connect to MongoDB, MySQL, PostgreSQL, and SQLite databases/)).toBeInTheDocument()
        expect(screen.getByText(/Generate SQL and MongoDB queries using natural language/)).toBeInTheDocument()
        expect(screen.getByText(/Your database connections stay local/)).toBeInTheDocument()
    })

    it('has proper accessibility structure', () => {
        render(<Features />)

        // Check for proper heading hierarchy
        expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()

        // Check for definition list structure (dl elements don't have list role by default)
        const featureTerms = screen.getAllByRole('term')
        expect(featureTerms.length).toBeGreaterThan(0)
    })
})