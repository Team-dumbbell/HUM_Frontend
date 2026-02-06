import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { checkAuthSession, clearAuthenticated, isAuthenticated, redirectToGoogleLogin } from "./auth";

type AuthContextValue = {
  isLoggedIn: boolean;
  isChecking: boolean;
  loginWithGoogle: () => void;
  refreshSession: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => isAuthenticated());
  const [isChecking, setIsChecking] = useState(true);

  const loginWithGoogle = useCallback(() => {
    redirectToGoogleLogin();
  }, []);

  const logout = useCallback(() => {
    clearAuthenticated();
    setIsLoggedIn(false);
  }, []);

  const refreshSession = useCallback(async () => {
    setIsChecking(true);
    const authenticated = await checkAuthSession();
    setIsLoggedIn(authenticated);
    setIsChecking(false);
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    const handleStorage = () => {
      setIsLoggedIn(isAuthenticated());
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const value = useMemo(
    () => ({
      isLoggedIn,
      isChecking,
      loginWithGoogle,
      refreshSession,
      logout,
    }),
    [isLoggedIn, isChecking, loginWithGoogle, refreshSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
