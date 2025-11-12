import { useState, useEffect, useRef, createContext, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkSession, logout as kratosLogout, type Session as KratosSession } from '@/shared/lib/kratos';
import { toast } from 'sonner';

interface AuthContextType {
  session: KratosSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<KratosSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isRefreshingRef = useRef(false);
  const navigate = useNavigate();

  const refreshSession = async () => {
    // Prevent multiple simultaneous requests using ref (immediate check)
    if (isRefreshingRef.current) {
      return;
    }

    isRefreshingRef.current = true;
    try {
      const currentSession = await checkSession();
      setSession(currentSession);
    } catch (error) {
      // checkSession returns null for errors, so we only get here for unexpected errors
      console.error('Session check error:', error);
      setSession(null);
    } finally {
      setIsLoading(false);
      isRefreshingRef.current = false;
    }
  };

  useEffect(() => {
    // Only check session once on mount - no periodic polling
    // Session will be checked:
    // 1. On page load (here)
    // 2. After login/registration (explicit call)
    // 3. On navigation to protected routes (if needed)
    refreshSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const logout = async () => {
    try {
      await kratosLogout();
    } catch (error) {
      // Log error but still clear session and redirect
      // Logout might have succeeded on server even if request failed
      console.error('Logout error:', error);
      toast.error(error instanceof Error ? error.message : 'Logout failed');
    } finally {
      // Always clear session on frontend and redirect
      setSession(null);
      navigate('/auth');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        isAuthenticated: !!session,
        logout,
        refreshSession,
      }}
    >
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
