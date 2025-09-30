/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient.js";

const AuthContext = createContext({ user: null, session: null, loading: true });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session || null);
      setUser(data.session?.user || null);
      setLoading(false);
    })();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user || null);
      }
    );
    return () => {
      mounted = false;
      subscription.subscription?.unsubscribe?.();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="min-h-[50vh] grid place-items-center">
        <div className="flex items-center gap-2 text-gray-600">
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  if (!user) {
    // simple client redirect to login
    window.location.replace("/login");
    return null;
  }
  return children;
}
