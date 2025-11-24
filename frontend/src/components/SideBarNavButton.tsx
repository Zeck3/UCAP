import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface SidebarNavButtonProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  isSidebarOpen: boolean;
  onClick?: () => void;
  path?: string;
}

export default function SidebarNavButton({
  icon,
  label,
  active = false,
  isSidebarOpen,
  onClick,
  path,
}: SidebarNavButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) onClick();
    if (path && location.pathname !== path) navigate(path);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group relative flex flex-row py-4 cursor-pointer transition-colors duration-300"
    >

      <div className="flex flex-row w-14 items-center">
        <div
          className={`rounded-r-lg w-2 h-full transition-colors duration-300 ${
            active ? "bg-ucap-yellow" : "bg-transparent"
          }`}
        />
        <div
          className={`ml-3 h-6 w-6 flex items-center justify-center transition-colors duration-300 ${
            active ? "text-ucap-yellow" : "text-[#767676]"
          }`}
        >
          {icon}
        </div>
      </div>

      <span
        className={`flex flex-1 truncate text-base transition-all duration-300 ${
          isSidebarOpen ? "flex" : "hidden"
        } ${active ? "text-ucap-yellow" : "text-[#767676]"}`}
      >
        {label}
      </span>

      {!isSidebarOpen && (
        <span
          className={`
            pointer-events-none absolute left-14 top-1/2 -translate-y-1/2
            whitespace-nowrap rounded-md px-2 py-1 text-sm bg-white
            opacity-0 invisible border border-[#E9E6E6]
            group-hover:opacity-100 group-hover:visible
            transition-opacity duration-150
          `}
        >
          {label}
        </span>
      )}
    </button>
  );
}
