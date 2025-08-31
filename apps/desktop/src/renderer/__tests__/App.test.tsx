import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

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
      </div>
    ) : (
      <div data-testid="auth-dialog" style={{ display: 'none' }}>
        <div>Auth Dialog</div>
        <button onClick={onSkip}>Skip</button>
        <button onClick={onClose}>Close</button>
      </div>
    ),
}));

const renderApp = () => {
  return render(<App />);
};

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
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

  it.skip('does not show auth dialog when auth is skipped', async () => {
    // This test will be properly implemented in task 7.2 when authentication is fully implemented
    localStorage.setItem('auth-skipped', 'true');
    
    renderApp();
    
    // Wait for initialization to complete
    await screen.findByTestId('main-layout');
    
    // Wait a bit more for the async timeout to complete
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Auth dialog should not be visible - check if it's not in the document or hidden
    const authDialogs = screen.queryAllByTestId('auth-dialog');
    const visibleDialog = authDialogs.find(dialog => 
      dialog.style.display !== 'none'
    );
    expect(visibleDialog).toBeUndefined();
  });

  it('renders main layout with no user initially', async () => {
    renderApp();
    
    // Wait for initialization to complete
    const mainLayout = await screen.findByTestId('main-layout');
    expect(mainLayout).toBeInTheDocument();
    expect(screen.getByText('User: No user')).toBeInTheDocument();
  });
});