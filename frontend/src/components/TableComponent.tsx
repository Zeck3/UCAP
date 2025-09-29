import { useEffect, useRef, useState } from "react";
import KebabIcon from "../assets/ellipsis-vertical-solid.svg?react";
import EditIcon from "../assets/customize.svg?react";
import DeleteIcon from "../assets/trash-solid.svg?react";
import ChevronRight from "../assets/chevron-right-solid.svg?react";
import ChevronLeft from "../assets/chevron-left-solid.svg?react";

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
}: TableProps<T>) {
  const [openMenuId, setOpenMenuId] = useState<T["id"] | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenMenuId(null);
      }
    }
    if (openMenuId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
    return;
  }, [openMenuId]);

  useEffect(() => {
    if (openMenuId === null) dropdownRef.current = null;
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
        <img src={emptyImageSrc} alt="Empty" className="h-50 w-50" />
        <span className="text-[#C6C6C6]">{emptyMessage}</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pt-4 pb-20">
      <table className="min-w-full text-left text-sm">
        <thead className="text-sm font-normal text-[#767676]">
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} className="pr-6 py-4 font-normal">
                {col.label}
              </th>
            ))}
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
                      ref={dropdownRef}
                    >
                      <button
                        className="w-8 h-8 flex items-center justify-center"
                        onClick={(event) => {
                          event.stopPropagation();
                          setOpenMenuId(openMenuId === row.id ? null : row.id);
                        }}
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white cursor-pointer">
                          <KebabIcon />
                        </span>
                      </button>

                      {openMenuId === row.id && (
                        <div
                          ref={dropdownRef}
                          className="absolute right-4 top-12 w-40 bg-white border border-[#E9E6E6] rounded-lg z-20"
                        >
                          <div
                            className="flex items-center gap-2 py-2 cursor-pointer rounded-lg transition hover:bg-gray-100"
                            onClick={() => {
                              onEdit?.(row.id);
                              setOpenMenuId(null);
                            }}
                          >
                            <EditIcon className="h-5 w-5 ml-4 mr-2" />
                            <span>Edit</span>
                          </div>

                          <div
                            className="flex items-center gap-2 py-2 cursor-pointer rounded-lg transition hover:bg-gray-100 text-red-400"
                            onClick={() => {
                              onDelete?.(row.id);
                              setOpenMenuId(null);
                            }}
                          >
                            <DeleteIcon className="h-5 w-5 ml-4 mr-2" />
                            <span>Delete</span>
                          </div>
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

      <div className="flex justify-end items-center gap-x-4 mt-4">
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
