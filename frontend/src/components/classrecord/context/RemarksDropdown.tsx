import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ChevronDown from "../../../assets/chevron-down-solid.svg?react";

interface Props {
  value: string | null;
  onChange: (val: string) => void;
}

const OPTIONS = ["", "INC", "Withdrawn", "DF", "OD"];

export default function RemarksDropdown({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const toggle = (btn: HTMLButtonElement) => {
    const r = btn.getBoundingClientRect();
    setCoords({ x: r.left, y: r.bottom + 2 });
    setOpen((p) => !p);
  };

  useEffect(() => {
    if (!open) return;

    const close = (e: MouseEvent) => {
      if (
        !menuRef.current?.contains(e.target as Node) &&
        !btnRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const menu = (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: coords.y,
        left: coords.x - 1,
        zIndex: 9999,
      }}
      className="w-27 bg-white border border-[#E9E6E6] rounded "
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt}
          className={`w-full px-3 py-1.5 h-10.5 text-left ${
            opt === value ? "bg-gray-100" : ""
          }`}
          onClick={() => {
            onChange(opt);
            setOpen(false);
          }}
        >
          {opt || ""}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <button
        ref={btnRef}
        onClick={(e) => {
          e.stopPropagation();
          toggle(e.currentTarget);
        }}
        className="flex flex-row  items-center w-full h-10.5 justify-between gap-4 px-4 rounded-md hover:bg-gray-50"
      >
        <span className="truncate">{value || ""}</span>
        <ChevronDown
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && createPortal(menu, document.body)}
    </>
  );
}
