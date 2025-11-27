import { useEffect, useState } from "react";
import KebabIcon from "../assets/ellipsis-vertical-solid.svg?react";
import EditIcon from "../assets/customize.svg?react";
import DeleteIcon from "../assets/trash-solid.svg?react";
import ChevronRight from "../assets/chevron-right-solid.svg?react";
import ChevronLeft from "../assets/chevron-left-solid.svg?react";
import ChevronDown from "../assets/chevron-down-solid.svg?react";

interface Column<T> {
  key: keyof T;
  label: string;
}

interface TableProps<T extends { id: string | number }> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (id: T["id"]) => void;
  onDelete?: (id: T["id"]) => void;
  emptyImageSrc?: string;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  disableRowPointer?: boolean;
  showActions?: boolean;
  loading?: boolean;
  skeletonRows?: number;
  disableEdit?: boolean;
}

export default function TableComponent<T extends { id: string | number }>({
  data,
  columns,
  onEdit,
  onDelete,
  onRowClick,
  disableRowPointer = false,
  emptyImageSrc = "/empty.svg",
  emptyMessage = "No data available",
  showActions = false,
  loading = false,
  skeletonRows = 6,
  disableEdit = false,
}: TableProps<T>) {
  const [openMenuId, setOpenMenuId] = useState<T["id"] | null>(null);

  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const sortedData = (() => {
    if (!sortKey || !sortOrder) return data;

    return [...data].sort((a, b) => {
      const v1 = a[sortKey];
      const v2 = b[sortKey];

      if (v1 == null) return 1;
      if (v2 == null) return -1;

      if (typeof v1 === "number" && typeof v2 === "number") {
        return sortOrder === "asc" ? v1 - v2 : v2 - v1;
      }

      const s1 = String(v1).toLowerCase();
      const s2 = String(v2).toLowerCase();

      if (s1 < s2) return sortOrder === "asc" ? -1 : 1;
      if (s1 > s2) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  })();

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handleSort = (key: keyof T) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortOrder("asc");
      return;
    }

    if (sortOrder === "asc") {
      setSortOrder("desc");
    } else if (sortOrder === "desc") {
      setSortKey(null);
      setSortOrder(null);
    }
  };

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
    if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const insideAction = target.closest('[data-action-menu="true"]');

      if (!insideAction) {
        setOpenMenuId(null);
      }
    }

    if (openMenuId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [openMenuId]);

  if (loading) {
    return (
      <div className="overflow-x-auto pt-4 pb-20">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr>
              <th
                colSpan={columns.length + (showActions ? 1 : 0)}
                className="py-4"
              >
                <div className="h-8 bg-gray-200 rounded w-full animate-pulse"></div>
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: skeletonRows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="animate-pulse">
                <td
                  colSpan={columns.length + (showActions ? 1 : 0)}
                  className="py-4"
                >
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center pt-8">
        <img
          src={emptyImageSrc}
          alt="Empty"
          className="h-50 w-50"
          loading="eager"
          decoding="async"
        />
        <span className="text-[#C6C6C6]">{emptyMessage}</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pt-4 pb-20">
      <table className="min-w-full text-left text-sm">
        <thead className="text-sm font-normal text-[#767676]">
          <tr>
            {columns.map((col) => {
              const isActive = sortKey === col.key;
              return (
                <th
                  key={String(col.key)}
                  className="pr-6 py-4 font-normal select-none cursor-pointer"
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex items-center gap-2">
                    {col.label}

                    {isActive && sortOrder === "asc" && (
                      <span className="text-xs">
                        <ChevronDown className="-rotate-180 h-4 w-4" />
                      </span>
                    )}
                    {isActive && sortOrder === "desc" && (
                      <span className="text-xs">
                        <ChevronDown className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                </th>
              );
            })}

            {showActions && (
              <th className="py-4 font-normal flex justify-center">Action</th>
            )}
          </tr>
        </thead>

        <tbody>
          {paginatedData.map((row, idx) => {
            const isClickable = !!onRowClick && !disableRowPointer;
            return (
              <tr
                key={row.id ?? idx}
                className={`text-[#3E3E3E] hover:bg-gray-100 ${
                  isClickable ? "cursor-pointer" : ""
                }`}
                onClick={() => {
                  if (isClickable) onRowClick?.(row);
                }}
              >
                {columns.map((col) => (
                  <td key={String(col.key)} className="pr-6 py-4">
                    {String(row[col.key])}
                  </td>
                ))}

                {showActions && (
                  <td className="relative text-center">
                    <div
                      className="inline-flex items-center justify-center relative"
                      data-action-menu="true"
                    >
                      <button
                        className="w-8 h-8 flex items-center justify-center"
                        onClick={(event) => {
                          event.stopPropagation();
                          setOpenMenuId((prev) =>
                            prev === row.id ? null : row.id
                          );
                        }}
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white cursor-pointer">
                          <KebabIcon className="h-5 w-5" />
                        </span>
                      </button>

                      {openMenuId === row.id && (
                        <div
                          className="absolute right-0 top-12 w-40 bg-white border border-[#E9E6E6] rounded-lg z-20"
                          data-action-menu="true"
                        >
                          {!disableEdit && (
                            <button
                              className="flex w-full items-center gap-2 py-2 cursor-pointer rounded-lg transition hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit?.(row.id);
                                setOpenMenuId(null);
                              }}
                            >
                              <EditIcon className="h-5 w-5 ml-4 mr-2" />
                              <span>Edit</span>
                            </button>
                          )}
                          <button
                            className="flex w-full items-center gap-2 py-2 cursor-pointer rounded-lg transition hover:bg-gray-100 text-red-400"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete?.(row.id);
                              setOpenMenuId(null);
                            }}
                          >
                            <DeleteIcon className="h-5 w-5 ml-4 mr-2" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {totalPages > 1 && (
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
      )}
    </div>
  );
}
