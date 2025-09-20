import { createContext } from "react";

export type User = {
  user_id: number;
  role_id: number;
  department_id: number | null;
  first_name: string;
  last_name: string;
  email: string | null;
};

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (userData: User, access: string, refresh: string) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
