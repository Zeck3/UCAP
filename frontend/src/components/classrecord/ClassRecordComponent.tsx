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

interface Props {
  onInitialized?: () => void;
  onProvideFetchStudents?: (fn: () => Promise<void>) => void;
  onCanGenerateResultSheetChange?: (can: boolean) => void;
  onExistingStudentsChange?: (hasExisting: boolean) => void;
  onProvideExportData?: (fn: () => {
    headerNodes: any[];
    students: any[];
    studentScores: Record<number, Record<string, number>>;
    maxScores: Record<string, number>;
    computedValues: Record<number, Record<string, number>>;
  }) => void;
}

export default function ClassRecordComponent({
  onInitialized,
  onProvideFetchStudents,
  onCanGenerateResultSheetChange,
  onExistingStudentsChange,
  onProvideExportData,
}: Props) {
  const {
    fetchData,
    headerNodes,
    maxScores,
    setMaxScores,
    studentScores,
    computedStudentValues,
    sortedStudentsData,
    computedMaxValues,
    bloomsOptions,
    outcomesOptions,
    currentAssessmentBlooms,
    currentAssessmentOutcomes,
    canGenerateResultSheet,
    studentContextMenu,
    assessmentContextMenu,
    componentContextMenu,
    assessmentInfoContextMenu,
    editingAssessment,
    setEditingAssessment,
    studentNameWidth,
    handleEditAssessmentTitle,
    handleUpdateAssessmentTitle,
    handleEditAssessmentTitleCancel,
    handleOpenAssessmentInfo,
    handleCloseAssessmentInfo,
    handleCloseMenus,
    handleRightClickNode,
    handleRightClickRow,
    handleUpdateAssessment,
    handleUpdateStudent,
    handleStudentInputChange,
    handleScoreChange,
    updateStudentScore,
    handleAddStudent,
    handleDeleteStudent,
    handleAddAssessment,
    handleDeleteAssessment,
    handleVSeparatorMouseDown,
    loading,
    initialized,
    error,
  } = useClassRecord();

  const tableRef = useRef<HTMLTableElement | null>(null);
  const originalMaxDepth = useMemo(
    () => Math.max(...headerNodes.map(getMaxDepth)),
    [headerNodes]
  );

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

      const col1 = table.querySelector(
        "thead th.sticky-col-1"
      ) as HTMLTableCellElement | null;

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

    const mo = new MutationObserver(() => {
      schedule();
    });

    mo.observe(thead, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    return () => {
      window.removeEventListener("resize", schedule);
      mo.disconnect();
      if (frameId != null) cancelAnimationFrame(frameId);
    };
  }, [headerNodes, studentNameWidth]);

  useEffect(() => {
    onProvideFetchStudents?.(fetchData);
  }, [fetchData, onProvideFetchStudents]);

  const getExportData = useCallback(() => ({
    headerNodes,
    students: sortedStudentsData.map(s => s.student),
    studentScores,
    maxScores,
    computedValues: computedStudentValues,
  }), [headerNodes, sortedStudentsData, studentScores, maxScores, computedStudentValues]);

  useEffect(() => {
    if (onProvideExportData) {
      onProvideExportData(getExportData);
    }
  }, [getExportData, onProvideExportData]);

  useEffect(() => {
    if (onCanGenerateResultSheetChange) {
      onCanGenerateResultSheetChange(canGenerateResultSheet);
    }
  }, [canGenerateResultSheet, onCanGenerateResultSheetChange]);

  useEffect(() => {
    if (initialized) onInitialized?.();
  }, [initialized, onInitialized]);

  useEffect(() => {
    if (!onExistingStudentsChange) return;

    const hasExisting = sortedStudentsData.some(({ student }) => {
      const hasId =
        student.id_number !== null && student.id_number !== undefined;
      const hasName = (student.student_name ?? "").trim().length > 0;
      return hasId || hasName;
    });

    onExistingStudentsChange(hasExisting);
  }, [sortedStudentsData, onExistingStudentsChange]);

  if (!initialized) return <ClassRecordLoading />;
  if (loading) return <ClassRecordLoading />;
  if (error) return <ClassRecordError description={error} />;
  if (headerNodes.length === 0 || sortedStudentsData.length === 0)
    return <ClassRecordError description="No data for this class record." />;

  const overlayVisible =
    !!editingAssessment ||
    studentContextMenu.visible ||
    assessmentContextMenu.visible ||
    componentContextMenu.visible ||
    (assessmentInfoContextMenu.visible &&
      !!assessmentInfoContextMenu.assessmentId);

  return (
    <>
      <table
        ref={tableRef}
        className="table-fixed border-collapse border-0 min-w-max -ml-px -mt-px ucap-table"
      >
        <thead>
          <BuildHeaderRow
            nodes={headerNodes}
            originalMaxDepth={originalMaxDepth}
            openAssessmentInfoContextMenu={handleOpenAssessmentInfo}
            assessmentInfoContextMenu={assessmentInfoContextMenu}
            maxScores={maxScores}
            setMaxScores={setMaxScores}
            computedMaxValues={computedMaxValues}
            handleEditStart={handleEditAssessmentTitle}
            onRightClickNode={handleRightClickNode}
            handleUpdateAssessment={handleUpdateAssessment}
            studentNameWidth={studentNameWidth}
            handleResize={handleVSeparatorMouseDown}
          />
        </thead>
        <tbody>
          {sortedStudentsData.map(({ student, score }, i) => (
            <BuildStudentRow
              key={student.student_id}
              student={student}
              index={i}
              nodes={headerNodes}
              studentScore={score}
              maxScores={maxScores}
              remarks={student.remarks ?? ""}
              updateRemark={(newRemark) =>
                handleUpdateStudent(student.student_id, { remarks: newRemark })
              }
              handleInputChange={handleStudentInputChange}
              saveRawScore={handleScoreChange}
              updateScoreProp={updateStudentScore}
              onRightClickRow={handleRightClickRow}
              handleUpdateStudent={handleUpdateStudent}
              studentNameWidth={studentNameWidth}
              handleResize={handleVSeparatorMouseDown}
            />
          ))}
        </tbody>
      </table>
      {overlayVisible &&
        createPortal(
          <div className="cr-overlay-layer">
            {editingAssessment && (
              <EditAssessmentTitlePopup
                editingAssessment={editingAssessment}
                setEditingAssessment={setEditingAssessment}
                handleEditSave={handleUpdateAssessmentTitle}
                handleEditCancel={handleEditAssessmentTitleCancel}
              />
            )}
            {assessmentInfoContextMenu.visible &&
              assessmentInfoContextMenu.assessmentId && (
                <AssessmentInfoPopup
                  x={assessmentInfoContextMenu.x}
                  y={assessmentInfoContextMenu.y}
                  onClose={handleCloseAssessmentInfo}
                  assessmentId={assessmentInfoContextMenu.assessmentId}
                  bloomsOptions={bloomsOptions}
                  outcomesOptions={outcomesOptions}
                  initialBlooms={currentAssessmentBlooms}
                  initialOutcomes={currentAssessmentOutcomes}
                  handleUpdateAssessment={handleUpdateAssessment}
                />
              )}
            {studentContextMenu.visible && (
              <ContextMenu
                visible={studentContextMenu.visible}
                x={studentContextMenu.x}
                y={studentContextMenu.y}
                onAdd={handleAddStudent}
                onDelete={() =>
                  handleDeleteStudent(studentContextMenu.studentId!)
                }
                addLabel="Add Student"
                deleteLabel="Delete Student"
                onClose={handleCloseMenus}
              />
            )}
            {assessmentContextMenu.visible && (
              <ContextMenu
                visible={assessmentContextMenu.visible}
                x={assessmentContextMenu.x}
                y={assessmentContextMenu.y}
                addLabel="Add Assessment"
                deleteLabel="Delete Assessment"
                onAdd={handleAddAssessment}
                onDelete={() =>
                  handleDeleteAssessment(assessmentContextMenu.assessmentId!)
                }
                onClose={handleCloseMenus}
              />
            )}
            {componentContextMenu.visible && (
              <ContextMenu
                visible={componentContextMenu.visible}
                x={componentContextMenu.x}
                y={componentContextMenu.y}
                onAdd={handleAddAssessment}
                addLabel="Add Assessment"
                onClose={handleCloseMenus}
              />
            )}
          </div>,
          document.body
        )}
    </>
  );
}
