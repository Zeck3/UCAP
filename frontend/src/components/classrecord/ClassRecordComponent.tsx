import { useEffect, useMemo, useRef } from "react";
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

export default function ClassRecordComponent() {
  const {
    headerNodes,
    maxScores,
    setMaxScores,
    studentScores,
    sortedStudentsData,
    computedMaxValues,
    bloomsOptions,
    outcomesOptions,
    currentAssessmentBlooms,
    currentAssessmentOutcomes,
    studentContextMenu,
    assessmentContextMenu,
    componentContextMenu,
    assessmentInfoContextMenu,
    editingAssessment,
    setEditingAssessment,
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
    loading,
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

    function setHeaderOffsets() {
      if (!table) return;
      const rows = Array.from(table.querySelectorAll("thead tr"));
      let cum = 0;
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i] as HTMLTableRowElement | undefined;
        const h = r ? Math.ceil(r.getBoundingClientRect().height) : 0;
        table.style.setProperty(`--ucap-header-top-${i}`, `${cum}px`);
        cum += h;
      }
      const col1 = table.querySelector("thead th.sticky-col-1") as
        | HTMLTableCellElement
        | null;
      const col2 = table.querySelector("thead th.sticky-col-2") as
        | HTMLTableCellElement
        | null;
      const col3 = table.querySelector("thead th.sticky-col-3") as
        | HTMLTableCellElement
        | null;
      if (col1 && col2 && col3) {
        const w1 = Math.ceil(col1.getBoundingClientRect().width) || 0;
        const w2 = Math.ceil(col2.getBoundingClientRect().width) || 0;
        const w3 = Math.ceil(col3.getBoundingClientRect().width) || 0;
        const boundary = w1 + w2 + w3;
        table.style.setProperty("--ucap-sticky-left-boundary", `${boundary}px`);
      }
    }

    let frameId: number | null = null;
    const schedule = () => {
      if (frameId != null) return;
      frameId = requestAnimationFrame(() => {
        frameId = null;
        setHeaderOffsets();
      });
    };

    schedule();
    const onResize = () => schedule();
    window.addEventListener("resize", onResize);

    const mo = new MutationObserver(() => schedule());
    mo.observe(table, { childList: true, subtree: true, attributes: true });

    return () => {
      window.removeEventListener("resize", onResize);
      mo.disconnect();
      if (frameId != null) cancelAnimationFrame(frameId);
    };
  }, [headerNodes]);

  if (loading) return <ClassRecordLoading />;
  if (error) return <ClassRecordError description={error} />;
  if (headerNodes.length === 0 || sortedStudentsData.length === 0)
    return <ClassRecordError description={"No data for this class record."} />;

  const overlayVisible =
    !!editingAssessment ||
    studentContextMenu.visible ||
    assessmentContextMenu.visible ||
    componentContextMenu.visible ||
    (assessmentInfoContextMenu.visible && !!assessmentInfoContextMenu.assessmentId);

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
            maxScores={maxScores}
            setMaxScores={setMaxScores}
            computedMaxValues={computedMaxValues}
            handleEditStart={handleEditAssessmentTitle}
            onRightClickNode={handleRightClickNode}
            handleUpdateAssessment={handleUpdateAssessment}
          />
        </thead>
        <tbody>
          {sortedStudentsData.map(({ student, computed }, i) => (
            <BuildStudentRow
              key={student.student_id}
              student={student}
              index={i}
              nodes={headerNodes}
              studentScore={studentScores[student.student_id] ?? {}}
              computedValues={computed}
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