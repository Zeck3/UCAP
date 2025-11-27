import React, { useState, useCallback, useRef, useEffect } from "react";
import { CellSelectionContext, type CellPosition, type SelectionRange } from "./CellSelectionContext";

export function CellSelectionProvider({ children }: { children: React.ReactNode }) {
    const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
    const [selectionRange, setSelectionRange] = useState<SelectionRange | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const bulkEditCallbackRef = useRef<((cellKeys: string[], value: number) => void) | null>(null);
    const lastClickedCellRef = useRef<CellPosition | null>(null);

    const setBulkEditCallback = useCallback((callback: (cellKeys: string[], value: number) => void) => {
        bulkEditCallbackRef.current = callback;
    }, []);

    const getCellsInRange = useCallback((start: CellPosition, end: CellPosition): Set<string> => {
        const cells = new Set<string>();
        if (start.type !== end.type) {
            cells.add(start.key);
            return cells;
        }
        const minRow = Math.min(start.row, end.row);
        const maxRow = Math.max(start.row, end.row);
        const minCol = Math.min(start.col, end.col);
        const maxCol = Math.max(start.col, end.col);
        if (start.type === "maxScore") {
            for (let col = minCol; col <= maxCol; col++) {
                cells.add(`maxScore-${col}`);
            }
        } else {
            for (let row = minRow; row <= maxRow; row++) {
                for (let col = minCol; col <= maxCol; col++) {
                    cells.add(`student-${row}-${col}`);
                }
            }
        }
        return cells;
    }, []);

    const startSelection = useCallback((cell: CellPosition, isShiftKey: boolean) => {
        if (isShiftKey && lastClickedCellRef.current && lastClickedCellRef.current.type === cell.type) {
            const range = { start: lastClickedCellRef.current, end: cell };
            setSelectionRange(range);
            setSelectedCells(getCellsInRange(lastClickedCellRef.current, cell));
        } else {
            setIsSelecting(true);
            setSelectionRange({ start: cell, end: cell });
            setSelectedCells(new Set([cell.key]));
            lastClickedCellRef.current = cell;
        }
    }, [getCellsInRange]);

    const updateSelection = useCallback((cell: CellPosition) => {
        if (!isSelecting || !selectionRange) return;
        const newRange = { ...selectionRange, end: cell };
        setSelectionRange(newRange);
        setSelectedCells(getCellsInRange(newRange.start, newRange.end));
    }, [isSelecting, selectionRange, getCellsInRange]);

    const endSelection = useCallback(() => { setIsSelecting(false) }, []);

    const clearSelection = useCallback(() => {
        setSelectedCells(new Set());
        setSelectionRange(null);
        setIsSelecting(false);
    }, []);

    const isCellSelected = useCallback((cellKey: string) => selectedCells.has(cellKey), [selectedCells]);

    const bulkEdit = useCallback((value: number) => {
        if (selectedCells.size > 0 && bulkEditCallbackRef.current) bulkEditCallbackRef.current(Array.from(selectedCells), value);
    }, [selectedCells]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest(".ucap-table")) clearSelection();
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [clearSelection]);

    return (<CellSelectionContext.Provider value={{ selectedCells, selectionRange, isSelecting, startSelection, updateSelection, endSelection, clearSelection, isCellSelected, bulkEdit, setBulkEditCallback }}>
        {children}
    </CellSelectionContext.Provider>);
}