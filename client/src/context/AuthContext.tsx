import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, apiErrorMessage, setAccessToken, setUnauthorizedHandler } from "../api/client";
import type { AuthUser } from "../types";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (payload: Record<string, unknown>) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    (async () => {
      try {
        const { data } = await api.post("/auth/refresh");
        setAccessToken(data.accessToken);
        await loadMe();
      } catch {
        // no valid session — stay logged out
      } finally {
        setLoading(false);
      }
    })();
  }, [loadMe]);

  const login = useCallback(async (identifier: string, password: string) => {
    try {
      const { data } = await api.post("/auth/login", { identifier, password });
      setAccessToken(data.accessToken);
      setUser(data.user);
    } catch (err) {
      throw new Error(apiErrorMessage(err, "Login failed."));
    }
  }, []);

  const register = useCallback(async (payload: Record<string, unknown>) => {
    try {
      const { data } = await api.post("/auth/register", payload);
      setAccessToken(data.accessToken);
      setUser(data.user);
    } catch (err) {
      throw new Error(apiErrorMessage(err, "Registration failed."));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser: loadMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
