import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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

    it('renders main layout correctly', async () => {
        render(<App />);

        // Wait for initialization to complete
        await screen.findByTestId('main-layout');

        // Verify main layout components are present
        expect(screen.getByText('Database Explorer')).toBeInTheDocument();
        expect(screen.getByText('Query Editor')).toBeInTheDocument();
        expect(screen.getByText('Results')).toBeInTheDocument();
        expect(screen.getByText('User: No user')).toBeInTheDocument();
    });

    it('shows no user when not authenticated', async () => {
        render(<App />);

        // Wait for initialization to complete
        await screen.findByTestId('main-layout');

        // Should show no user
        expect(screen.getByText('User: No user')).toBeInTheDocument();
    });

    it('handles localStorage auth-skipped state', async () => {
        localStorage.setItem('auth-skipped', 'true');

        render(<App />);

        // Wait for initialization to complete
        await screen.findByTestId('main-layout');

        // Should still show no user when auth is skipped
        expect(screen.getByText('User: No user')).toBeInTheDocument();
        
        // Verify localStorage state is preserved
        expect(localStorage.getItem('auth-skipped')).toBe('true');
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
        }, { timeout: 2000 });

        // The MainLayout component should receive the user prop
        expect(screen.getByText('User: test@example.com')).toBeInTheDocument();
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
        }, { timeout: 2000 });

        // Verify that the AuthProvider is working and user data is passed down
        expect(screen.getByText('User: test@example.com')).toBeInTheDocument();
        
        // Verify main layout components are present
        expect(screen.getByText('Database Explorer')).toBeInTheDocument();
        expect(screen.getByText('Query Editor')).toBeInTheDocument();
    });

    it('handles session errors gracefully', async () => {
        mockAuthHelpers.getSession.mockResolvedValue({
            session: null,
            error: { message: 'Session expired' }
        });

        render(<App />);

        // Wait for initialization to complete
        await screen.findByTestId('main-layout');

        // Should show no user when session has errors
        expect(screen.getByText('User: No user')).toBeInTheDocument();
        
        // Verify main layout still renders correctly
        expect(screen.getByText('Database Explorer')).toBeInTheDocument();
    });

    it('manages authentication state correctly', async () => {
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

        // Verify that the authentication state is properly managed
        expect(screen.getByText('User: test@example.com')).toBeInTheDocument();
        
        // Verify the app renders all main components when authenticated
        expect(screen.getByText('Database Explorer')).toBeInTheDocument();
        expect(screen.getByText('Query Editor')).toBeInTheDocument();
        expect(screen.getByText('Results')).toBeInTheDocument();
    });
});