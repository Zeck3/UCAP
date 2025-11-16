import React, { useEffect, useRef } from "react";
import type { HeaderNode } from "../types/headerConfigTypes";

const MaxScoreInput = React.memo(function MaxScoreInput({
  node,
  value,
  onChange,
  onBlur,
}: {
  node: HeaderNode;
  value: number | "";
  onChange: (v: number) => void;
  onBlur: (v: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const handleWheel = () => {
      if (document.activeElement === input) {
        input.blur();
      }
    };
    input.addEventListener("wheel", handleWheel, { passive: true });
    return () => input.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <input
      ref={inputRef}
      id={`max_score_input-${node.key}-${node.title}`}
      type="number"
      min={0}
      max={999}
      value={value === 0 ? "" : value}
      onChange={(e) => onChange(Number(e.target.value || 0))}
      onBlur={(e) => onBlur(Number(e.target.value || 0))}
      onKeyDown={(e) => {
        if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
      }}
      className="w-full h-full py-2.25 px-2 text-center bg-transparent border-none focus:outline-none text-coa-blue"
    />
  );
});

export default MaxScoreInput;
