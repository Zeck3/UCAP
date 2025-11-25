import { useLayout } from "../context/useLayout";
import { useRoleSideNav } from "../config/Roles";
import HeaderComponent from "../components/HeaderComponent";
import SidebarNavButton from "../components/SideBarNavButton";
import { useBreadcrumbs } from "../context/useBreadCrumbs";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useMemo, useState } from "react";
import ProfilePopupComponent from "../components/ProfilePopupComponent";

interface AppLayoutProps {
  children: React.ReactNode;
  activeItem?: string;
  disablePadding?: boolean;
}

export default function AppLayout({
  children,
  activeItem,
  disablePadding = false,
}: AppLayoutProps) {
  const { isSidebarOpen, toggleSidebar } = useLayout();
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const roleNav = useRoleSideNav();
  const crumbs = useBreadcrumbs();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = activeItem || location.pathname;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const goToMain = () => navigate(currentPath);

  const sidebarButtons = useMemo(() => {
    const roleId = user?.role_id;
    const navItems = roleId != null ? roleNav[roleId] || [] : [];

    return navItems.map((item) => (
      <SidebarNavButton
        key={item.path}
        icon={item.icon}
        label={item.label}
        isSidebarOpen={isSidebarOpen}
        path={item.path}
        active={currentPath.startsWith(item.path)}
      />
    ));
  }, [user, roleNav, isSidebarOpen, currentPath]);

  const sidebarWidth = user?.role_id === 3 ? "w-65" : "w-52";

  return (
    <div className="h-screen flex">
      <HeaderComponent
        username={
          user
            ? [user.last_name, user.first_name].filter(Boolean).join(", ")
            : "Guest"
        }
        onLogout={handleLogout}
        onButtonClick={toggleSidebar}
        onLogoClick={goToMain}
        onProfileClick={() => setProfileOpen(true)}
        crumbs={crumbs}
      />
      <ProfilePopupComponent
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={user}
      />
      <div className="flex flex-row w-full pt-16">
        <aside
          className={`flex border-r border-[#E9E6E6] transition-all duration-300 z-2000 ${
            isSidebarOpen ? sidebarWidth : "w-16"
          }`}
        >
          <nav className="flex flex-col w-full pt-4 sticky top-0">
            {sidebarButtons}
          </nav>
        </aside>

        <main
          className={`flex-1 transition-all duration-300 overflow-y-auto ${
            disablePadding
              ? ""
              : isSidebarOpen
              ? "pr-44 pl-8 max-2xl:pl-8 max-2xl:pr-8 "
              : "pr-44 pl-44 max-2xl:pl-8 max-2xl:pr-8 "
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
