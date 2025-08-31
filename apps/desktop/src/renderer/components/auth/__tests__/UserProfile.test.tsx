import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserProfile } from '../UserProfile';
import { useAuth } from '../../../contexts/AuthContext';
import { authHelpers } from '../../../lib/supabase';
import { AuthUser } from '@database-gui/types';

// Mock the auth context and helpers
vi.mock('../../../contexts/AuthContext');
vi.mock('../../../lib/supabase', () => ({
  authHelpers: {
    signIn: vi.fn(),
    signOut: vi.fn(),
  },
}));

// Mock all UI components to avoid Radix UI issues in tests
vi.mock('../../ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <h2 data-testid="dialog-title">{children}</h2>,
  DialogDescription: ({ children }: any) => <p data-testid="dialog-description">{children}</p>,
}));

vi.mock('../../ui/button', () => ({
  Button: ({ children, onClick, disabled, variant, size, type, className, ...props }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      type={type}
      data-variant={variant}
      data-size={size}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('../../ui/input', () => ({
  Input: ({ value, onChange, disabled, type, placeholder, id, required, minLength, ...props }: any) => (
    <input
      value={value}
      onChange={onChange}
      disabled={disabled}
      type={type}
      placeholder={placeholder}
      id={id}
      required={required}
      minLength={minLength}
      {...props}
    />
  ),
}));

vi.mock('../../ui/label', () => ({
  Label: ({ children, htmlFor, ...props }: any) => (
    <label htmlFor={htmlFor} {...props}>
      {children}
    </label>
  ),
}));

const mockUseAuth = useAuth as any;
const mockAuthHelpers = authHelpers as any;

describe('UserProfile', () => {
  const mockLogout = vi.fn();
  const mockOnClose = vi.fn();

  const mockUser: AuthUser = {
    id: '123',
    email: 'test@example.com',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    last_sign_in_at: '2023-01-01T12:00:00Z',
    email_confirmed_at: '2023-01-01T00:30:00Z',
    app_metadata: {},
    user_metadata: {},
  };

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      logout: mockLogout,
      isAuthenticated: true,
      setUser: vi.fn(),
    });
  });

  it('renders user profile information', () => {
    render(<UserProfile {...defaultProps} />);
    
    expect(screen.getByText('User Profile')).toBeInTheDocument();
    expect(screen.getByText('Manage your account settings and preferences.')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getAllByDisplayValue('2023/1/1')).toHaveLength(2); // Account created and Last sign in
    expect(screen.getByDisplayValue('Yes')).toBeInTheDocument(); // Email verified
  });

  it('shows change password button', () => {
    render(<UserProfile {...defaultProps} />);
    
    expect(screen.getByRole('button', { name: 'Change Password' })).toBeInTheDocument();
  });

  it('shows password change form when change password is clicked', async () => {
    render(<UserProfile {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }));
    
    await waitFor(() => {
      expect(screen.getByLabelText('Current Password')).toBeInTheDocument();
      expect(screen.getByLabelText('New Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Update Password' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });
  });

  it('validates new password length', async () => {
    render(<UserProfile {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }));
    
    await waitFor(() => {
      const currentPasswordInput = screen.getByLabelText('Current Password');
      const newPasswordInput = screen.getByLabelText('New Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm New Password');
      const updateButton = screen.getByRole('button', { name: 'Update Password' });
      
      fireEvent.change(currentPasswordInput, { target: { value: 'oldpassword' } });
      fireEvent.change(newPasswordInput, { target: { value: '123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: '123' } });
      fireEvent.click(updateButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('New password must be at least 6 characters long')).toBeInTheDocument();
    });
  });

  it('validates password confirmation', async () => {
    render(<UserProfile {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }));
    
    await waitFor(() => {
      const currentPasswordInput = screen.getByLabelText('Current Password');
      const newPasswordInput = screen.getByLabelText('New Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm New Password');
      const updateButton = screen.getByRole('button', { name: 'Update Password' });
      
      fireEvent.change(currentPasswordInput, { target: { value: 'oldpassword' } });
      fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'different123' } });
      fireEvent.click(updateButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('verifies current password before updating', async () => {
    mockAuthHelpers.signIn.mockResolvedValue({
      data: { user: mockUser, session: null },
      error: null,
    });

    render(<UserProfile {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }));
    
    await waitFor(() => {
      expect(screen.getByLabelText('Current Password')).toBeInTheDocument();
    });

    const currentPasswordInput = screen.getByLabelText('Current Password');
    const newPasswordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm New Password');
    
    fireEvent.change(currentPasswordInput, { target: { value: 'currentpassword' } });
    fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });
    
    const form = currentPasswordInput.closest('form');
    expect(form).toBeInTheDocument();
    
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(mockAuthHelpers.signIn).toHaveBeenCalledWith('test@example.com', 'currentpassword');
    });

    // The success message should appear briefly before the form is hidden
    // Since the component logic sets the message and then hides the form,
    // we need to verify that the signIn was called, which indicates the flow worked
    expect(mockAuthHelpers.signIn).toHaveBeenCalledWith('test@example.com', 'currentpassword');
    
    // Verify that the form is no longer visible (indicating success)
    await waitFor(() => {
      expect(screen.queryByLabelText('Current Password')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Change Password' })).toBeInTheDocument();
    });
  });

  it('shows error for incorrect current password', async () => {
    mockAuthHelpers.signIn.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid credentials' },
    });

    render(<UserProfile {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }));
    
    await waitFor(() => {
      const currentPasswordInput = screen.getByLabelText('Current Password');
      const newPasswordInput = screen.getByLabelText('New Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm New Password');
      const updateButton = screen.getByRole('button', { name: 'Update Password' });
      
      fireEvent.change(currentPasswordInput, { target: { value: 'wrongpassword' } });
      fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });
      fireEvent.click(updateButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Current password is incorrect')).toBeInTheDocument();
    });
  });

  it('cancels password change form', async () => {
    render(<UserProfile {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }));
    
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    });
    
    await waitFor(() => {
      expect(screen.queryByLabelText('Current Password')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Change Password' })).toBeInTheDocument();
    });
  });

  it('handles logout', async () => {
    mockAuthHelpers.signOut.mockResolvedValue({ error: null });

    render(<UserProfile {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Sign Out' }));
    
    await waitFor(() => {
      expect(mockAuthHelpers.signOut).toHaveBeenCalled();
      expect(mockLogout).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('shows loading state during logout', async () => {
    // Mock a delayed response
    mockAuthHelpers.signOut.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
    );

    render(<UserProfile {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Sign Out' }));
    
    // Should show loading state
    expect(screen.getByRole('button', { name: 'Signing out...' })).toBeInTheDocument();
  });

  it('formats dates correctly', () => {
    const userWithNoDates: AuthUser = {
      ...mockUser,
      last_sign_in_at: undefined,
      email_confirmed_at: undefined,
    };

    mockUseAuth.mockReturnValue({
      user: userWithNoDates,
      logout: mockLogout,
      isAuthenticated: true,
      setUser: vi.fn(),
    });

    render(<UserProfile {...defaultProps} />);
    
    expect(screen.getByDisplayValue('Never')).toBeInTheDocument(); // Last sign in
    expect(screen.getByDisplayValue('No')).toBeInTheDocument(); // Email verified
  });

  it('does not render when user is null', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      logout: mockLogout,
      isAuthenticated: false,
      setUser: vi.fn(),
    });

    render(<UserProfile {...defaultProps} />);
    
    expect(screen.queryByText('User Profile')).not.toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<UserProfile {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('User Profile')).not.toBeInTheDocument();
  });
});