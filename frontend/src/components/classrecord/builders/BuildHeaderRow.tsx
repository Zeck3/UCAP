import { useCallback, useMemo, useState, memo } from "react";
import type React from "react";
import type { JSX } from "react";
import type { HeaderNode } from "../types/headerConfigTypes";
import type { Assessment } from "../../../types/classRecordTypes";
import ChevronDown from "../../../assets/chevron-down-solid.svg?react";
import { countLeaves, getTotalLeafCount, getHeaderClass, getHeaderWidth, computeComputedContent, formatValue, getCalculatedBg } from "../utils/ClassRecordFunctions";
import { renderTitleLines } from "../utils/ClassRecordRenderers";
import MaxScoreInput from "../utils/MaxScoreInput";

interface BuildHeaderRowProps {
    nodes: HeaderNode[];
    originalMaxDepth: number;
    openAssessmentInfoContextMenu: (e: React.MouseEvent, assessmentId: number) => void;
    maxScores: Record<string, number>;
    setMaxScores: React.Dispatch<React.SetStateAction<Record<string, number>>>;
    computedMaxValues: Record<string, number>;
    handleEditStart: (node: HeaderNode, event: React.MouseEvent<HTMLElement>) => void;
    onRightClickNode?: (e: React.MouseEvent, node: HeaderNode) => void;
    handleUpdateAssessment: (assessmentId: number, updates: Partial<Assessment>) => Promise<void>;
    assessmentInfoContextMenu: { visible: boolean; x: number; y: number; assessmentId?: number };
    studentNameWidth: number;
    handleResize: (e: React.MouseEvent<HTMLTableCellElement, MouseEvent>) => void;
}

function BuildHeaderRow({ nodes, originalMaxDepth, openAssessmentInfoContextMenu, assessmentInfoContextMenu, maxScores, setMaxScores, computedMaxValues, handleEditStart, onRightClickNode, handleUpdateAssessment, studentNameWidth, handleResize }: BuildHeaderRowProps) {
    const [leafRowHeight, setLeafRowHeight] = useState(() => { const saved = localStorage.getItem("leafRowHeight"); return saved ? Number(saved) : 40 });
    const handleNodeClick = useCallback((node: HeaderNode) => (e: React.MouseEvent<HTMLElement>) => handleEditStart(node, e), [handleEditStart]);
    const handleNodeContextMenu = useCallback((node: HeaderNode) => (e: React.MouseEvent) => { e.preventDefault(); onRightClickNode?.(e, node) }, [onRightClickNode]);
    const handleHResizeStart = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        const startY = e.clientY;
        const startHeight = leafRowHeight;
        function onMouseMove(ev: MouseEvent) {
            const delta = ev.clientY - startY;
            const next = Math.max(40, startHeight + delta);
            setLeafRowHeight(next);
            localStorage.setItem("leafRowHeight", String(next));
        }
        function onMouseUp() {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        }
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    }, [leafRowHeight, setLeafRowHeight]);

    const staticRows = useMemo(() => {
        const newMaxDepth = originalMaxDepth + 1;
        const rows: JSX.Element[][] = Array.from({ length: newMaxDepth }, () => []);
        const hSeparators: JSX.Element[] = [];
        const buttonRow: JSX.Element[] = [];
        const totalLeafCount = getTotalLeafCount(nodes);

        function build(node: HeaderNode, level: number) {
            if (node.type === "v-separator") {
                rows[level].push(<th key={node.key || `vsep-${level}-${node.title}-${node.type}`} rowSpan={newMaxDepth - level} className="bg-ucap-blue border border-ucap-blue cursor-col-resize sticky-rowspan sticky-vsep" onMouseDown={handleResize} style={{ width: 16 }} />);
                return;
            }
            if (node.type === "spacer") {
                rows[level].push(<th key={node.key || `spacer-${level}-${node.title}`} rowSpan={newMaxDepth - level} className="bg-white border border-[#E9E6E6]" />);
                return;
            }
            if (node.type === "h-separator") {
                hSeparators.push(<th key={node.key || `hsep-rsize`} colSpan={totalLeafCount} className="bg-ucap-blue h-4 border border-ucap-blue p-0 cursor-row-resize" onMouseDown={handleHResizeStart} />);
                return;
            }
            const hasChildren = node.children.length > 0;
            const colSpan = node.colSpan || (hasChildren ? node.children.reduce((sum, child) => sum + countLeaves(child), 0) : 1);
            const rowSpan: number = node.customRowSpan ? node.customRowSpan : node.isRowSpan ? newMaxDepth - level : 1;
            const headerClass = getHeaderClass(node);
            const headerWidth = getHeaderWidth(node);
            const isLeafDeep = !hasChildren && level === originalMaxDepth - 1 && !node.computedGrades;
            rows[level].push(<th key={node.key || `${level}-${node.nodeType || node.type}-${node.title}-${rows[level].length}`} colSpan={colSpan} rowSpan={rowSpan} onClick={node.nodeType === "assessment" ? handleNodeClick(node) : undefined} tabIndex={node.nodeType === "assessment" ? 0 : undefined} style={{ height: level === 3 ? leafRowHeight : "auto", maxHeight: level === 3 ? leafRowHeight : "none", minHeight: 112 }} className={`border border-[#E9E6E6] p-2 text-center ${headerClass} ${isLeafDeep ? `[writing-mode:vertical-rl] rotate-180 text-left truncate overflow-hidden text-ellipsis select-none w-15 max-w-15` : `whitespace-normal ${headerWidth} w-15`} ${node.isRowSpan ? "sticky-col sticky-col-1 sticky-rowspan" : ""} ${node.nodeType === "assessment" || node.calculationType === "assignment" ? "assessment-col" : ""}`} onContextMenu={node.nodeType === "assessment" || node.nodeType === "component" ? handleNodeContextMenu(node) : undefined}>{node.title?.trim() ? renderTitleLines(node.title) : ""}</th>);
            if (hasChildren) node.children.forEach(child => build(child, level + rowSpan));
        }

        function addButtons(node: HeaderNode) {
            if (["v-separator", "spacer", "h-separator"].includes(node.type || "")) return;
            if (node.isRowSpan || node.customRowSpan || node.calculationType === "computed") {
                if (node.children.length > 0) node.children.forEach(addButtons);
                return;
            }
            if (node.children.length > 0) {
                node.children.forEach(addButtons);
                return;
            }
            if (node.needsButton) {
                buttonRow.push(<th key={`button-${node.key || node.title}`} className={`border border-[#E9E6E6] p-0 text-center ${node.calculationType ? "w-15" : ""}`}><button onClick={e => openAssessmentInfoContextMenu(e, Number(node.key))} className="flex items-center justify-center w-full h-full py-1.5 px-2 hover:bg-gray-100" data-assessment-info-toggle={node.key}><ChevronDown className={`h-3 w-3 transition-transform ${assessmentInfoContextMenu.visible && assessmentInfoContextMenu.assessmentId === Number(node.key) ? "rotate-180" : ""}`} /></button></th>);
            } else {
                const bgClass = node.calculationType === "roundedGrade" ? "bg-ucap-yellow" : "";
                buttonRow.push(<th key={`empty-${node.key || node.title}`} className={`border border-[#E9E6E6] p-2 text-center ${bgClass} ${node.calculationType ? "w-15" : ""}`} />);
            }
        }

        nodes.forEach(node => build(node, 0));
        nodes.forEach(node => addButtons(node));
        if (buttonRow.length > 0) rows[originalMaxDepth] = buttonRow;
        const allRows = [...rows];
        if (hSeparators.length > 0) allRows.push(hSeparators);
        return allRows;
    }, [nodes, originalMaxDepth, leafRowHeight, handleHResizeStart, openAssessmentInfoContextMenu, assessmentInfoContextMenu, handleNodeClick, handleNodeContextMenu, handleResize]);

    const subRow = useMemo(() => {
        const sub: JSX.Element[] = [];

        function buildSubRow(node: HeaderNode) {
            if (node.type === "v-separator") {
                sub.push(<th key={node.key || `vsep-${node.title}-${node.type}`} className="bg-ucap-blue border border-ucap-blue cursor-col-resize sticky-rowspan sticky-vsep" onMouseDown={handleResize} style={{ width: 16 }} />);
                return;
            }
            if (node.type === "spacer") {
                sub.push(<th key={`spacer-${node.key || node.title}`} className="bg-white w-20 border border-[#E9E6E6]" />);
                return;
            }
            if (node.type === "h-separator") return;
            if (node.isRowSpan) {
                sub.push(<th key="sub-no-col" className="border border-[#E9E6E6] border-b-2 p-2 w-12 text-left font-bold sticky-col sticky-col-1">No.</th>);
                sub.push(<th key="sub-id-col" className="border border-[#E9E6E6] border-b-2 p-2 w-32 text-left font-bold sticky-col sticky-col-2">Student ID</th>);
                sub.push(<th key="sub-name-col" style={{ width: studentNameWidth }} className="border border-[#E9E6E6] border-b-2 p-2 text-left font-bold sticky-col sticky-col-3">Name</th>);
                return;
            }
            if (node.children.length > 0) {
                node.children.forEach(buildSubRow);
                return;
            }
            let content: JSX.Element | string = "";
            let bgClass = getCalculatedBg(node.calculationType);
            let textClass = "";
            if (node.calculationType === "assignment" && node.key) {
                const key = node.key as string;
                const val = maxScores[key] ?? 0;
                content = <MaxScoreInput node={node} value={val} onChange={num => setMaxScores(prev => ({ ...prev, [key]: num }))} onBlur={num => handleUpdateAssessment(Number(key), { assessment_highest_score: Math.min(num, 999) })} setMaxScores={setMaxScores} handleUpdateAssessment={handleUpdateAssessment} />;
            } else if (node.key && computedMaxValues[node.key] !== undefined) {
                content = formatValue(computedMaxValues?.[node.key], node.calculationType);
                textClass = "text-coa-blue";
            } else if (node.calculationType === "computed" && node.key) {
                const mid = computedMaxValues["midterm-total-grade"] || 0;
                const fin = computedMaxValues["final-total-grade"] || 0;
                if (mid === 0 && fin === 0) {
                    content = "";
                    bgClass = "";
                    textClass = "";
                } else {
                    const { content: compContent, type } = computeComputedContent(mid, fin, node.key);
                    content = compContent;
                    bgClass = getCalculatedBg(type);
                    textClass = "text-coa-blue";
                }
            }
            sub.push(<th key={`sub-${node.key}`} className={`border border-[#E9E6E6] border-b-2 text-center ${bgClass} ${textClass} ${node.calculationType ? "w-15" : ""} ${node.nodeType === "assessment" || node.calculationType === "assignment" ? "assessment-col" : ""}`} onMouseDown={e => { if (node.calculationType === "assignment" && e.button === 0) { const th = e.currentTarget; if (e.shiftKey) { e.preventDefault(); if (th.classList.contains("cell-selected")) { th.classList.remove("cell-selected") } else { th.classList.add("cell-selected") }; if (document.activeElement instanceof HTMLInputElement) document.activeElement.blur() } else { const thead = th.closest("thead"); if (thead) thead.querySelectorAll(".cell-selected").forEach(cell => cell.classList.remove("cell-selected")) } } }} onMouseUp={e => { if (node.calculationType === "assignment") { const thead = e.currentTarget.closest("thead"); if (thead) thead.querySelectorAll("th[data-selecting]").forEach(th => th.removeAttribute("data-selecting")) } }}>{content}</th>);
        }

        nodes.forEach(buildSubRow);
        return sub;
    }, [nodes, maxScores, setMaxScores, computedMaxValues, handleUpdateAssessment, studentNameWidth, handleResize]);

    const rowsToRender = useMemo(() => [...staticRows, subRow], [staticRows, subRow]);

    return (<>
        {rowsToRender.filter(row => row.length > 0).map((row, i) => (
            <tr key={`header-row-${i}`} className={`header-row header-row-${i} ${i < 5 ? "sticky-header" : ""}`}>{row}</tr>
        ))}
    </>);
}

export default memo(BuildHeaderRow);