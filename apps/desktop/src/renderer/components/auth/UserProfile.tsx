import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '../../contexts/AuthContext';
import { authHelpers } from '../../lib/supabase';
import { AuthUser } from '@database-gui/types';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfile({ isOpen, onClose }: UserProfileProps) {
  const { user, logout } = useAuth();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const resetPasswordForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setMessage(null);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      // First, verify current password by attempting to sign in
      if (user?.email) {
        const { error: signInError } = await authHelpers.signIn(user.email, currentPassword);
        
        if (signInError) {
          setError('Current password is incorrect');
          setIsLoading(false);
          return;
        }
      }

      // Update password (this would need to be implemented with proper Supabase auth flow)
      // For now, we'll show a message that this feature needs to be implemented
      setMessage('Password change functionality will be implemented in a future update');
      resetPasswordForm();
      setIsChangingPassword(false);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Password change error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await authHelpers.signOut();
      logout();
      onClose();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
          <DialogDescription>
            Manage your account settings and preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Account Information</h3>
            
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user.email} disabled />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Account Created</Label>
                <Input value={formatDate(user.created_at)} disabled />
              </div>
              
              <div className="space-y-2">
                <Label>Last Sign In</Label>
                <Input value={formatDate(user.last_sign_in_at)} disabled />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email Verified</Label>
              <Input 
                value={user.email_confirmed_at ? 'Yes' : 'No'} 
                disabled 
              />
            </div>
          </div>

          {/* Password Change Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Security</h3>
              {!isChangingPassword && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsChangingPassword(true)}
                  disabled={isLoading}
                >
                  Change Password
                </Button>
              )}
            </div>

            {isChangingPassword && (
              <form onSubmit={handlePasswordChange} className="space-y-4">
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
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    minLength={6}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" disabled={isLoading} size="sm">
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsChangingPassword(false);
                      resetPasswordForm();
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col space-y-2 pt-4 border-t">
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Signing out...' : 'Sign Out'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}