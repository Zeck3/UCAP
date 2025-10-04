import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { roleInheritance } from "../../config/Roles";
import { roleRoutes } from "../../config/Roles";
import PageLoading from "../../pages/PageLoading";

type Props = {
  allowedRoles?: number[];
};

export default function ProtectedRoute({ allowedRoles }: Props) {
  const { user, initialized } = useAuth();

  if (!initialized) return <PageLoading/>;

  if (!user) return <Navigate to="/login" replace />;

  const roleId = user.role_id;
  const inheritedRoles = roleInheritance[roleId] ?? [];
  const effectiveRoles = [roleId, ...inheritedRoles];

  if (allowedRoles && !allowedRoles.some((r) => effectiveRoles.includes(r))) {
    const defaultRoute = roleRoutes[roleId] ?? "/login";
    return <Navigate to={defaultRoute} replace />;
  }

  return <Outlet />;
}
