import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MainLayout } from '../MainLayout';

// Mock CustomTitleBar
vi.mock('../CustomTitleBar', () => ({
  CustomTitleBar: ({ user }: any) => (
    <div data-testid="custom-title-bar">
      Title Bar - User: {user ? user.email : 'No user'}
    </div>
  ),
}));

describe('MainLayout', () => {
  it('renders the main layout structure', () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    const mockOnSkipLogin = vi.fn();
    
    render(<MainLayout user={mockUser} onSkipLogin={mockOnSkipLogin} />);
    
    // Check for title bar
    expect(screen.getByTestId('custom-title-bar')).toBeInTheDocument();
    expect(screen.getByText('Title Bar - User: test@example.com')).toBeInTheDocument();
    
    // Check for main content areas
    expect(screen.getByText('Database Explorer')).toBeInTheDocument();
    expect(screen.getByText('Query Editor')).toBeInTheDocument();
    expect(screen.getByText('Results')).toBeInTheDocument();
    
    // Check for placeholder content
    expect(screen.getByText('Connect to a database to explore its structure')).toBeInTheDocument();
    expect(screen.getByText('Write and execute database queries')).toBeInTheDocument();
    expect(screen.getByText('Query results will appear here')).toBeInTheDocument();
  });

  it('renders without user', () => {
    const mockOnSkipLogin = vi.fn();
    
    render(<MainLayout user={null} onSkipLogin={mockOnSkipLogin} />);
    
    expect(screen.getByText('Title Bar - User: No user')).toBeInTheDocument();
  });

  it('has proper layout structure with flex classes', () => {
    const mockOnSkipLogin = vi.fn();
    
    const { container } = render(<MainLayout onSkipLogin={mockOnSkipLogin} />);
    
    // Check main container has proper classes
    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass('h-screen', 'flex', 'flex-col', 'bg-background');
  });
});