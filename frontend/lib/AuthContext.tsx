"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ApiError,
  apiRequest,
  authenticate,
  refreshAuthentication,
} from "./api";
import { AuthSession } from "./types";


const STORAGE_KEY = "eldershield.auth";

interface AuthContextValue {
  session: AuthSession | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  authorizedRequest: <T>(path: string, init?: RequestInit) => Promise<T>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);


function isAuthSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<AuthSession>;
  return (
    typeof candidate.access_token === "string" &&
    typeof candidate.refresh_token === "string" &&
    typeof candidate.user?.email === "string"
  );
}


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);
  const sessionRef = useRef<AuthSession | null>(null);
  const refreshPromiseRef = useRef<Promise<AuthSession> | null>(null);

  const updateSession = useCallback((next: AuthSession | null) => {
    sessionRef.current = next;
    setSession(next);
    if (next) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    let restored: AuthSession | null = null;
    if (stored) {
      try {
        const parsed: unknown = JSON.parse(stored);
        restored = isAuthSession(parsed) ? parsed : null;
      } catch {
        restored = null;
      }
    }
    queueMicrotask(() => {
      updateSession(restored);
      setReady(true);
    });
  }, [updateSession]);

  const establishSession = useCallback(
    async (mode: "login" | "register", email: string, password: string) => {
      updateSession(await authenticate(mode, email, password));
    },
    [updateSession],
  );

  const refreshSession = useCallback(async (): Promise<AuthSession> => {
    const active = sessionRef.current;
    if (!active) {
      throw new ApiError("Please sign in to continue.", 401);
    }
    if (!refreshPromiseRef.current) {
      refreshPromiseRef.current = refreshAuthentication(active.refresh_token)
        .then((next) => {
          updateSession(next);
          return next;
        })
        .catch((error) => {
          updateSession(null);
          throw error;
        })
        .finally(() => {
          refreshPromiseRef.current = null;
        });
    }
    return refreshPromiseRef.current;
  }, [updateSession]);

  const authorizedRequest = useCallback(
    async <T,>(path: string, init: RequestInit = {}): Promise<T> => {
      const active = sessionRef.current;
      if (!active) {
        throw new ApiError("Please sign in to continue.", 401);
      }
      try {
        return await apiRequest<T>(path, init, active.access_token);
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401) {
          throw error;
        }
        const refreshed = await refreshSession();
        return apiRequest<T>(path, init, refreshed.access_token);
      }
    },
    [refreshSession],
  );

  const logout = useCallback(async () => {
    const active = sessionRef.current;
    updateSession(null);
    if (!active) return;
    try {
      await apiRequest<void>("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refresh_token: active.refresh_token }),
      });
    } catch {
      // Local sign-out must still succeed when the API is unavailable.
    }
  }, [updateSession]);

  return (
    <AuthContext.Provider
      value={{
        session,
        ready,
        login: (email, password) => establishSession("login", email, password),
        register: (email, password) => establishSession("register", email, password),
        logout,
        authorizedRequest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
