import * as React from "react";
import { Navigate, useNavigate } from "react-router-dom";

import {
  apiFetch,
  clearSessionToken,
  getSessionToken,
  setSessionToken,
  setUnauthorizedHandler,
} from "@/lib/api";

export type AuthUser = { id: string; email: string; role: string } | null;

type AuthContextValue = {
  isAuthenticated: boolean;
  notice: string | null;
  clearNotice: () => void;
  signIn: (token: string) => void;
  signOut: () => Promise<void>;
  deactivate: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = React.useState<string | null>(() => getSessionToken());
  const [notice, setNotice] = React.useState<string | null>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    setUnauthorizedHandler(() => {
      setToken(null);
      setNotice("Your session expired, please sign in again.");
      navigate("/sign-in");
    });
    return () => setUnauthorizedHandler(null);
  }, [navigate]);

  const signIn = React.useCallback((newToken: string) => {
    setSessionToken(newToken);
    setToken(newToken);
  }, []);

  const signOut = React.useCallback(async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {
      // The token may already be invalid server-side: clear it locally
      // regardless, so the user is never stuck signed in on this device.
    } finally {
      clearSessionToken();
      setToken(null);
      navigate("/sign-in");
    }
  }, [navigate]);

  const deactivate = React.useCallback(async () => {
    await apiFetch("/account/deactivate", { method: "POST" });
    clearSessionToken();
    setToken(null);
    navigate("/sign-in");
  }, [navigate]);

  const clearNotice = React.useCallback(() => setNotice(null), []);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: token !== null,
      notice,
      clearNotice,
      signIn,
      signOut,
      deactivate,
    }),
    [token, notice, clearNotice, signIn, signOut, deactivate],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

// Gate for the app shell: a stored token must exist before any route under
// it renders, so no dashboard/expenses/categories/reports/settings data
// request is ever made for a signed-out visitor.
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }
  return <>{children}</>;
}
