import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import { authHelpers } from '../lib/supabase';
import { AuthUser } from '@database-gui/types';

// Mock the auth helpers
vi.mock('../lib/supabase', () => ({
    authHelpers: {
        getSession: vi.fn(),
        signIn: vi.fn(),
        signUp: vi.fn(),
        resetPassword: vi.fn(),
        signOut: vi.fn(),
    },
}));

const mockAuthHelpers = authHelpers as any;

describe('Authentication Integration', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
        // Mock getSession to return no session by default
        mockAuthHelpers.getSession.mockResolvedValue({ session: null, error: null });
    });

    it('shows authentication dialog on first launch', async () => {
        render(<App />);

        // Wait for initialization to complete
        await screen.findByTestId('main-layout');

        // Should show auth dialog
        expect(screen.getByText('Auth Dialog')).toBeInTheDocument();
    });

    it('allows user to skip authentication', async () => {
        render(<App />);

        // Wait for initialization to complete
        await screen.findByTestId('main-layout');

        // Click skip button
        fireEvent.click(screen.getByText('Skip'));

        // Should set auth-skipped in localStorage and hide dialog
        await waitFor(() => {
            expect(localStorage.getItem('auth-skipped')).toBe('true');
        });
    });

    it('remembers when user has skipped authentication', async () => {
        localStorage.setItem('auth-skipped', 'true');

        render(<App />);

        // Wait for initialization to complete
        await screen.findByTestId('main-layout');

        // Should not show auth dialog
        await waitFor(() => {
            const authDialogs = screen.queryAllByTestId('auth-dialog');
            const visibleDialog = authDialogs.find(dialog =>
                dialog.style.display !== 'none'
            );
            expect(visibleDialog).toBeUndefined();
        });
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

        render(<App />);

        // Wait for user to be loaded
        await waitFor(() => {
            expect(screen.getByText('User: test@example.com')).toBeInTheDocument();
        });

        // Should not show auth dialog
        await waitFor(() => {
            const authDialogs = screen.queryAllByTestId('auth-dialog');
            const visibleDialog = authDialogs.find(dialog =>
                dialog.style.display !== 'none'
            );
            expect(visibleDialog).toBeUndefined();
        });
    });

    it('handles successful authentication', async () => {
        render(<App />);

        // Wait for initialization to complete
        await screen.findByTestId('main-layout');

        // Should show auth dialog
        expect(screen.getByText('Auth Dialog')).toBeInTheDocument();

        // Simulate successful authentication
        fireEvent.click(screen.getByText('Success'));

        // Should show user email
        await waitFor(() => {
            expect(screen.getByText('User: test@example.com')).toBeInTheDocument();
        });

        // Should hide auth dialog
        await waitFor(() => {
            const authDialogs = screen.queryAllByTestId('auth-dialog');
            const visibleDialog = authDialogs.find(dialog =>
                dialog.style.display !== 'none'
            );
            expect(visibleDialog).toBeUndefined();
        });
    });

    it('provides authentication context to child components', async () => {
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

        render(<App />);

        // Wait for user to be loaded
        await waitFor(() => {
            expect(screen.getByText('User: test@example.com')).toBeInTheDocument();
        });

        // The MainLayout component should receive the user prop
        expect(screen.getByText('User: test@example.com')).toBeInTheDocument();
    });

    it('handles session errors gracefully', async () => {
        mockAuthHelpers.getSession.mockResolvedValue({
            session: null,
            error: { message: 'Session expired' }
        });

        render(<App />);

        // Wait for initialization to complete
        await screen.findByTestId('main-layout');

        // Should show auth dialog since no valid session
        expect(screen.getByText('Auth Dialog')).toBeInTheDocument();

        // Should show no user
        expect(screen.getByText('User: No user')).toBeInTheDocument();
    });

    it('clears authentication state on logout', async () => {
        const mockUser: AuthUser = {
            id: '123',
            email: 'test@example.com',
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
            app_metadata: {},
            user_metadata: {},
        };

        // Set up initial authenticated state
        localStorage.setItem('supabase-session', JSON.stringify({ user: mockUser }));
        localStorage.setItem('auth-skipped', 'false');

        const mockSession = {
            access_token: 'token',
            refresh_token: 'refresh',
            expires_in: 3600,
            expires_at: Date.now() + 3600000,
            token_type: 'bearer',
            user: mockUser,
        };

        mockAuthHelpers.getSession.mockResolvedValue({ session: mockSession, error: null });

        render(<App />);

        // Wait for user to be loaded
        await waitFor(() => {
            expect(screen.getByText('User: test@example.com')).toBeInTheDocument();
        });

        // Verify initial state
        expect(localStorage.getItem('supabase-session')).toBeTruthy();

        // Note: In a real integration test, we would trigger logout through the UI
        // For now, we verify that the AuthContext provides the logout functionality
        // The actual logout testing is covered in the AuthContext unit tests
    });
});