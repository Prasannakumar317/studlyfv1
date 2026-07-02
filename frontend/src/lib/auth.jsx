import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase";
import api from "./api";

const AuthCtx = createContext({
  user: null,
  loading: true,
  refresh: () => { },
  logout: () => { },
  signUp: () => { },
  signIn: () => { },
  signInWithGoogle: () => { },
  resetPassword: () => { }
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync session with axios and fetch MongoDB user record
  const syncUser = useCallback(async (session) => {
    setLoading(true);
    if (!session) {
      setUser(null);
      localStorage.removeItem("studlyf_session_token");
      setLoading(false);
      return;
    }
    
    // Store access_token for Axios interceptor
    localStorage.setItem("studlyf_session_token", session.access_token);
    
    try {
      // Call backend /me endpoint (which syncs user in MongoDB and returns profile)
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch (e) {
      console.error("Failed to sync user with backend:", e);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await syncUser(session);
    } catch (e) {
      console.error("Failed to refresh session:", e);
      setLoading(false);
    }
  }, [syncUser]);

  useEffect(() => {
    // Check active session on mount
    refresh();

    // Listen for auth state changes (login, logout, token refresh, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      await syncUser(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refresh, syncUser]);

  const signUp = async (email, password, metadata = {}) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      if (error) throw error;
      if (!data?.session) {
        setLoading(false);
      }
      return data;
    } catch (e) {
      setLoading(false);
      throw e;
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (!data?.session) {
        setLoading(false);
      }
      return data;
    } catch (e) {
      setLoading(false);
      throw e;
    }
  };

  const signInWithGoogle = async () => {
    const redirectUrl = window.location.origin + "/workspace";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("studlyf_session_token");
    setUser(null);
    window.location.href = "/";
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) throw error;
  };

  return (
    <AuthCtx.Provider value={{ user, setUser, loading, refresh, logout, signUp, signIn, signInWithGoogle, resetPassword }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
