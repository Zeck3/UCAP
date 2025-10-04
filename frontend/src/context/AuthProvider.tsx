import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import type { CurrentUser } from "../types/userManagementTypes";
import { loginRequest, logoutRequest, fetchCurrentUser } from "../api/authApi";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      fetchCurrentUser()
        .then((user) => {
          setUser(user);
        })
        .catch(() => {
          setUser(null);
        })
        .finally(() => setInitialized(true));
    }
  }, [initialized]);

  const login = async (userId: number, password: string) => {
    const userData = await loginRequest(userId, password);
    setUser(userData);
  };

  const logout = async () => {
    await logoutRequest();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, initialized, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
