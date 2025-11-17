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
    // Perform the initial session check once when the provider mounts.
    // Subsequent refreshes are triggered after auth flows or before entering protected routes.
    refreshSession();
  }, []); // eslint-disable-line react-hooks-exhaustive-deps

  const logout = async (options?: { redirect?: boolean }) => {
    try {
      await kratosLogout();
    } catch (error) {
      // Log the failure, but still clear local state—the backend may have completed the logout.
      console.error('Logout error:', error);
      toast.error(error instanceof Error ? error.message : 'Logout failed');
    } finally {
      // Always clear the local session, then redirect unless explicitly disabled.
      setSession(null);
      if (options?.redirect ?? true) {
        navigate('/auth', { replace: true, state: { via: 'logout' } });
      }
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
