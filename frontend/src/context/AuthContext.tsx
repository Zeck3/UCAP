import { createContext } from "react";
import type { User } from "../types/types";

export type AuthContextType = {
  user: User | null;
  login: (userId: number, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
