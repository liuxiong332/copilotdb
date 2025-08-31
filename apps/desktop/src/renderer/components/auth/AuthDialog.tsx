import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { authHelpers } from '../../lib/supabase';
import { AuthUser } from '@database-gui/types';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
  onSuccess: (user: AuthUser) => void;
}

type AuthMode = 'signin' | 'signup' | 'reset';

export function AuthDialog({ isOpen, onClose, onSkip, onSuccess }: AuthDialogProps) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setMessage(null);
  };

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
  };

  const validateForm = (): boolean => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }

    if (mode === 'reset') {
      return true;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'signin') {
        const { data, error } = await authHelpers.signIn(email, password);
        
        if (error) {
          setError(error.message);
        } else if (data.user) {
          // Store session in localStorage for persistence
          if (data.session) {
            localStorage.setItem('supabase-session', JSON.stringify(data.session));
          }
          
          // Convert Supabase user to our AuthUser type
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || '',
            email_confirmed_at: data.user.email_confirmed_at,
            phone: data.user.phone,
            phone_confirmed_at: data.user.phone_confirmed_at,
            created_at: data.user.created_at,
            updated_at: data.user.updated_at || '',
            last_sign_in_at: data.user.last_sign_in_at,
            app_metadata: data.user.app_metadata,
            user_metadata: data.user.user_metadata,
          };
          
          onSuccess(authUser);
        }
      } else if (mode === 'signup') {
        const { data, error } = await authHelpers.signUp(email, password);
        
        if (error) {
          setError(error.message);
        } else {
          setMessage('Check your email for a confirmation link');
          setMode('signin');
          resetForm();
        }
      } else if (mode === 'reset') {
        const { error } = await authHelpers.resetPassword(email);
        
        if (error) {
          setError(error.message);
        } else {
          setMessage('Check your email for password reset instructions');
          setMode('signin');
          resetForm();
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'signin':
        return 'Sign In';
      case 'signup':
        return 'Create Account';
      case 'reset':
        return 'Reset Password';
      default:
        return 'Authentication';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'signin':
        return 'Sign in to your account to access AI features and sync your settings.';
      case 'signup':
        return 'Create a new account to get started with AI-powered database management.';
      case 'reset':
        return 'Enter your email address and we\'ll send you a link to reset your password.';
      default:
        return '';
    }
  };

  const getSubmitText = () => {
    if (isLoading) {
      return 'Loading...';
    }
    
    switch (mode) {
      case 'signin':
        return 'Sign In';
      case 'signup':
        return 'Create Account';
      case 'reset':
        return 'Send Reset Link';
      default:
        return 'Submit';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
              {message}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {mode !== 'reset' && (
            <div className="space-y-2">
              <Label htmlFor="password">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                minLength={6}
              />
            </div>
          )}

          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
                minLength={6}
              />
            </div>
          )}

          <div className="flex flex-col space-y-2">
            <Button type="submit" disabled={isLoading} className="w-full">
              {getSubmitText()}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onSkip}
              disabled={isLoading}
              className="w-full"
            >
              Skip for now
            </Button>
          </div>
        </form>

        <div className="text-center space-y-2">
          {mode === 'signin' && (
            <>
              <button
                type="button"
                onClick={() => handleModeChange('signup')}
                className="text-sm text-primary hover:underline"
                disabled={isLoading}
              >
                Don't have an account? Sign up
              </button>
              <br />
              <button
                type="button"
                onClick={() => handleModeChange('reset')}
                className="text-sm text-primary hover:underline"
                disabled={isLoading}
              >
                Forgot your password?
              </button>
            </>
          )}

          {mode === 'signup' && (
            <button
              type="button"
              onClick={() => handleModeChange('signin')}
              className="text-sm text-primary hover:underline"
              disabled={isLoading}
            >
              Already have an account? Sign in
            </button>
          )}

          {mode === 'reset' && (
            <button
              type="button"
              onClick={() => handleModeChange('signin')}
              className="text-sm text-primary hover:underline"
              disabled={isLoading}
            >
              Back to sign in
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}