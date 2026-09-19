"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { User, UserRole } from "@/types";
import { api } from "./api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  quickLogin: (role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_CREDENTIALS: Record<UserRole, { email: string; pass: string }> = {
  SUPER_ADMIN: { email: "admin@allocflow.io", pass: "Password123!" },
  CONFERENCE_ADMIN: { email: "chair@icdcs2026.org", pass: "Password123!" },
  REVIEWER: { email: "reviewer.chen@stanford.edu", pass: "Password123!" },
  AUTHOR: { email: "author.vaswani@google.com", pass: "Password123!" },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session on mount or auto-login default demo admin
    const initSession = async () => {
      const savedToken = localStorage.getItem("allocflow_token");
      const savedUser = localStorage.getItem("allocflow_user");

      if (savedToken && savedUser) {
        try {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          setIsLoading(false);
          return;
        } catch (e) {
          localStorage.removeItem("allocflow_token");
          localStorage.removeItem("allocflow_user");
        }
      }

      // Auto-login default demo super admin
      try {
        const res = await api.login("admin@allocflow.io", "Password123!");
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem("allocflow_token", res.token);
        localStorage.setItem("allocflow_user", JSON.stringify(res.user));
      } catch (err) {
        console.warn("Auto-login fallback failed", err);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, pass);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem("allocflow_token", res.token);
      localStorage.setItem("allocflow_user", JSON.stringify(res.user));
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (role: UserRole) => {
    const creds = DEMO_CREDENTIALS[role];
    if (creds) {
      await login(creds.email, creds.pass);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("allocflow_token");
    localStorage.removeItem("allocflow_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        quickLogin,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
