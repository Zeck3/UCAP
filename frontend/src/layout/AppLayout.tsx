import { useLayout } from "../context/useLayout";
import { useRoleSideNav } from "../config/Roles";
import HeaderComponent from "../components/HeaderComponent";
import SidebarNavButton from "../components/SideBarNavButton";
import { useBreadcrumbs } from "../context/useBreadCrumbs";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

interface AppLayoutProps {
  children: React.ReactNode;
  activeItem: string;
  disablePadding?: boolean;
}

export default function AppLayout({
  children,
  activeItem,
  disablePadding = false,
}: AppLayoutProps) {
  const { isSidebarOpen, toggleSidebar } = useLayout();
  const { user, logout } = useAuth();
  const roleNav = useRoleSideNav();
  const navItems = user ? roleNav[user.role_id] || [] : [];
  const crumbs = useBreadcrumbs();
  const navigate = useNavigate();

  const goToMain = () => {
    navigate(activeItem);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

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
        crumbs={crumbs}
      />
      <div className="flex flex-row w-full pt-16">
        <aside
          className={`flex border-r border-[#E9E6E6] transition-all duration-300 ${
            isSidebarOpen ? "w-52" : "w-16"
          }`}
        >
          <nav className="flex flex-col w-full pt-4 sticky top-0">
            {navItems.map((item) => (
              <SidebarNavButton
                key={item.path}
                icon={item.icon}
                label={item.label}
                isSidebarOpen={isSidebarOpen}
                active={activeItem === item.path}
                path={item.path}
              />
            ))}
          </nav>
        </aside>
        <main
          className={`flex-1 transition-all duration-300 overflow-y-auto
          ${disablePadding ? "" : isSidebarOpen ? "pr-44 pl-8" : "pr-44 pl-44"}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
