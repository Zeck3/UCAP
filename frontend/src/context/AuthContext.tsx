import { createContext } from "react";
import type { CurrentUser } from "../types/userTypes";

export type AuthContextType = {
  user: CurrentUser | null;
  initialized: boolean;
  login: (userId: number, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
