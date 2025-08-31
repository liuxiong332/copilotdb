import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthDialog } from '../AuthDialog';
import { authHelpers } from '../../../lib/supabase';
import { AuthUser } from '@database-gui/types';

// Mock the auth helpers
vi.mock('../../../lib/supabase', () => ({
  authHelpers: {
    signIn: vi.fn(),
    signUp: vi.fn(),
    resetPassword: vi.fn(),
  },
}));

// Mock the UI components to avoid Radix UI issues in tests
vi.mock('../../ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <h2 data-testid="dialog-title">{children}</h2>,
  DialogDescription: ({ children }: any) => <p data-testid="dialog-description">{children}</p>,
}));

const mockAuthHelpers = authHelpers as any;

describe('AuthDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnSkip = vi.fn();
  const mockOnSuccess = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSkip: mockOnSkip,
    onSuccess: mockOnSuccess,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
  });

  it('renders sign in form by default', () => {
    render(<AuthDialog {...defaultProps} />);
    
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your account to access AI features and sync your settings.')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Skip for now' })).toBeInTheDocument();
  });

  it('switches to signup mode when clicking signup link', async () => {
    render(<AuthDialog {...defaultProps} />);
    
    fireEvent.click(screen.getByText("Don't have an account? Sign up"));
    
    await waitFor(() => {
      expect(screen.getByText('Create Account')).toBeInTheDocument();
      expect(screen.getByText('Create a new account to get started with AI-powered database management.')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    });
  });

  it('switches to password reset mode when clicking forgot password link', async () => {
    render(<AuthDialog {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Forgot your password?'));
    
    await waitFor(() => {
      expect(screen.getByText('Reset Password')).toBeInTheDocument();
      expect(screen.getByText("Enter your email address and we'll send you a link to reset your password.")).toBeInTheDocument();
      expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    render(<AuthDialog {...defaultProps} />);
    
    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('validates password length', async () => {
    render(<AuthDialog {...defaultProps} />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters long')).toBeInTheDocument();
    });
  });

  it('validates password confirmation in signup mode', async () => {
    render(<AuthDialog {...defaultProps} />);
    
    // Switch to signup mode
    fireEvent.click(screen.getByText("Don't have an account? Sign up"));
    
    await waitFor(() => {
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'different123' } });
      fireEvent.click(submitButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('handles successful sign in', async () => {
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

    mockAuthHelpers.signIn.mockResolvedValue({
      data: { user: mockUser, session: mockSession },
      error: null,
    });

    render(<AuthDialog {...defaultProps} />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockAuthHelpers.signIn).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockOnSuccess).toHaveBeenCalledWith(mockUser);
      expect(localStorage.getItem('supabase-session')).toBe(JSON.stringify(mockSession));
    });
  });

  it('handles sign in error', async () => {
    mockAuthHelpers.signIn.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid credentials' },
    });

    render(<AuthDialog {...defaultProps} />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('handles successful sign up', async () => {
    mockAuthHelpers.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    });

    render(<AuthDialog {...defaultProps} />);
    
    // Switch to signup mode
    fireEvent.click(screen.getByText("Don't have an account? Sign up"));
    
    await waitFor(() => {
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
    });
    
    await waitFor(() => {
      expect(mockAuthHelpers.signUp).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(screen.getByText('Check your email for a confirmation link')).toBeInTheDocument();
      expect(screen.getByText('Sign In')).toBeInTheDocument(); // Should switch back to sign in
    });
  });

  it('handles password reset', async () => {
    mockAuthHelpers.resetPassword.mockResolvedValue({
      data: {},
      error: null,
    });

    render(<AuthDialog {...defaultProps} />);
    
    // Switch to reset mode
    fireEvent.click(screen.getByText('Forgot your password?'));
    
    await waitFor(() => {
      const emailInput = screen.getByLabelText('Email');
      const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);
    });
    
    await waitFor(() => {
      expect(mockAuthHelpers.resetPassword).toHaveBeenCalledWith('test@example.com');
      expect(screen.getByText('Check your email for password reset instructions')).toBeInTheDocument();
      expect(screen.getByText('Sign In')).toBeInTheDocument(); // Should switch back to sign in
    });
  });

  it('calls onSkip when skip button is clicked', () => {
    render(<AuthDialog {...defaultProps} />);
    
    const skipButton = screen.getByRole('button', { name: 'Skip for now' });
    fireEvent.click(skipButton);
    
    expect(mockOnSkip).toHaveBeenCalled();
  });

  it('shows loading state during authentication', async () => {
    // Mock a delayed response
    mockAuthHelpers.signIn.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: { user: null }, error: null }), 100))
    );

    render(<AuthDialog {...defaultProps} />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    // Should show loading state
    expect(screen.getByRole('button', { name: 'Loading...' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Loading...' })).toBeDisabled();
  });

  it('does not render when isOpen is false', () => {
    render(<AuthDialog {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
  });
});