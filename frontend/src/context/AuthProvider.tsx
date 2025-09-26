import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import type { User } from "../types/types";
import {
  loginRequest,
  logoutRequest,
  fetchCurrentUser,
} from "../api/authClient";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      fetchCurrentUser().then((user) => {
        setUser(user);
        setInitialized(true);
      });
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
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
