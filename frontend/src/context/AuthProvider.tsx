import { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import type { User } from "./AuthContext";
import { useNavigate } from "react-router-dom";

const IDLE_TIMEOUT = 15 * 60 * 1000;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("lastActive");
    navigate("/login", { replace: true });
  }, [navigate]);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("lastActive", Date.now().toString());
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const lastActiveStr = localStorage.getItem("lastActive");
    const now = Date.now();

    if (storedUser) {
      const parsedUser: User = JSON.parse(storedUser);

      if (lastActiveStr && now - Number(lastActiveStr) > IDLE_TIMEOUT) {
        logout();
      } else {
        setUser(parsedUser);
      }
    }
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
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
