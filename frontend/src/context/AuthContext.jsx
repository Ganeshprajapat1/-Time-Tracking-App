import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { me as meApi } from "../api/authApi";

const AuthContext = createContext(null);

const readStoredUser = () => {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [bootstrapping, setBootstrapping] = useState(true);

  const refreshProfile = useCallback(async () => {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (!token) {
      setUser(null);
      return null;
    }
    const res = await meApi();
    const u = res.data.user;
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
    return u;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
        if (token) {
          await refreshProfile();
        }
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setBootstrapping(false);
      }
    })();
  }, [refreshProfile]);

  const loginUser = useCallback((payload) => {
    const u = payload.user;
    const access = payload.accessToken || payload.token;
    const refresh = payload.refreshToken;
    if (access) {
      localStorage.setItem("accessToken", access);
      localStorage.setItem("token", access);
    }
    if (refresh) localStorage.setItem("refreshToken", refresh);
    if (u) {
      localStorage.setItem("user", JSON.stringify(u));
      setUser(u);
    }
  }, []);

  const logoutUser = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      bootstrapping,
      isAuthenticated: Boolean(user && (localStorage.getItem("accessToken") || localStorage.getItem("token"))),
      loginUser,
      logoutUser,
      refreshProfile
    }),
    [user, bootstrapping, loginUser, logoutUser, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
