import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import BarsIcon from "../assets/bars-solid.svg?react";
import ChevronDown from "../assets/chevron-down-solid.svg?react";
import LogoutIcon from "../assets/arrow-right-from-bracket-solid.svg?react";
import UcapLogo from "../assets/ucap-logo.svg?react";
import ChevronRight from "../assets/chevron-right-solid.svg?react"

interface HeaderComponentProps {
  username: string;
  onLogout: () => void;
  onButtonClick: () => void;
  onLogoClick: () => void;
  hideBreadcrumbs?: boolean;
  crumbs?: {
    label: string;
    path: string;
    state?: {
      loadedCourseId: number;
      instructorId: number;
    };
  }[];
}

export default function HeaderComponent({
  username,
  onLogout,
  onButtonClick,
  onLogoClick,
  hideBreadcrumbs = false,
  crumbs,
}: HeaderComponentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  return (
    <header className="flex border-b border-[#E9E6E6] bg-white h-16 w-full fixed select-none z-30">
      <div
        className="w-16 flex items-center justify-center"
        onClick={onButtonClick}
      >
        <button className="flex h-12 w-12 items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer">
          <BarsIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center w-44">
        <button onClick={onLogoClick} className="cursor-pointer">
          <UcapLogo className="h-16 w-32" />
        </button>
      </div>

      <div className="flex flex-1">
        {!hideBreadcrumbs && crumbs && (
          <nav className="flex items-center">
            {crumbs.map((crumb) => (
              <span key={crumb.path} className="flex items-center gap-8 pr-8">
                <ChevronRight className="h-5 w-5"/>
                <Link
                  to={crumb.path}
                  state={crumb.state}
                  className="hover:underline text-xl text-[#767676]"
                >
                  {crumb.label}
                </Link>
              </span>
            ))}
          </nav>
        )}
      </div>

      <div
        className="relative flex justify-end items-center w-44 pr-4"
        ref={dropdownRef}
      >
        <div
          className="flex items-center justify-end cursor-pointer"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <span className="text-base mr-2 truncate max-w-32.5 overflow-hidden whitespace-nowrap">
            {username}
          </span>
          <ChevronDown
            className={`h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </div>

        {isOpen && (
          <div className="absolute right-4 top-12 w-40 bg-white border border-[#E9E6E6] rounded-lg z-20">
            <div
              className="flex items-center gap-2 py-2 cursor-pointer rounded-lg transition"
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
            >
              <LogoutIcon className="h-5 w-5 ml-4" />
              <span>Logout</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
