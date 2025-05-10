import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  allowedRoles: string[];
  redirectTo?: string;
}

export const ProtectedRoute = ({ allowedRoles, redirectTo = "/login" }: ProtectedRouteProps) => {
  const { role } = useAuth();

  if (!allowedRoles.includes(role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};
