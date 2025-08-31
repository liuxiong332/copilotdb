import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { AuthUser } from '@database-gui/types';

// Test component to use the auth context
function TestComponent() {
  const { user, setUser, isAuthenticated, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="user-email">{user?.email || 'No user'}</div>
      <div data-testid="is-authenticated">{isAuthenticated.toString()}</div>
      <button onClick={() => setUser({ 
        id: '123', 
        email: 'test@example.com',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        app_metadata: {},
        user_metadata: {},
      })}>
        Set User
      </button>
      <button onClick={() => setUser(null)}>Clear User</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  const mockSetUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
  });

  it('provides user context when user is provided', () => {
    const mockUser: AuthUser = {
      id: '123',
      email: 'test@example.com',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      app_metadata: {},
      user_metadata: {},
    };

    render(
      <AuthProvider user={mockUser} setUser={mockSetUser}>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
  });

  it('provides null user context when no user is provided', () => {
    render(
      <AuthProvider user={null} setUser={mockSetUser}>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
  });

  it('allows setting user through context', () => {
    render(
      <AuthProvider user={null} setUser={mockSetUser}>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Set User'));

    expect(mockSetUser).toHaveBeenCalledWith({
      id: '123',
      email: 'test@example.com',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      app_metadata: {},
      user_metadata: {},
    });
  });

  it('allows clearing user through context', () => {
    const mockUser: AuthUser = {
      id: '123',
      email: 'test@example.com',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      app_metadata: {},
      user_metadata: {},
    };

    render(
      <AuthProvider user={mockUser} setUser={mockSetUser}>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Clear User'));

    expect(mockSetUser).toHaveBeenCalledWith(null);
  });

  it('handles logout correctly', () => {
    const mockUser: AuthUser = {
      id: '123',
      email: 'test@example.com',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      app_metadata: {},
      user_metadata: {},
    };

    // Set some localStorage items
    localStorage.setItem('supabase-session', 'test-session');
    localStorage.setItem('auth-skipped', 'true');

    render(
      <AuthProvider user={mockUser} setUser={mockSetUser}>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Logout'));

    expect(mockSetUser).toHaveBeenCalledWith(null);
    expect(localStorage.getItem('supabase-session')).toBeNull();
    expect(localStorage.getItem('auth-skipped')).toBeNull();
  });

  it('throws error when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });
});