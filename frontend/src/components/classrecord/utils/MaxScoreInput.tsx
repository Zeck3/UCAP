import React, { useEffect, useRef } from "react";
import type { HeaderNode } from "../types/headerConfigTypes";

const MaxScoreInput = React.memo(function MaxScoreInput({ node, value, onChange, onBlur, setMaxScores, handleUpdateAssessment }: { node: HeaderNode; value: number | ""; onChange: (v: number) => void; onBlur: (v: number) => void; setMaxScores?: (updater: (prev: Record<string, number>) => Record<string, number>) => void; handleUpdateAssessment?: (assessmentId: number, updates: { assessment_highest_score: number }) => void }) {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const input = inputRef.current;
        if (!input) return;
        const handleWheel = () => { if (document.activeElement === input) input.blur() };
        input.addEventListener("wheel", handleWheel, { passive: true });
        return () => input.removeEventListener("wheel", handleWheel);
    }, []);

    const navigateInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
        e.preventDefault();
        const input = e.currentTarget;
        const th = input.closest("th");
        if (!th) return;
        let targetInput: HTMLInputElement | null = null;
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            const row = th.closest("tr");
            if (!row) return;
            const cells = Array.from(row.querySelectorAll("th"));
            const currentIndex = cells.indexOf(th as HTMLTableCellElement);
            const direction = e.key === "ArrowRight" ? 1 : -1;
            for (let i = currentIndex + direction; i >= 0 && i < cells.length; i += direction) {
                const cell = cells[i];
                const cellInput = cell.querySelector<HTMLInputElement>("input[type='number']");
                if (cellInput && !cellInput.disabled) { targetInput = cellInput; break }
            }
        } else if (e.key === "ArrowDown") {
            const row = th.closest("tr");
            if (!row) return;
            const table = row.closest("table");
            if (!table) return;
            const thead = table.querySelector("thead");
            if (!thead) return;
            const allHeaderRows = Array.from(thead.querySelectorAll("tr"));
            const currentRowIndex = allHeaderRows.indexOf(row as HTMLTableRowElement);
            const cells = Array.from(row.querySelectorAll("th"));
            const currentCellIndex = cells.indexOf(th as HTMLTableCellElement);
            if (currentRowIndex < allHeaderRows.length - 1) {
                for (let rowIdx = currentRowIndex + 1; rowIdx < allHeaderRows.length; rowIdx++) {
                    const targetRow = allHeaderRows[rowIdx];
                    const targetCells = Array.from(targetRow.querySelectorAll("th"));
                    if (currentCellIndex < targetCells.length) {
                        const targetCell = targetCells[currentCellIndex];
                        const cellInput = targetCell.querySelector<HTMLInputElement>("input[type='number']");
                        if (cellInput && !cellInput.disabled) { targetInput = cellInput; break }
                    }
                }
            }
            if (!targetInput) {
                const tbody = table.querySelector("tbody");
                if (tbody) {
                    const firstBodyRow = tbody.querySelector("tr");
                    if (firstBodyRow) {
                        const bodyCells = Array.from(firstBodyRow.querySelectorAll("td"));
                        if (currentCellIndex < bodyCells.length) {
                            const targetCell = bodyCells[currentCellIndex];
                            const cellInput = targetCell.querySelector<HTMLInputElement>("input[type='number'], input[type='text']");
                            if (cellInput && !cellInput.disabled) targetInput = cellInput;
                        }
                    }
                }
            }
        } else if (e.key === "ArrowUp") {
            const row = th.closest("tr");
            if (!row) return;
            const thead = row.closest("thead");
            if (!thead) return;
            const allHeaderRows = Array.from(thead.querySelectorAll("tr"));
            const currentRowIndex = allHeaderRows.indexOf(row as HTMLTableRowElement);
            const cells = Array.from(row.querySelectorAll("th"));
            const currentCellIndex = cells.indexOf(th as HTMLTableCellElement);
            for (let rowIdx = currentRowIndex - 1; rowIdx >= 0; rowIdx--) {
                const targetRow = allHeaderRows[rowIdx];
                const targetCells = Array.from(targetRow.querySelectorAll("th"));
                if (currentCellIndex < targetCells.length) {
                    const targetCell = targetCells[currentCellIndex];
                    const cellInput = targetCell.querySelector<HTMLInputElement>("input[type='number']");
                    if (cellInput && !cellInput.disabled) { targetInput = cellInput; break }
                }
            }
        }
        if (targetInput) { targetInput.focus(); targetInput.select() }
    };

    return <input ref={inputRef} id={`max_score_input-${node.key}-${node.title}`} type="number" min={0} max={999} value={value === 0 ? "" : value} onChange={e => onChange(Number(e.target.value || 0))} onBlur={e => onBlur(Number(e.target.value || 0))} onFocus={e => { const th = e.target.closest("th"); if (th?.classList.contains("cell-selected")) { e.target.blur(); return } e.target.select() }} onClick={e => { const th = e.currentTarget.closest("th"); if (th?.classList.contains("cell-selected") || e.shiftKey) { e.preventDefault(); e.currentTarget.blur(); return } e.currentTarget.select() }} onKeyDown={e => { if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault(); if (e.key === "Enter") e.currentTarget.blur(); navigateInput(e) }} draggable={false} onDragStart={e => e.preventDefault()} className="w-full h-full py-2.25 px-2 text-center bg-transparent border-none focus:outline-none text-coa-blue" />;
});

export default MaxScoreInput;