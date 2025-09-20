import { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import type { User } from "./AuthContext";
import { useNavigate } from "react-router-dom";
//import axiosClient from "../api/axiosClient"; // axios instance with interceptors

const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("lastActive");
    navigate("/login", { replace: true });
  }, [navigate]);

  const login = (userData: User, access: string, refresh: string) => {
    setUser(userData);

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    localStorage.setItem("lastActive", Date.now().toString());
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const access = localStorage.getItem("access_token");
    const refresh = localStorage.getItem("refresh_token");
    const lastActiveStr = localStorage.getItem("lastActive");
    const now = Date.now();

    if (storedUser && access && refresh) {
      try {
        const parsedUser: User = JSON.parse(storedUser);

        if (lastActiveStr && now - Number(lastActiveStr) > IDLE_TIMEOUT) {
          logout();
        } else {
          setUser(parsedUser);
        }
      } catch (err) {
        console.warn("Invalid user data in localStorage, clearing...", err);
        localStorage.removeItem("user");
        logout();
      }
    }

    setLoading(false);
  }, [logout]);

  useEffect(() => {
    if (!user) return;

    let timer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      localStorage.setItem("lastActive", Date.now().toString());
      clearTimeout(timer);
      timer = setTimeout(() => {
        logout();
        alert("You have been logged out due to inactivity.");
      }, IDLE_TIMEOUT);
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);
    window.addEventListener("scroll", resetTimer);

    resetTimer();

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("scroll", resetTimer);
    };
  }, [user, logout]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
