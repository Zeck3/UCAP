import { useEffect, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import ClassRecordLoading from "../../pages/ClassRecordLoading";
import ClassRecordError from "../../pages/ClassRecordError";
import BuildHeaderRow from "./builders/BuildHeaderRow";
import BuildStudentRow from "./builders/BuildStudentRow";
import EditAssessmentTitlePopup from "./context/EditAssessmentTitlePopup";
import ContextMenu from "./context/SettingsPopup";
import AssessmentInfoPopup from "./context/AssessmentInfoPopup";
import { useClassRecord } from "./utils/useClassRecord";
import { getMaxDepth } from "./utils/ClassRecordFunctions";
import "../../styles.css";
import type { HeaderNode } from "./types/headerConfigTypes";
import type { Student } from "../../types/classRecordTypes";

interface Props {
    onInitialized?: () => void;
    onProvideFetchStudents?: (fn: () => Promise<void>) => void;
    onCanGenerateResultSheetChange?: (can: boolean) => void;
    onExistingStudentsChange?: (hasExisting: boolean) => void;
    onProvideExportData?: (fn: () => { headerNodes: HeaderNode[]; students: Student[]; studentScores: Record<number, Record<string, number>>; maxScores: Record<string, number>; computedValues: Record<number, Record<string, number>> }) => void;
}

export default function ClassRecordComponent({ onInitialized, onProvideFetchStudents, onCanGenerateResultSheetChange, onExistingStudentsChange, onProvideExportData }: Props) {
    const { fetchData, headerNodes, maxScores, setMaxScores, studentScores, computedStudentValues, sortedStudentsData, computedMaxValues, bloomsOptions, outcomesOptions, currentAssessmentBlooms, currentAssessmentOutcomes, canGenerateResultSheet, studentContextMenu, assessmentContextMenu, componentContextMenu, assessmentInfoContextMenu, editingAssessment, setEditingAssessment, studentNameWidth, handleEditAssessmentTitle, handleUpdateAssessmentTitle, handleEditAssessmentTitleCancel, handleOpenAssessmentInfo, handleCloseAssessmentInfo, handleCloseMenus, handleRightClickNode, handleRightClickRow, handleUpdateAssessment, handleUpdateStudent, handleStudentInputChange, handleScoreChange, updateStudentScore, handleAddStudent, handleDeleteStudent, handleAddAssessment, handleDeleteAssessment, handleVSeparatorMouseDown, loading, initialized, error } = useClassRecord();
    const tableRef = useRef<HTMLTableElement | null>(null);
    const bulkEditValueRef = useRef<string>("");
    const originalMaxDepth = useMemo(() => Math.max(...headerNodes.map(getMaxDepth)), [headerNodes]);

    useEffect(() => {
        const table = tableRef.current;
        if (!table) return;
        const thead = table.querySelector("thead");
        if (!thead) return;
        const setHeaderOffsets = () => {
            const rows = Array.from(thead.querySelectorAll("tr"));
            let cum = 0;
            for (let i = 0; i < rows.length; i++) {
                const r = rows[i] as HTMLTableRowElement | undefined;
                const h = r ? Math.ceil(r.getBoundingClientRect().height) : 0;
                table.style.setProperty(`--ucap-header-top-${i}`, `${cum}px`);
                cum += h;
            }
            const col1 = table.querySelector("thead th.sticky-col-1") as HTMLTableCellElement | null;
            if (col1) {
                const w1 = Math.ceil(col1.getBoundingClientRect().width);
                table.style.setProperty("--ucap-sticky-left-boundary", `${w1}px`);
            }
        };
        let frameId: number | null = null;
        const schedule = () => {
            if (frameId != null) return;
            frameId = requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    frameId = null;
                    setHeaderOffsets();
                });
            });
        };
        schedule();
        window.addEventListener("resize", schedule);
        const mo = new MutationObserver(() => { schedule() });
        mo.observe(thead, { childList: true, subtree: true, attributes: true });
        return () => {
            window.removeEventListener("resize", schedule);
            mo.disconnect();
            if (frameId != null) cancelAnimationFrame(frameId);
        };
    }, [headerNodes, studentNameWidth]);

    useEffect(() => { onProvideFetchStudents?.(fetchData) }, [fetchData, onProvideFetchStudents]);

    const getExportData = useCallback(() => ({ headerNodes, students: sortedStudentsData.map(s => s.student), studentScores, maxScores, computedValues: computedStudentValues }), [headerNodes, sortedStudentsData, studentScores, maxScores, computedStudentValues]);

    useEffect(() => { if (onProvideExportData) onProvideExportData(getExportData) }, [getExportData, onProvideExportData]);

    useEffect(() => { if (onCanGenerateResultSheetChange) onCanGenerateResultSheetChange(canGenerateResultSheet) }, [canGenerateResultSheet, onCanGenerateResultSheetChange]);

    useEffect(() => { if (initialized) onInitialized?.() }, [initialized, onInitialized]);

    useEffect(() => {
        if (!onExistingStudentsChange) return;
        const hasExisting = sortedStudentsData.some(({ student }) => {
            const hasId = student.id_number !== null && student.id_number !== undefined;
            const hasName = (student.student_name ?? "").trim().length > 0;
            return hasId || hasName;
        });
        onExistingStudentsChange(hasExisting);
    }, [sortedStudentsData, onExistingStudentsChange]);

    useEffect(() => {
        const clearSelection = () => {
            const table = tableRef.current;
            if (!table) return;
            table.querySelectorAll(".cell-selected").forEach(cell => cell.classList.remove("cell-selected"));
        };
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest(".ucap-table")) clearSelection();
        };
        const handleKeyDown = (e: KeyboardEvent) => {
            const table = tableRef.current;
            if (!table) return;
            const selectedCells = table.querySelectorAll(".cell-selected");
            const activeElement = document.activeElement;
            const isFocusedInInput = activeElement && activeElement.tagName === "INPUT";
            if (e.key === "Escape") {
                clearSelection();
                bulkEditValueRef.current = "";
                return;
            }
            if (selectedCells.length > 0 && !isFocusedInInput) {
                if (/^[0-9]$/.test(e.key)) {
                    e.preventDefault();
                    bulkEditValueRef.current += e.key;
                    selectedCells.forEach(cell => {
                        const input = cell.querySelector("input");
                        if (input instanceof HTMLInputElement) input.value = bulkEditValueRef.current;
                    });
                } else if (e.key === "Backspace") {
                    e.preventDefault();
                    bulkEditValueRef.current = bulkEditValueRef.current.slice(0, -1);
                    selectedCells.forEach(cell => {
                        const input = cell.querySelector("input");
                        if (input instanceof HTMLInputElement) input.value = bulkEditValueRef.current;
                    });
                } else if (e.key === "Enter") {
                    e.preventDefault();
                    if (bulkEditValueRef.current === "") return;
                    const value = Number(bulkEditValueRef.current);
                    const firstCell = selectedCells[0];
                    const tbody = firstCell?.closest("tbody");
                    const thead = firstCell?.closest("thead");
                    if (tbody) {
                        selectedCells.forEach(cell => {
                            const input = cell.querySelector("input");
                            if (input instanceof HTMLInputElement) {
                                const idParts = input.id.split("-");
                                if (idParts.length >= 3) {
                                    const studentId = parseInt(idParts[1]);
                                    const scoreKey = idParts[2];
                                    const maxAttr = input.getAttribute("max");
                                    const max = maxAttr ? Number(maxAttr) : 999;
                                    if (!isNaN(studentId) && !isNaN(Number(scoreKey)) && value <= max) {
                                        updateStudentScore(studentId, scoreKey, value);
                                        handleScoreChange(studentId, Number(scoreKey), value);
                                    }
                                }
                            }
                        });
                    } else if (thead) {
                        const updates: Record<string, number> = {};
                        selectedCells.forEach(cell => {
                            const input = cell.querySelector("input");
                            if (input instanceof HTMLInputElement) {
                                const idParts = input.id.split("-");
                                if (idParts.length >= 2) {
                                    const assessmentKey = idParts[1];
                                    if (value >= 0 && value <= 999 && !isNaN(Number(assessmentKey))) {
                                        updates[assessmentKey] = value;
                                        handleUpdateAssessment(Number(assessmentKey), { assessment_highest_score: Math.min(value, 999) });
                                    }
                                }
                            }
                        });
                        if (Object.keys(updates).length > 0) setMaxScores(prev => ({ ...prev, ...updates }));
                    }
                    clearSelection();
                    bulkEditValueRef.current = "";
                }
            }
        };
        const handleMouseDown = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if ((target.closest("td") || target.closest("th")) && !target.closest(".assessment-col")) {
                clearSelection();
                bulkEditValueRef.current = "";
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown, true);
        if (tableRef.current) tableRef.current.addEventListener("mousedown", handleMouseDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown, true);
            if (tableRef.current) tableRef.current.removeEventListener("mousedown", handleMouseDown);
        };
    }, [handleScoreChange, updateStudentScore, handleUpdateAssessment, setMaxScores]);

    if (!initialized || loading) return <ClassRecordLoading />;
    if (error) return <ClassRecordError description={error} />;
    if (headerNodes.length === 0 || sortedStudentsData.length === 0) return <ClassRecordError description="No data for this class record." />;

    const overlayVisible = !!editingAssessment || studentContextMenu.visible || assessmentContextMenu.visible || componentContextMenu.visible || (assessmentInfoContextMenu.visible && !!assessmentInfoContextMenu.assessmentId);

    return (<>
        <table ref={tableRef} className="table-fixed border-collapse mb-15 border-0 min-w-max -ml-px -mt-px ucap-table">
            <thead>
                <BuildHeaderRow nodes={headerNodes} originalMaxDepth={originalMaxDepth} openAssessmentInfoContextMenu={handleOpenAssessmentInfo} assessmentInfoContextMenu={assessmentInfoContextMenu} maxScores={maxScores} setMaxScores={setMaxScores} computedMaxValues={computedMaxValues} handleEditStart={handleEditAssessmentTitle} onRightClickNode={handleRightClickNode} handleUpdateAssessment={handleUpdateAssessment} studentNameWidth={studentNameWidth} handleResize={handleVSeparatorMouseDown} />
            </thead>
            <tbody>
                {sortedStudentsData.map(({ student, score }, i) => (
                    <BuildStudentRow key={student.student_id} student={student} index={i} nodes={headerNodes} studentScore={score} maxScores={maxScores} remarks={student.remarks ?? ""} updateRemark={newRemark => handleUpdateStudent(student.student_id, { remarks: newRemark })} handleInputChange={handleStudentInputChange} saveRawScore={handleScoreChange} updateScoreProp={updateStudentScore} onRightClickRow={handleRightClickRow} handleUpdateStudent={handleUpdateStudent} studentNameWidth={studentNameWidth} handleResize={handleVSeparatorMouseDown} />
                ))}
            </tbody>
        </table>
        {overlayVisible && createPortal(<div className="cr-overlay-layer">
            {editingAssessment && <EditAssessmentTitlePopup editingAssessment={editingAssessment} setEditingAssessment={setEditingAssessment} handleEditSave={handleUpdateAssessmentTitle} handleEditCancel={handleEditAssessmentTitleCancel} />}
            {assessmentInfoContextMenu.visible && assessmentInfoContextMenu.assessmentId && <AssessmentInfoPopup x={assessmentInfoContextMenu.x} y={assessmentInfoContextMenu.y} onClose={handleCloseAssessmentInfo} assessmentId={assessmentInfoContextMenu.assessmentId} bloomsOptions={bloomsOptions} outcomesOptions={outcomesOptions} initialBlooms={currentAssessmentBlooms} initialOutcomes={currentAssessmentOutcomes} handleUpdateAssessment={handleUpdateAssessment} />}
            {studentContextMenu.visible && <ContextMenu visible={studentContextMenu.visible} x={studentContextMenu.x} y={studentContextMenu.y} onAdd={handleAddStudent} onDelete={() => handleDeleteStudent(studentContextMenu.studentId!)} addLabel="Add Student" deleteLabel="Delete Student" onClose={handleCloseMenus} />}
            {assessmentContextMenu.visible && <ContextMenu visible={assessmentContextMenu.visible} x={assessmentContextMenu.x} y={assessmentContextMenu.y} addLabel="Add Assessment" deleteLabel="Delete Assessment" onAdd={handleAddAssessment} onDelete={() => handleDeleteAssessment(assessmentContextMenu.assessmentId!)} onClose={handleCloseMenus} />}
            {componentContextMenu.visible && <ContextMenu visible={componentContextMenu.visible} x={componentContextMenu.x} y={componentContextMenu.y} onAdd={handleAddAssessment} addLabel="Add Assessment" onClose={handleCloseMenus} />}
        </div>, document.body)}
    </>);
}