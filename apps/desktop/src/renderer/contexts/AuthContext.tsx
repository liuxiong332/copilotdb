import { createContext, useContext, ReactNode } from 'react';

// Define User type locally for now (will be properly imported from types package later)
interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  user: User | null;
  setUser: (user: User | null) => void;
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