import { useContext } from "react";
import { CellSelectionContext } from "./CellSelectionContext";

export function useCellSelection() {
    const context = useContext(CellSelectionContext);
    if (!context) throw new Error("useCellSelection must be used within CellSelectionProvider");
    return context;
}