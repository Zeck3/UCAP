import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { roleInheritance } from "../../config/Roles";

type Props = {
  allowedRoles?: number[];
};
export default function ProtectedRoute({ allowedRoles }: Props) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  const roleId = user.role_id;

  const inheritedRoles = roleInheritance[roleId] ?? [];
  const effectiveRoles = [roleId, ...inheritedRoles];

  if (allowedRoles && !allowedRoles.some((r) => effectiveRoles.includes(r))) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
