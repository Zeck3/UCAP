import KebabIcon from "../assets/ellipsis-vertical-solid.svg?react";
import EditIcon from "../assets/customize.svg?react";
import DeleteIcon from "../assets/trash-solid.svg?react";
import { useEffect, useRef, useState } from "react";
import ChevronRight from "../assets/chevron-right-solid.svg?react";
import ChevronLeft from "../assets/chevron-left-solid.svg?react";

export interface CardsGridProps<T> {
  items: T[];
  onCardClick?: (item: T) => void;
  onEdit?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
  emptyImageSrc?: string;
  emptyMessage?: string;
  aspectRatio?: string;
  fieldTop?: keyof T | ((item: T) => string);
  title: keyof T | ((item: T) => string);
  subtitle: keyof T | ((item: T) => string);
  enableOption?: boolean;
  disableCardPointer?: boolean;
  loading?: boolean;
  skeletonCard?: number;
}

export default function CardsGridComponent<T extends { id: string | number }>({
  items,
  onCardClick,
  onEdit,
  onDelete,
  emptyImageSrc = "/empty.svg",
  emptyMessage = "No items available",
  aspectRatio = "20/9",
  fieldTop,
  title,
  subtitle,
  enableOption = false,
  disableCardPointer = false,
  loading = false,
  skeletonCard = 6,
}: CardsGridProps<T>) {
  const [openMenuId, setOpenMenuId] = useState<string | number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = items.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    const skeletons = Array.from({ length: skeletonCard }, (_, i) => i);
    return (
      <div className="grid gap-4 my-8 w-full grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 pb-20">
        {skeletons.map((i) => (
          <div
            key={i}
            className="relative bg-white rounded-lg border border-[#E9E6E6] flex flex-col animate-pulse"
          >
            <div
              style={{ aspectRatio }}
              className="w-full bg-gray-200 rounded-t-lg"
            />
            <hr className="text-[#E9E6E6] rounded w-full" />
            <div className="flex flex-col m-4 space-y-2">
              <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
              <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center pt-8">
        <img src={emptyImageSrc} alt="Empty" className="h-50 w-50" />
        <span className="text-[#C6C6C6]">{emptyMessage}</span>
      </div>
    );
  }

  const resolveField = (item: T, field: keyof T | ((item: T) => string)) => {
    if (typeof field === "function") return field(item);
    return String(item[field]);
  };

  return (
    <div className="flex flex-col items-center w-full pb-20">
      <div className="grid gap-4 my-8 w-full grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {paginatedItems.map((item) => {
          const topValue = fieldTop ? resolveField(item, fieldTop) : undefined;

          return (
            <div
              key={item.id}
              onClick={
                disableCardPointer || !onCardClick
                  ? undefined
                  : () => onCardClick(item)
              }
              className={`relative bg-white rounded-lg border border-[#E9E6E6] flex flex-col transition-transform transform hover:scale-105
                ${disableCardPointer ? "" : "cursor-pointer"}`}
            >
              {topValue && (
                <div
                  style={{ aspectRatio }}
                  className="w-full bg-gradient-to-b from-[#1A1851] to-[#3B36B7] rounded-t-lg flex items-end"
                >
                  <span className="text-2xl text-white mx-4 mb-2">
                    {topValue}
                  </span>
                </div>
              )}

              <hr className="text-[#E9E6E6] rounded w-full" />

              <div className="flex flex-col m-4">
                <h4 className="w-full text-base truncate">
                  {typeof title === "function"
                    ? title(item)
                    : String(item[title])}
                </h4>
                <h5 className="text-xs text-[#767676] truncate">
                  {typeof subtitle === "function"
                    ? subtitle(item)
                    : String(item[subtitle])}
                </h5>
              </div>

              {enableOption && (
                <div className="absolute top-2 right-2" ref={dropdownRef}>
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === item.id ? null : item.id);
                    }}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-gray-100 hover:text-[#767676] cursor-pointer">
                      <KebabIcon />
                    </span>
                  </button>

                  {openMenuId === item.id && (
                    <div
                      ref={dropdownRef}
                      className="absolute right-0 top-12 w-40 bg-white border border-[#E9E6E6] rounded-lg z-20"
                    >
                      <button
                        className="flex items-center gap-2 py-2 cursor-pointer rounded-lg transition hover:bg-gray-100 text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit?.(item.id);
                          setOpenMenuId(null);
                        }}
                      >
                        <EditIcon className="h-5 w-5 ml-4 mr-2" />
                        <span>Edit</span>
                      </button>
                      <button
                        className="flex items-center gap-2 py-2 cursor-pointer rounded-lg transition hover:bg-gray-100 text-sm text-red-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete?.(item.id);
                          setOpenMenuId(null);
                        }}
                      >
                        <DeleteIcon className="h-5 w-5 ml-4 mr-2" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex w-full justify-end items-center gap-x-4 mt-4">
        <button
          className="px-2 py-2 border border-[#E9E6E6] rounded disabled:opacity-50 enabled:cursor-pointer"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-sm">
          {currentPage} of {totalPages}
        </span>
        <button
          className="px-2 py-2 border border-[#E9E6E6] rounded disabled:opacity-50 enabled:cursor-pointer"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
