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
      className="flex flex-row py-4 cursor-pointer transition-colors duration-300"
      onClick={handleClick}
    >

      <div className="flex flex-row w-16 items-center">
        <div
          className={`rounded-r-lg w-2 h-full transition-colors duration-300 ${
            active ? "bg-ucap-yellow" : "bg-transparent"
          }`}
        ></div>
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
    </button>
  );
}
