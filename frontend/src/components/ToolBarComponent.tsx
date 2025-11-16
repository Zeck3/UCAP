import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import CardsIcon from "../assets/square-solid.svg?react";
import ListIcon from "../assets/list-ul-solid.svg?react";
import ChevronDown from "../assets/chevron-down-solid.svg?react";
import SearchIcon from "../assets/search.svg?react";
import { useLayout } from "../context/useLayout";

type TitleOption = {
  label: string;
  value: string;
  disabled?: boolean;
  enableSearch?: boolean;
  enableLayout?: boolean;
  enableButton?: boolean;
};

type ToolBarProps = {
  titleOptions?: TitleOption[];
  onSearch?: (value: string) => void;
  onTitleSelect?: (value: string) => void;
  buttonLabel?: string;
  buttonIcon?: ReactNode;
  onButtonClick?: () => void;
  layout?: "cards" | "list";
};

export default function ToolBarComponent({
  titleOptions = [],
  onSearch,
  onTitleSelect,
  buttonLabel = "Action",
  buttonIcon,
  onButtonClick,
}: ToolBarProps) {
  const { layout, setLayout } = useLayout();
  const [activeTitle, setActiveTitle] = useState(titleOptions[0]?.value || "");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeOption = titleOptions.find((opt) => opt.value === activeTitle);

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

  const options = [
    { value: "cards", label: "Cards", icon: <CardsIcon className="h-4 w-4" /> },
    { value: "list", label: "List", icon: <ListIcon className="h-4 w-4" /> },
  ];

  const selectedOption = options.find((o) => o.value === layout);

  return (
    <div className="flex flex-col gap-4 sticky top-0 z-30 bg-white">
      <div className="flex flex-row items-center mt-6">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-8">
            {titleOptions.map((opt) => {
              const isSingle = titleOptions.length === 1;
              const isActive = activeTitle === opt.value;

              return (
                <div
                  key={opt.value}
                  onClick={() => {
                    if (!opt.disabled && !isSingle) {
                      setActiveTitle(opt.value);
                      onTitleSelect?.(opt.value);
                    }
                  }}
                  className={`relative ${
                    !isSingle ? "cursor-pointer" : ""
                  } text-xl font-base transition h-full py-2 ${
                    opt.disabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <span
                    className={`${
                      !isSingle && isActive ? "text-ucap-yellow" : "text-[#767676]"
                    }`}
                  >
                    {opt.label}
                  </span>
                  {!isSingle && isActive && (
                    <span className="absolute top-14 left-0 w-full h-1 bg-ucap-yellow rounded-t-md" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="h-11 flex flex-row gap-5 items-center">
          {activeOption?.enableSearch && (
            <div className="relative flex-1">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-auto" />
              <input
                type="text"
                id="search"
                name="search"
                placeholder="Search"
                onChange={(e) => onSearch?.(e.target.value)}
                className="pl-12 pr-4 py-2 text-base border border-[#E9E6E6] rounded-full w-full"
              />
            </div>
          )}

          {activeOption?.enableLayout && (
            <div className="relative w-32" ref={dropdownRef}>
              <button
                className="flex items-center justify-between w-full px-3 py-2 border border-[#E9E6E6] rounded-lg bg-white"
                onClick={() => setIsOpen((prev) => !prev)}
              >
                <div className="flex items-center gap-2">
                  {selectedOption?.icon}
                  <span>{selectedOption?.label}</span>
                </div>
                <ChevronDown
                  className={`h-4 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="absolute w-full bg-white border border-[#E9E6E6] rounded-lg z-10">
                  {options.map((option) => (
                    <div
                      key={option.value}
                      className={`flex items-center gap-2 px-3 py-2 cursor-pointer rounded-lg ${
                        layout === option.value ? "bg-gray-100" : ""
                      }`}
                      onClick={() => {
                        setLayout(option.value as "cards" | "list");
                        setIsOpen(false);
                      }}
                    >
                      {option.icon}
                      <span>{option.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeOption?.enableButton && (
            <button
              onClick={onButtonClick}
              className="bg-ucap-yellow bg-ucap-yellow-hover text-white px-4 py-2 border border-[#FCB315] rounded-full cursor-pointer transition text-base flex items-center gap-2"
            >
              {buttonIcon && <span className="h-5">{buttonIcon}</span>}
              <span>{buttonLabel}</span>
            </button>
          )}
        </div>
      </div>
      <hr className="text-[#E9E6E6] rounded" />
    </div>
  );
}
