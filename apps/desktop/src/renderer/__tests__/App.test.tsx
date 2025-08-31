import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import { authHelpers } from '../lib/supabase';
import { AuthUser } from '@database-gui/types';

// Mock the auth helpers
vi.mock('../lib/supabase', () => ({
  authHelpers: {
    getSession: vi.fn(),
  },
}));

// Mock the components that aren't fully implemented yet
vi.mock('../components/layout/MainLayout', () => ({
  MainLayout: ({ user, onSkipLogin }: any) => (
    <div data-testid="main-layout">
      <div>Main Layout</div>
      <div>User: {user ? user.email : 'No user'}</div>
      <button onClick={onSkipLogin}>Skip Login</button>
    </div>
  ),
}));

vi.mock('../components/auth/AuthDialog', () => ({
  AuthDialog: ({ isOpen, onClose, onSkip, onSuccess }: any) => 
    isOpen ? (
      <div data-testid="auth-dialog" style={{ display: 'block' }}>
        <div>Auth Dialog</div>
        <button onClick={onSkip}>Skip</button>
        <button onClick={onClose}>Close</button>
        <button onClick={() => onSuccess({
          id: '123',
          email: 'test@example.com',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          app_metadata: {},
          user_metadata: {},
        })}>Success</button>
      </div>
    ) : (
      <div data-testid="auth-dialog" style={{ display: 'none' }}>
        <div>Auth Dialog</div>
        <button onClick={onSkip}>Skip</button>
        <button onClick={onClose}>Close</button>
      </div>
    ),
}));

const mockAuthHelpers = authHelpers as any;

const renderApp = () => {
  return render(<App />);
};

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    // Mock getSession to return no session by default
    mockAuthHelpers.getSession.mockResolvedValue({ session: null, error: null });
  });

  it('renders loading state initially', async () => {
    renderApp();
    expect(screen.getByText('Initializing...')).toBeInTheDocument();
    
    // Wait for initialization to complete
    await screen.findByTestId('main-layout');
  });

  it('shows auth dialog when no user and auth not skipped', async () => {
    renderApp();
    
    // Wait for initialization to complete
    await screen.findByTestId('main-layout');
    
    // Auth dialog should be visible
    const authDialog = screen.getByTestId('auth-dialog');
    expect(authDialog).toBeVisible();
  });

  it('does not show auth dialog when auth is skipped', async () => {
    localStorage.setItem('auth-skipped', 'true');
    
    renderApp();
    
    // Wait for initialization to complete
    await screen.findByTestId('main-layout');
    
    // Wait for the async timeout to complete
    await waitFor(() => {
      const authDialogs = screen.queryAllByTestId('auth-dialog');
      const visibleDialog = authDialogs.find(dialog => 
        dialog.style.display !== 'none'
      );
      expect(visibleDialog).toBeUndefined();
    }, { timeout: 1000 });
  });

  it('loads existing session on startup', async () => {
    const mockUser: AuthUser = {
      id: '123',
      email: 'test@example.com',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      app_metadata: {},
      user_metadata: {},
    };

    const mockSession = {
      access_token: 'token',
      refresh_token: 'refresh',
      expires_in: 3600,
      expires_at: Date.now() + 3600000,
      token_type: 'bearer',
      user: mockUser,
    };

    mockAuthHelpers.getSession.mockResolvedValue({ session: mockSession, error: null });

    renderApp();
    
    // Wait for initialization to complete and user to be set
    await waitFor(() => {
      expect(screen.getByText('User: test@example.com')).toBeInTheDocument();
    });
    
    // Auth dialog should not be visible
    await waitFor(() => {
      const authDialogs = screen.queryAllByTestId('auth-dialog');
      const visibleDialog = authDialogs.find(dialog => 
        dialog.style.display !== 'none'
      );
      expect(visibleDialog).toBeUndefined();
    });
  });

  it('handles successful authentication', async () => {
    renderApp();
    
    // Wait for initialization to complete
    await screen.findByTestId('main-layout');
    
    // Auth dialog should be visible
    const authDialog = screen.getByTestId('auth-dialog');
    expect(authDialog).toBeVisible();
    
    // Simulate successful authentication
    fireEvent.click(screen.getByText('Success'));
    
    await waitFor(() => {
      expect(screen.getByText('User: test@example.com')).toBeInTheDocument();
    });
    
    // Auth dialog should be hidden
    const authDialogs = screen.queryAllByTestId('auth-dialog');
    const visibleDialog = authDialogs.find(dialog => 
      dialog.style.display !== 'none'
    );
    expect(visibleDialog).toBeUndefined();
  });

  it('handles skip authentication', async () => {
    renderApp();
    
    // Wait for initialization to complete
    await screen.findByTestId('main-layout');
    
    // Wait for auth dialog to be visible
    await waitFor(() => {
      const authDialog = screen.getByTestId('auth-dialog');
      expect(authDialog).toBeVisible();
    });
    
    // Simulate skipping authentication
    fireEvent.click(screen.getByText('Skip'));
    
    // Wait for localStorage to be updated and dialog to be hidden
    await waitFor(() => {
      expect(localStorage.getItem('auth-skipped')).toBe('true');
      const authDialogs = screen.queryAllByTestId('auth-dialog');
      const visibleDialog = authDialogs.find(dialog => 
        dialog.style.display !== 'none'
      );
      expect(visibleDialog).toBeUndefined();
    }, { timeout: 2000 });
  });

  it('renders main layout with no user initially', async () => {
    renderApp();
    
    // Wait for initialization to complete
    const mainLayout = await screen.findByTestId('main-layout');
    expect(mainLayout).toBeInTheDocument();
    expect(screen.getByText('User: No user')).toBeInTheDocument();
  });
});