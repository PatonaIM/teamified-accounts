import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { getCurrentUser, isAuthenticated } from '../services/authService';
import type { User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  clearUser: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (!isAuthenticated()) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      console.log('[AuthContext] Loading user data...');
      const userData = await getCurrentUser();
      console.log('[AuthContext] User data loaded:', userData);
      setUser(userData);
    } catch (error) {
      console.error('[AuthContext] Failed to load user:', error);
      setUser(null);
    } finally {
      setLoading(false);
      console.log('[AuthContext] Auth loading complete');
    }
  }, []);

  const refreshUser = useCallback(async () => {
    console.log('[AuthContext] Refreshing user data...');
    setLoading(true);
    await loadUser();
  }, [loadUser]);

  const clearUser = useCallback(() => {
    console.log('[AuthContext] Clearing user data...');
    setUser(null);
    setLoading(false);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    console.log('[AuthContext] Updating user data with:', updates);
    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  useEffect(() => {
    loadUser();
  }, []); // Only run once on mount

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, refreshUser, clearUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
