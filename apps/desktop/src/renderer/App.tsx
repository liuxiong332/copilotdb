import { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { AuthDialog } from './components/auth/AuthDialog';
import { authHelpers } from './lib/supabase';
import { AuthUser } from '@database-gui/types';

function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check for existing session on app start
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    let currentUser: AuthUser | null = null;

    try {
      // Check for existing Supabase session
      const { session, error } = await authHelpers.getSession();

      if (error) {
        console.error('Error getting session:', error);
      } else if (session?.user) {
        // Convert Supabase user to our AuthUser type
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email || '',
          email_confirmed_at: session.user.email_confirmed_at,
          phone: session.user.phone,
          phone_confirmed_at: session.user.phone_confirmed_at,
          created_at: session.user.created_at,
          updated_at: session.user.updated_at || '',
          last_sign_in_at: session.user.last_sign_in_at,
          app_metadata: session.user.app_metadata,
          user_metadata: session.user.user_metadata,
        };

        currentUser = authUser;
        setUser(authUser);
        console.log('Found existing session for user:', authUser.email);
      }
    } catch (error) {
      console.error('Error checking session:', error);
    }

    // Set initialization state and determine if auth dialog should show
    setIsInitialized(true);

    // Show auth dialog if no user and not skipped
    const hasSkippedAuth = localStorage.getItem('auth-skipped');
    if (!currentUser && !hasSkippedAuth) {
      setShowAuthDialog(true);
    } else {
      setShowAuthDialog(false);
    }
  };

  const handleAuthSuccess = (authenticatedUser: AuthUser) => {
    setUser(authenticatedUser);
    setShowAuthDialog(false);
  };

  const handleSkipAuth = () => {
    localStorage.setItem('auth-skipped', 'true');
    setShowAuthDialog(false);
  };

  const handleAuthDialogClose = () => {
    setShowAuthDialog(false);
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider user={user} setUser={setUser}>
      <div className="h-screen flex flex-col bg-background">
        <MainLayout
          user={user}
          onSkipLogin={handleSkipAuth}
        />

        <AuthDialog
          isOpen={showAuthDialog}
          onClose={handleAuthDialogClose}
          onSkip={handleSkipAuth}
          onSuccess={handleAuthSuccess}
        />
      </div>
    </AuthProvider>
  );
}

export default App;