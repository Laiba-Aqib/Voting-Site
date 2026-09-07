"use client";

// context/AuthContext.js
//
// React Context lets us load "who is logged in" ONCE near the top of the
// app and then read it from any page/component below, instead of every
// page re-fetching /user/profile on its own.
//
// How the pieces fit together:
//  - AuthProvider wraps the whole app in app/layout.js.
//  - On first load it checks localStorage for a token, and if one exists
//    it calls GET /user/profile to find out who that token belongs to
//    (name, role, isVoted, etc - exactly what your userRoutes.js /profile
//    endpoint returns).
//  - login(token) is called right after signup/login succeeds.
//  - logout() clears everything.
//  - Any page can do `const { user, loading, login, logout } = useAuth()`.

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiFetch, getToken, setToken, clearToken } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // the object /user/profile returns, or null
  const [loading, setLoading] = useState(true);  // true while we check localStorage on first load

  const refreshUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      // This hits GET /user/profile, which your backend protects with
      // jwtAuthMiddleware and returns the full User document for.
      const profile = await apiFetch("/user/profile");
      setUser(profile);
    } catch (err) {
      // Token is missing/expired/invalid - treat the user as logged out.
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  function login(token) {
    setToken(token);
    refreshUser();
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
