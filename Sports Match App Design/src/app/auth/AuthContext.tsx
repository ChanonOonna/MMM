import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { apiJson, setAccessToken, ApiError } from "../api";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  photoUrl: string | null;
  role: string;
}

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  nickname?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  // True from the moment registration succeeds until completeOnboarding() is called.
  // Routing reacts to this instead of racing an imperative navigate() against the
  // "already logged in" redirect that fires the moment status flips to authenticated.
  justRegistered: boolean;
  completeOnboarding: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(): Promise<AuthUser> {
  const profile = await apiJson<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    nickname: string | null;
    role: string;
    photos: { url: string; position: number }[];
  }>("/profile/me");
  return {
    id: profile.id,
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    nickname: profile.nickname,
    photoUrl: profile.photos[0]?.url ?? null,
    role: profile.role,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [justRegistered, setJustRegistered] = useState(false);

  const applySession = useCallback((token: string, u: AuthUser) => {
    setAccessToken(token);
    setUser(u);
    setStatus("authenticated");
  }, []);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    setStatus("unauthenticated");
    setJustRegistered(false);
  }, []);

  // On first load, try to silently restore a session from the httpOnly refresh cookie
  // (so a page reload doesn't force the user back to /auth).
  useEffect(() => {
    (async () => {
      try {
        const { accessToken } = await apiJson<{ accessToken: string }>("/auth/refresh", {
          method: "POST",
        });
        setAccessToken(accessToken);
        const profile = await fetchProfile();
        setUser(profile);
        setStatus("authenticated");
      } catch {
        clearSession();
      }
    })();
  }, [clearSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await apiJson<{ accessToken: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setAccessToken(data.accessToken);
      const profile = await fetchProfile();
      applySession(data.accessToken, profile);
    },
    [applySession]
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      await apiJson("/auth/register", {
        method: "POST",
        body: JSON.stringify(input),
      });
      await login(input.email, input.password);
      setJustRegistered(true);
    },
    [login]
  );

  const completeOnboarding = useCallback(() => {
    setJustRegistered(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiJson("/auth/logout", { method: "POST" });
    } catch {
      // best-effort — clear local session regardless
    }
    clearSession();
  }, [clearSession]);

  return (
    <AuthContext.Provider value={{ user, status, justRegistered, completeOnboarding, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export { ApiError };
