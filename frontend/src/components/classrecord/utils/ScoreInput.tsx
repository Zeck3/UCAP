import React, { useCallback, useEffect, useRef } from "react";

interface ScoreInputProps {
  studentId: number;
  scoreKey: string;
  value: number;
  max: number;
  updateScoreProp: (studentId: number, key: string, value: number) => void;
  saveRawScore: (
    studentId: number,
    assessmentId: number,
    value: number | null
  ) => Promise<void>;
}

const ScoreInput = React.memo(function ScoreInput({
  studentId,
  scoreKey,
  value,
  max,
  updateScoreProp,
  saveRawScore,
}: ScoreInputProps) {
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

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      const newValue = val === "" ? 0 : Number(val);
      if (newValue <= max) updateScoreProp(studentId, scoreKey, newValue);
    },
    [studentId, scoreKey, max, updateScoreProp]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const val = e.target.value;
      const newValue = val === "" ? 0 : Number(val);
      if (newValue <= max) saveRawScore(studentId, Number(scoreKey), newValue);
    },
    [studentId, scoreKey, max, saveRawScore]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
      if (e.key === "Enter") (e.target as HTMLInputElement).blur();
    },
    []
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (!/^\d*$/.test(e.clipboardData.getData("text"))) e.preventDefault();
    },
    []
  );

  return (
    <input
      ref={inputRef}
      id={`score_input-${studentId}-${scoreKey}`}
      type="number"
      min={0}
      max={max}
      value={value === 0 ? "" : value}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      className="py-2.25 px-2 w-full h-full text-center bg-transparent border-none focus:outline-none"
    />
  );
});

export default ScoreInput;
