import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearAuth,
  clearIntroPlayed,
  getAuth,
  login as loginRequest,
  type AuthUser,
} from "../lib/auth";

interface AuthContextValue {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getAuth());

  const login = useCallback(async (username: string, password: string) => {
    const result = await loginRequest(username, password);
    if (result.success) {
      setUser(result.user);
      return { success: true };
    }
    return { success: false, error: result.error };
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    clearIntroPlayed();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, login, logout }),
    [user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
