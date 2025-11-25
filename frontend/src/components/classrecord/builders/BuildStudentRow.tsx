import { useCallback, useEffect, useMemo, useState, memo, useRef } from "react";
import type React from "react";
import type { JSX } from "react";
import type { HeaderNode } from "../types/headerConfigTypes";
import type { Student } from "../../../types/classRecordTypes";
import { formatValue, getCalculatedBg, getDesc, getTextClass, computeValues } from "../utils/ClassRecordFunctions";
import ScoreInput from "../utils/ScoreInput";
import RemarksDropdown from "../context/RemarksDropdown";

const GRADE_SCALE = [1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 3.25, 3.5, 3.75, 4.0, 4.25, 4.5, 4.75, 5.0];

function shallowEqualNumberRecord(a: Record<string, number | null | undefined>, b: Record<string, number | null | undefined>): boolean {
    if (a === b) return true;
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    for (const k of aKeys) { if (a[k] !== b[k]) return false }
    return true;
}

function useStableNumberRecord<T extends Record<string, number | null | undefined>>(record: T): T {
    const ref = useRef<T>(record);
    if (!shallowEqualNumberRecord(ref.current, record)) ref.current = record;
    return ref.current;
}

interface BuildStudentRowProps {
    student: Student;
    index: number;
    nodes: HeaderNode[];
    studentScore: Record<string, number>;
    maxScores: Record<string, number>;
    remarks: string;
    updateRemark: (newRemark: string) => void;
    handleInputChange: (index: number, field: keyof Student, value: string) => void;
    updateScoreProp: (index: number, key: string, value: number) => void;
    onRightClickRow?: (e: React.MouseEvent, studentId: number) => void;
    handleUpdateStudent: (studentId: number, updates: Partial<Student>) => void;
    saveRawScore: (studentId: number, assessmentId: number, value: number | null) => Promise<void>;
    studentNameWidth: number;
    handleResize: (e: React.MouseEvent<HTMLTableCellElement, MouseEvent>) => void;
}

function BuildStudentRow({ student, index, nodes, studentScore, updateScoreProp, maxScores, onRightClickRow, handleUpdateStudent, saveRawScore, studentNameWidth, handleResize }: BuildStudentRowProps) {
    const [localStudent, setLocalStudent] = useState(student);
    const stableStudentScore = useStableNumberRecord(studentScore);
    const stableMaxScores = useStableNumberRecord(maxScores);

    useEffect(() => { setLocalStudent(student) }, [student]);

    const handleFieldChange = useCallback((field: keyof Student, value: Student[keyof Student]) => {
        setLocalStudent(prev => ({ ...prev, [field]: value }))
    }, []);

    const handleFieldBlur = useCallback((field: keyof Student) => {
        if (localStudent[field] !== student[field]) handleUpdateStudent(student.student_id, { [field]: localStudent[field] })
    }, [localStudent, student, handleUpdateStudent]);

    const computedValues = useMemo(() => {
        const base: Record<string, number> = {};
        for (const [k, v] of Object.entries(stableStudentScore)) { base[k] = typeof v === "number" ? v : 0 }
        return computeValues(base, stableMaxScores, nodes);
    }, [stableStudentScore, stableMaxScores, nodes]);

    const computeComputedContent = useCallback((mid: number | "" | null, fin: number | "" | null, key: string): { content: string | JSX.Element; textClass: string; bgClass: string } => {
        let raw = 0;
        let rounded = 0;
        let cont: string | JSX.Element = "";
        let textClass = "";
        let bgClass = "";
        const midNum = typeof mid === "number" ? mid : null;
        const finNum = typeof fin === "number" ? fin : null;
        if (midNum !== null && finNum !== null) {
            if (key.includes("half")) raw = midNum * 0.5 + finNum * 0.5;
            else if (key.includes("third")) raw = midNum * (1 / 3) + finNum * (2 / 3);
            if (key.endsWith("weighted")) {
                cont = formatValue(raw, "computedWeighted");
                textClass = getTextClass(raw, "computedWeighted");
                bgClass = getCalculatedBg("computedWeighted");
            } else if (key.includes("for-removal") || key.includes("after-removal")) {
                raw = Number(raw.toFixed(2));
                rounded = GRADE_SCALE.reduce((prev, curr) => Math.abs(curr - raw) < Math.abs(prev - raw) ? curr : Math.abs(curr - raw) === Math.abs(prev - raw) ? Math.max(curr, prev) : prev, GRADE_SCALE[0]);
                cont = formatValue(rounded, "computedRounded");
                textClass = getTextClass(rounded, "computedRounded");
                bgClass = getCalculatedBg("computedRounded");
            } else if (key.endsWith("desc")) {
                raw = Number(raw.toFixed(2));
                rounded = GRADE_SCALE.reduce((prev, curr) => Math.abs(curr - raw) < Math.abs(prev - raw) ? curr : Math.abs(curr - raw) === Math.abs(prev - raw) ? Math.max(curr, prev) : prev, GRADE_SCALE[0]);
                cont = getDesc(rounded);
                textClass = rounded > 3.0 ? "text-coa-red" : "text-coa-blue";
            }
        }
        if (key.endsWith("remarks")) {
            cont = <RemarksDropdown value={localStudent.remarks ?? ""} onChange={val => { handleFieldChange("remarks", val); handleUpdateStudent(student.student_id, { remarks: val }) }} />;
        }
        return { content: cont, textClass, bgClass };
    }, [student.student_id, localStudent.remarks, handleFieldChange, handleUpdateStudent]);

    const navigateInput = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
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
    }, []);

    const buildRowCells = useCallback((nodes: HeaderNode[]): JSX.Element[] => {
        return nodes.flatMap(node => {
            const baseKey = `${node.key ?? node.title}-${node.calculationType}-${node.type}`;
            if (node.type === "v-separator") return <td key={`${baseKey}-vsep`} className="bg-ucap-blue border border-ucap-blue cursor-col-resize sticky-vsep" onMouseDown={handleResize} style={{ width: 16 }} />;
            if (node.type === "spacer") return <td key={`${baseKey}-spacer`} className="bg-white w-20 border border-[#E9E6E6]" />;
            if (node.type === "h-separator") return [];
            if (node.children.length > 0) return buildRowCells(node.children);
            if (node.isRowSpan) {
                return [
                    <td key={`no-${baseKey}`} className="border border-[#E9E6E6] p-2 w-12 text-left sticky-col sticky-col-1" onContextMenu={e => onRightClickRow?.(e, student.student_id)}>{index + 1}</td>,
                    <td key={`id-${baseKey}`} className="border border-[#E9E6E6] w-32 text-left sticky-col sticky-col-2" onContextMenu={e => onRightClickRow?.(e, student.student_id)}>
                        <input id={`student_id_number-${student.student_id}`} name={`student_id_number-${student.student_id}`} type="number" value={localStudent.id_number ?? ""} onChange={e => { const val = e.target.value; if (/^\d{0,10}$/.test(val)) handleFieldChange("id_number", val === "" ? null : Number(val)) }} onBlur={() => handleFieldBlur("id_number")} onKeyDown={e => { if (e.key === "Enter") { handleFieldBlur("id_number"); e.currentTarget.blur() } navigateInput(e) }} className="py-2.25 px-2 w-full h-full border-none outline-none bg-transparent" />
                    </td>,
                    <td key={`name-${baseKey}`} className="border border-[#E9E6E6] text-left sticky-col sticky-col-3" style={{ width: studentNameWidth }} onContextMenu={e => onRightClickRow?.(e, student.student_id)}>
                        <input id={`student_name-${student.student_id}`} name={`student_name-${student.student_id}`} type="text" value={localStudent.student_name ?? ""} onChange={e => handleFieldChange("student_name", e.target.value)} onBlur={() => handleFieldBlur("student_name")} onKeyDown={e => { if (e.key === "Enter") { handleFieldBlur("student_name"); e.currentTarget.blur() } navigateInput(e) }} className="w-full bg-transparent border-none outline-none px-2 py-2.25 truncate" />
                    </td>
                ];
            }
            let content: JSX.Element | string = "";
            let textClass = "";
            let bgClass = getCalculatedBg(node.calculationType);
            if (node.calculationType === "assignment" && node.key) {
                const scoreKey = node.key;
                const value = stableStudentScore[scoreKey] ?? 0;
                const max = stableMaxScores?.[node.key] ?? 0;
                content = <ScoreInput studentId={student.student_id} scoreKey={scoreKey} value={value ?? 0} max={max} updateScoreProp={updateScoreProp} saveRawScore={saveRawScore} />;
            } else if (node.calculationType === "computed" && node.key) {
                const mid = computedValues["midterm-total-grade"] ?? 0;
                const fin = computedValues["final-total-grade"] ?? 0;
                const { content: c, textClass: t, bgClass: b } = computeComputedContent(mid, fin, node.key);
                content = c;
                textClass = t;
                bgClass = b;
            } else if (node.key && computedValues[node.key] !== undefined) {
                const value = computedValues[node.key] ?? 0;
                content = formatValue(value, node.calculationType);
                textClass = getTextClass(value, node.calculationType);
            }
            return <td key={baseKey} className={`border border-[#E9E6E6] text-center ${bgClass} ${textClass} ${node.calculationType === "assignment" ? "assessment-col" : ""}`} onMouseDown={e => { if (node.calculationType === "assignment" && e.button === 0) { const td = e.currentTarget; if (e.shiftKey) { e.preventDefault(); td.classList.add("cell-selected"); if (document.activeElement instanceof HTMLInputElement) document.activeElement.blur() } else { const tbody = td.closest("tbody"); if (tbody) tbody.querySelectorAll(".cell-selected").forEach(cell => cell.classList.remove("cell-selected")) } } }}>{content}</td>;
        });
    }, [student, index, handleFieldBlur, handleFieldChange, onRightClickRow, localStudent.id_number, localStudent.student_name, computeComputedContent, updateScoreProp, saveRawScore, stableStudentScore, stableMaxScores, studentNameWidth, handleResize, computedValues, navigateInput]);

    const rowCells = useMemo(() => buildRowCells(nodes), [nodes, buildRowCells]);

    return <tr key={student.student_id} className="select-none">{rowCells}</tr>;
}

export default memo(BuildStudentRow, (prev, next) => {
    return prev.student.student_id === next.student.student_id && prev.student.student_name === next.student.student_name && prev.student.id_number === next.student.id_number && prev.index === next.index && shallowEqualNumberRecord(prev.studentScore, next.studentScore) && shallowEqualNumberRecord(prev.maxScores, next.maxScores) && prev.studentNameWidth === next.studentNameWidth && prev.nodes === next.nodes;
});