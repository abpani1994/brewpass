import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { fetchMe, setToken, clearToken, getToken } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!getToken()) {
      setOwner(null);
      setLoading(false);
      return;
    }
    try {
      const { owner } = await fetchMe();
      setOwner(owner);
    } catch {
      clearToken();
      setOwner(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const signIn = (token, owner) => {
    setToken(token);
    setOwner(owner);
  };
  const signOut = () => {
    clearToken();
    setOwner(null);
  };

  return (
    <AuthContext.Provider value={{ owner, loading, signIn, signOut, reload: load }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}