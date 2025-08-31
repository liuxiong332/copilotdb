import { createContext, useContext, ReactNode } from 'react';
import { AuthUser } from '@database-gui/types';

interface AuthContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
}

export function AuthProvider({ children, user, setUser }: AuthProviderProps) {
  const logout = () => {
    setUser(null);
    localStorage.removeItem('supabase-session');
    localStorage.removeItem('auth-skipped');
  };

  const value: AuthContextType = {
    user,
    setUser,
    isAuthenticated: !!user,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}