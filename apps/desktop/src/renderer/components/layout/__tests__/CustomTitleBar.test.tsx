import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { CustomTitleBar } from '../CustomTitleBar';
import { AuthProvider } from '../../../contexts/AuthContext';
import { AuthUser } from '@database-gui/types';

// Wrapper component for tests
const TestWrapper = ({ children, user = null }: { children: React.ReactNode; user?: AuthUser | null }) => (
  <AuthProvider user={user} setUser={vi.fn()}>
    {children}
  </AuthProvider>
);

describe('CustomTitleBar', () => {
  it('renders all title bar elements', () => {
    render(
      <TestWrapper>
        <CustomTitleBar />
      </TestWrapper>
    );
    
    // Check for menu button
    expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument();
    
    // Check for database switcher
    expect(screen.getByText('No Database')).toBeInTheDocument();
    
    // Check for search input
    expect(screen.getByPlaceholderText('Search databases, tables...')).toBeInTheDocument();
    
    // Check for chat button
    expect(screen.getByRole('button', { name: 'Toggle AI Chat' })).toBeInTheDocument();
    
    // Check for window controls
    expect(screen.getByRole('button', { name: 'Minimize window' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Maximize window' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close window' })).toBeInTheDocument();
  });

  it('calls window controls when clicked', async () => {
    const mockMinimize = vi.fn();
    const mockMaximize = vi.fn();
    const mockClose = vi.fn();
    
    // Mock the electronAPI
    window.electronAPI = {
      ...window.electronAPI,
      window: {
        minimize: mockMinimize,
        maximize: mockMaximize,
        close: mockClose,
        isMaximized: vi.fn().mockResolvedValue(false),
      },
    };

    render(
      <TestWrapper>
        <CustomTitleBar />
      </TestWrapper>
    );
    
    const buttons = screen.getAllByRole('button');
    
    // Find and click minimize button (should be one of the last 3 buttons)
    const minimizeButton = buttons[buttons.length - 3];
    await act(async () => {
      fireEvent.click(minimizeButton);
    });
    
    // Find and click maximize button
    const maximizeButton = buttons[buttons.length - 2];
    await act(async () => {
      fireEvent.click(maximizeButton);
    });
    
    // Find and click close button
    const closeButton = buttons[buttons.length - 1];
    await act(async () => {
      fireEvent.click(closeButton);
    });
    
    // Wait for async calls
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(mockMinimize).toHaveBeenCalled();
    expect(mockMaximize).toHaveBeenCalled();
    expect(mockClose).toHaveBeenCalled();
  });

  it('updates search query when typing', () => {
    render(
      <TestWrapper>
        <CustomTitleBar />
      </TestWrapper>
    );
    
    const searchInput = screen.getByPlaceholderText('Search databases, tables...');
    act(() => {
      fireEvent.change(searchInput, { target: { value: 'test query' } });
    });
    
    expect(searchInput).toHaveValue('test query');
  });

  it('handles menu and database switcher clicks', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    render(
      <TestWrapper>
        <CustomTitleBar />
      </TestWrapper>
    );
    
    // Click menu button
    const menuButton = screen.getByRole('button', { name: 'Menu' });
    fireEvent.click(menuButton);
    expect(consoleSpy).toHaveBeenCalledWith('Menu clicked');
    
    // Click database switcher
    const dbButton = screen.getByText('No Database').closest('button');
    fireEvent.click(dbButton!);
    expect(consoleSpy).toHaveBeenCalledWith('Database switch clicked');
    
    consoleSpy.mockRestore();
  });
});