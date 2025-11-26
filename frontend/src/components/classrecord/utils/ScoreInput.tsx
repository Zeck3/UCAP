import React, { useCallback, useEffect, useRef } from "react";

interface ScoreInputProps {
    studentId: number;
    scoreKey: string;
    value: number;
    max: number;
    updateScoreProp: (studentId: number, key: string, value: number) => void;
    saveRawScore: (studentId: number, assessmentId: number, value: number | null) => Promise<void>;
}

const ScoreInput = React.memo(function ScoreInput({ studentId, scoreKey, value, max, updateScoreProp, saveRawScore }: ScoreInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const input = inputRef.current;
        if (!input) return;
        const handleWheel = () => { if (document.activeElement === input) input.blur() };
        input.addEventListener("wheel", handleWheel, { passive: true });
        return () => input.removeEventListener("wheel", handleWheel);
    }, []);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        const newValue = val === "" ? 0 : Number(val);
        if (newValue <= max) updateScoreProp(studentId, scoreKey, newValue);
    }, [studentId, scoreKey, max, updateScoreProp]);

    const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
        const val = e.target.value;
        const newValue = val === "" ? 0 : Number(val);
        if (newValue <= max) saveRawScore(studentId, Number(scoreKey), newValue);
    }, [studentId, scoreKey, max, saveRawScore]);

    const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
        const td = e.target.closest("td");
        if (td?.classList.contains("cell-selected")) { e.target.blur(); return }
        e.target.select();
    }, []);

    const handleClick = useCallback((e: React.MouseEvent<HTMLInputElement>) => {
        const td = e.currentTarget.closest("td");
        if (td?.classList.contains("cell-selected") || e.shiftKey) { e.preventDefault(); e.currentTarget.blur(); return }
        e.currentTarget.select();
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
            e.preventDefault();
            const input = e.currentTarget;
            const td = input.closest("td");
            if (!td) return;
            let targetInput: HTMLInputElement | null = null;
            if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                const row = td.closest("tr");
                if (!row) return;
                const cells = Array.from(row.querySelectorAll("td"));
                const currentIndex = cells.indexOf(td as HTMLTableCellElement);
                const direction = e.key === "ArrowRight" ? 1 : -1;
                for (let i = currentIndex + direction; i >= 0 && i < cells.length; i += direction) {
                    const cell = cells[i];
                    const cellInput = cell.querySelector<HTMLInputElement>("input[type='number'], input[type='text']");
                    if (cellInput && !cellInput.disabled) { targetInput = cellInput; break }
                }
            } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                const row = td.closest("tr");
                if (!row) return;
                const tbody = row.closest("tbody");
                if (!tbody) return;
                const rows = Array.from(tbody.querySelectorAll("tr"));
                const currentRowIndex = rows.indexOf(row as HTMLTableRowElement);
                const cells = Array.from(row.querySelectorAll("td"));
                const currentCellIndex = cells.indexOf(td as HTMLTableCellElement);
                const direction = e.key === "ArrowDown" ? 1 : -1;
                const targetRowIndex = currentRowIndex + direction;
                if (targetRowIndex >= 0 && targetRowIndex < rows.length) {
                    const targetRow = rows[targetRowIndex];
                    const targetCells = Array.from(targetRow.querySelectorAll("td"));
                    if (currentCellIndex < targetCells.length) {
                        const targetCell = targetCells[currentCellIndex];
                        const cellInput = targetCell.querySelector<HTMLInputElement>("input[type='number'], input[type='text']");
                        if (cellInput && !cellInput.disabled) targetInput = cellInput;
                    }
                } else if (e.key === "ArrowUp" && targetRowIndex < 0) {
                    const table = tbody.closest("table");
                    if (!table) return;
                    const thead = table.querySelector("thead");
                    if (!thead) return;
                    const headerRows = Array.from(thead.querySelectorAll("tr"));
                    for (let i = headerRows.length - 1; i >= 0; i--) {
                        const headerRow = headerRows[i];
                        const headerCells = Array.from(headerRow.querySelectorAll("th"));
                        if (currentCellIndex < headerCells.length) {
                            const targetCell = headerCells[currentCellIndex];
                            const cellInput = targetCell.querySelector<HTMLInputElement>("input[type='number']");
                            if (cellInput && !cellInput.disabled) { targetInput = cellInput; break }
                        }
                    }
                }
            }
            if (targetInput) { targetInput.focus(); targetInput.select() }
        }
    }, []);

    const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
        if (!/^\d*$/.test(e.clipboardData.getData("text"))) e.preventDefault();
    }, []);

    return <input ref={inputRef} id={`score_input-${studentId}-${scoreKey}`} type="number" min={0} max={max} value={value === 0 ? "" : value} onChange={handleChange} onBlur={handleBlur} onFocus={handleFocus} onClick={handleClick} onKeyDown={handleKeyDown} onPaste={handlePaste} draggable={false} onDragStart={e => e.preventDefault()} className="py-2.25 px-2 w-full h-full text-center bg-transparent border-none focus:outline-none" />;
});

export default ScoreInput;