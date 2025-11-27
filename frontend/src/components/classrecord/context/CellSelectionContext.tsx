import { createContext } from "react";

export interface CellPosition {
    row: number;
    col: number;
    type: "student" | "maxScore";
    key: string;
}

export interface SelectionRange {
    start: CellPosition;
    end: CellPosition;
}

interface CellSelectionContextType {
    selectedCells: Set<string>;
    selectionRange: SelectionRange | null;
    isSelecting: boolean;
    startSelection: (cell: CellPosition, isShiftKey: boolean) => void;
    updateSelection: (cell: CellPosition) => void;
    endSelection: () => void;
    clearSelection: () => void;
    isCellSelected: (cellKey: string) => boolean;
    bulkEdit: (value: number) => void;
    setBulkEditCallback: (callback: (cellKeys: string[], value: number) => void) => void;
}

export const CellSelectionContext = createContext<CellSelectionContextType | undefined>(undefined);