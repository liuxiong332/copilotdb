import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { AuthDialog } from './components/auth/AuthDialog';

// Define User type locally for now (will be properly imported from types package later)
interface User {
  id: string;
  email: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check for existing session on app start
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      // Check if user has a stored session
      const storedSession = localStorage.getItem('supabase-session');
      if (storedSession) {
        const session = JSON.parse(storedSession);
        // Validate session and set user
        // This will be implemented in task 7.2
        console.log('Found stored session:', session);
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      // Small delay to show loading state in tests
      setTimeout(() => {
        setIsInitialized(true);
        // Show auth dialog if no user and not skipped
        const hasSkippedAuth = localStorage.getItem('auth-skipped');
        if (!user && !hasSkippedAuth) {
          setShowAuthDialog(true);
        } else {
          setShowAuthDialog(false);
        }
      }, 100);
    }
  };

  const handleAuthSuccess = (authenticatedUser: User) => {
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
        <Routes>
          <Route 
            path="/*" 
            element={
              <MainLayout 
                user={user} 
                onSkipLogin={handleSkipAuth}
              />
            } 
          />
        </Routes>

        {/* Auth Dialog */}
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