"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

type Role = "EMPLOYER" | "ADMIN";

interface User {
  id: string;
  userId: string;
  name: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: Role | null;
  isLoading: boolean;
  login: (userId: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function getBaseUrl() {
  let baseUrl = API.endsWith("/") ? API.slice(0, -1) : API;
  if (!baseUrl.endsWith("/api")) baseUrl += "/api";
  return baseUrl;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    // Validate token with /api/auth/me
    fetch(`${getBaseUrl()}/auth/me`, {
      headers: { Authorization: `Bearer ${storedToken}` },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setUser(json.data);
          setToken(storedToken);
        } else {
          // Token invalid — clear it
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_role");
        }
      })
      .catch(() => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_role");
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Redirect unauthenticated users to login (except on login page itself)
  useEffect(() => {
    if (!isLoading && !user && pathname !== "/") {
      router.replace("/");
    }
  }, [isLoading, user, pathname, router]);

  const login = useCallback(
    async (userId: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await fetch(`${getBaseUrl()}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, password }),
        });

        const json = await res.json();

        if (!res.ok || !json.success) {
          return { success: false, error: json.message || "Login failed" };
        }

        const { token: newToken, user: userData } = json.data;
        localStorage.setItem("auth_token", newToken);
        localStorage.setItem("auth_role", userData.role);
        setToken(newToken);
        setUser(userData);

        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || "Network error" };
      }
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_role");
    setUser(null);
    setToken(null);
    router.replace("/");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role ?? null,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
