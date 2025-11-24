import { useEffect, useMemo, useRef, useState } from "react";
import XIcon from "../assets/x-solid-full.svg?react";

export type DepartmentOption = {
  department_id: number | string;
  department_name: string;
};

type Props = {
  label?: string;
  value: Array<number | string>;
  options: DepartmentOption[];
  onChange: (nextIds: Array<number | string>) => void;

  error?: string;
  required?: boolean;
  showAsterisk?: boolean;
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;

  maxSelected?: number;
  className?: string;
  name?: string;
  onClearError?: (name: string) => void;
};

const spinner = (
  <svg
    className="animate-spin h-4 w-4 text-gray-400"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
      fill="none"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
);

export default function DepartmentSearchTagPicker({
  label = "Teaching Departments",
  name = "departments",
  value,
  options,
  onChange,
  error,
  required = false,
  showAsterisk = true,
  loading = false,
  disabled = false,
  placeholder = "Search departments...",
  maxSelected,
  className = "",
  onClearError,
}: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (error && onClearError) {
      const timer = setTimeout(() => onClearError(name), 3000);
      return () => clearTimeout(timer);
    }
  }, [error, onClearError, name]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const el = containerRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const selectedSet = useMemo(() => new Set(value.map(String)), [value]);

  const optionById = useMemo(() => {
    const m = new Map<string, DepartmentOption>();
    options.forEach((o) => m.set(String(o.department_id), o));
    return m;
  }, [options]);

  const selectedOptions = useMemo(() => {
    return value
      .map((id) => optionById.get(String(id)))
      .filter(Boolean) as DepartmentOption[];
  }, [value, optionById]);

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.department_name.toLowerCase().includes(q));
  }, [options, query]);

  const handleInputBlur = () => {
    requestAnimationFrame(() => {
      const root = containerRef.current;
      const active = document.activeElement;
      if (!root || !active || !root.contains(active)) {
        setOpen(false);
      }
    });
  };

  function toggle(id: number | string) {
    if (disabled) return;

    const key = String(id);
    const exists = selectedSet.has(key);

    let next: Array<number | string>;
    if (exists) {
      next = value.filter((v) => String(v) !== key);
    } else {
      if (maxSelected && value.length >= maxSelected) return;
      next = [...value, id];
    }

    onChange(next);
    onClearError?.(name);

    setQuery("");
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled || loading) return;

    if (e.key === "Backspace" && query.trim() === "" && value.length > 0) {
      const last = value[value.length - 1];
      onChange(value.filter((v) => String(v) !== String(last)));
      onClearError?.(name);
      setOpen(false);
    }
  };

  function remove(id: number | string) {
    if (disabled) return;
    onChange(value.filter((v) => String(v) !== String(id)));
    onClearError?.(name);
  }

  function clearAll() {
    if (disabled) return;
    onChange([]);
    onClearError?.(name);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className={`w-full ${className}`}>
      {label && (
        <label
          className="flex mb-1 text-sm select-none text-[#767676]"
          onMouseDown={(e) => e.preventDefault()}
        >
          {label}
          {required && showAsterisk && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
      )}

      <div
        className={`w-full min-h-10 px-3 py-2 border rounded-md flex flex-wrap items-center gap-2 transition
          ${error ? "border-red-500" : "border-[#E9E6E6]"}
          ${disabled || loading ? "bg-gray-50 cursor-not-allowed" : "bg-white"}
        `}
        onClick={() => {
          if (disabled || loading) return;
          setOpen(true);
          inputRef.current?.focus();
        }}
      >
        {selectedOptions.map((opt) => (
          <span
            key={String(opt.department_id)}
            className="inline-flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-md border border-gray-200"
          >
            {opt.department_name}
            <button
              type="button"
              className="text-gray-500 disabled:opacity-50"
              onClick={(e) => {
                e.stopPropagation();
                remove(opt.department_id);
              }}
              disabled={disabled || loading}
              aria-label={`Remove ${opt.department_name}`}
            >
              <XIcon className="h-4 w-4 text-[#767676]" />
            </button>
          </span>
        ))}

        <input
          id={name}
          ref={inputRef}
          type="text"
          className="flex-1 min-w-32 bg-transparent outline-none border-0 p-0 m-0"
          placeholder={selectedOptions.length ? "" : placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            onClearError?.(name);
          }}
          onFocus={() => !disabled && !loading && setOpen(true)}
          disabled={disabled || loading}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
        />

        {loading ? (
          <div className="ml-1">{spinner}</div>
        ) : query || selectedOptions.length > 0 ? (
          <button
            type="button"
            className="ml-1"
            onClick={(e) => {
              e.stopPropagation();
              clearAll();
            }}
            aria-label="Clear all"
            disabled={disabled || loading}
          >
            <XIcon className="h-4 w-4 text-[#767676]" />
          </button>
        ) : null}
      </div>

      {open && !disabled && !loading && (
        <div className="relative">
          <div className="absolute mt-px z-2000 w-full bg-white border border-gray-200 rounded-md max-h-60 overflow-auto">
            {filteredOptions.length === 0 && (
              <div className="px-3 py-2 text-gray-500">
                No departments found.
              </div>
            )}

            {filteredOptions.map((opt) => {
              const isSelected = selectedSet.has(String(opt.department_id));
              const atLimit =
                !!maxSelected && !isSelected && value.length >= maxSelected;

              return (
                <button
                  type="button"
                  key={String(opt.department_id)}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between
                    hover:bg-gray-50 transition
                    ${isSelected ? "bg-gray-50 font-medium" : ""}
                    ${atLimit ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                  onClick={() => !atLimit && toggle(opt.department_id)}
                  disabled={atLimit}
                >
                  <span>{opt.department_name}</span>
                  {isSelected && (
                    <span className="text-gray-500">Selected</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="h-5 mt-1 text-sm">
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </div>
  );
}
