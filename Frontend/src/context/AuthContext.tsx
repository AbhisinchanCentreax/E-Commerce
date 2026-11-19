"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, UserCreate, UserUpdate } from "@/types";
import { api, getToken, removeToken, setToken } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<User>;
  register: (data: UserCreate) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (data: UserUpdate) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize from storage on mount
  useEffect(() => {
    const savedToken = getToken();
    if (savedToken) {
      setTokenState(savedToken);
      api.auth
        .getMe()
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          // Token expired or invalid
          removeToken();
          setTokenState(null);
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.auth.login(username, password);
      setToken(res.access_token);
      setTokenState(res.access_token);
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: UserCreate): Promise<User> => {
    setIsLoading(true);
    try {
      const newUser = await api.auth.register(data);
      // Auto login after registration
      await login(data.username, data.password);
      return newUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    removeToken();
    setTokenState(null);
    setUser(null);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  const refreshUser = async () => {
    if (!getToken()) return;
    try {
      const u = await api.auth.getMe();
      setUser(u);
    } catch {
      logout();
    }
  };

  const updateUser = async (data: UserUpdate): Promise<User> => {
    const updated = await api.auth.updateMe(data);
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        login,
        register,
        logout,
        refreshUser,
        updateUser,
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
