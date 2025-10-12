import type { HeaderNode } from "./HeaderConfig";
import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import {
  calculateTermTotal,
  collectMaxScores,
  computeValues,
  getAllAssessmentNodesPure,
  getMaxDepth,
  initializeStudentScores,
} from "./ClassRecordFunctions";
import BuildHeaderRow from "./BuildHeaderRow";
// import BloomPopup from "./BloomPopup";
import BuildStudentRow from "./BuildStudentRow";
import type { Assessment, Student } from "../../types/classRecordTypes";
import { generateHeaderConfig } from "../../components/classrecord/HeaderConfig";
import EditAssessmentPopup from "./EditAssessmentPopup";
import {
  createAssessment,
  createStudent,
  deleteAssessment,
  deleteStudent,
  getAssessmentInfo,
  getClassRecord,
  updateAssessment,
  updateRawScore,
  updateStudent,
} from "../../api/classRecordApi";
import { useParams } from "react-router-dom";
import ClassRecordLoading from "../../pages/ClassRecordLoading";
import ClassRecordError from "../../pages/ClassRecordError";
import ContextMenu from "./ContextMenu";
import AssessmentInfoContextMenu from "./AssessmentInfoContextMenu";
import { getBloomsOptions, getCourseOutcomes } from "../../api/dropdownApi";
import type {
  BloomsClassification,
  CourseOutcomes,
  Option,
} from "../../types/dropdownTypes";

export default function ClassRecordComponent() {
  const { section_id, course_code } = useParams();
  const [headerNodes, setHeaderNodes] = useState<HeaderNode[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [maxScores, setMaxScores] = useState<Record<string, number>>({});
  const [studentScores, setStudentScores] = useState<
    Record<number, Record<string, number>>
  >(() => {
    return {};
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canOpenPopup, setCanOpenPopup] = useState<boolean>(true);
  const [editingAssessment, setEditingAssessment] = useState<{
    nodeKey: string;
    value: string;
    coords: { top: number; left: number; width: number; height: number };
  } | null>(null);

  const [bloomSelections, setBloomSelections] = useState<
    { id: number; name: string }[]
  >([]);
  const [outcomesOptions, setOutcomesOptions] = useState<
    { id: number; name: string }[]
  >([]);

  const [currentAssessmentBlooms, setCurrentAssessmentBlooms] = useState<
    number[]
  >([]);
  const [currentAssessmentOutcomes, setCurrentAssessmentOutcomes] = useState<
    number[]
  >([]);
  const [assessmentBloomsMap, setAssessmentBloomsMap] = useState<
    Record<string, number[]>
  >({});
  const [assessmentOutcomesMap, setAssessmentOutcomesMap] = useState<
    Record<string, number[]>
  >({});

  const [studentContextMenu, setStudentContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    studentId?: number;
  }>({ visible: false, x: 0, y: 0, studentId: undefined });
  const [assessmentContextMenu, setAssessmentContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    assessmentId?: number;
    componentId?: number;
  }>({
    visible: false,
    x: 0,
    y: 0,
  });
  const [assessmentInfoContextMenu, setAssessmentInfoContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    assessmentId?: number;
  }>({
    visible: false,
    x: 0,
    y: 0,
  });
  const [componentContextMenu, setComponentContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    componentId?: number;
  }>({
    visible: false,
    x: 0,
    y: 0,
  });
  const getAllAssessmentNodes = useCallback(
    (nodes: HeaderNode[]): HeaderNode[] => getAllAssessmentNodesPure(nodes),
    []
  );
  useEffect(() => {
    if (!section_id) return;

    async function fetchData() {
      setLoading(true);
      try {
        const data = await getClassRecord(Number(section_id));
        if (!data) throw new Error("No class record found");

        const fetchedStudents = data.students ?? [];
        const generatedHeaders = generateHeaderConfig(data);
        const defaults = collectMaxScores(generatedHeaders);

        setStudents(fetchedStudents);
        setHeaderNodes(generatedHeaders);
        setMaxScores(defaults);

        const initialStudentScores = initializeStudentScores(
          fetchedStudents,
          generatedHeaders
        );
        setStudentScores(initialStudentScores);

        // ✅ Fetch Bloom’s and Outcomes selections
        if (course_code) {
          const [blooms, outcomes] = await Promise.all([
            getBloomsOptions(),
            getCourseOutcomes(course_code),
          ]);

          const mappedBlooms: Option[] = (blooms as BloomsClassification[]).map(
            (b) => ({
              id: b.blooms_classification_id,
              name: b.blooms_classification_type,
            })
          );

          setBloomSelections(mappedBlooms);

          const mappedOutcomes: Option[] = (outcomes as CourseOutcomes[]).map(
            (o) => ({
              id: o.course_outcome_id,
              name: o.course_outcome_code,
            })
          );

          setOutcomesOptions(mappedOutcomes);
        }

        // ✅ After header nodes are built, load saved Bloom’s & Outcomes per assessment
        const allAssessments = getAllAssessmentNodes(generatedHeaders);
        const infoRequests = allAssessments.map((node) =>
          getAssessmentInfo(Number(node.key))
            .then((info) => ({
              id: String(node.key), // ✅ Ensure it's always a string
              blooms: info.blooms_classification ?? [],
              outcomes: info.course_outcome ?? [],
            }))
            .catch(() => ({
              id: String(node.key), // ✅ Still ensure consistent type
              blooms: [],
              outcomes: [],
            }))
        );

        const infos = await Promise.all(infoRequests);

        const bloomsMap: Record<string, number[]> = {};
        const outcomesMap: Record<string, number[]> = {};

        infos.forEach((i) => {
          bloomsMap[i.id] = i.blooms;
          outcomesMap[i.id] = i.outcomes;
        });

        setAssessmentBloomsMap(bloomsMap);
        setAssessmentOutcomesMap(outcomesMap);
      } catch (err) {
        console.error(err);
        setError("Failed to load class record data.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [section_id, course_code, getAllAssessmentNodes]);

  useEffect(() => {
    if (loading || headerNodes.length === 0 || students.length === 0) return;

    const assessmentNodes = getAllAssessmentNodes(headerNodes);
    const currentKeys = new Set(
      assessmentNodes.map((n) => n.key!).filter(Boolean)
    );

    const currentHeaderNodes = headerNodes;

    const zeroMaxScoreKeys = new Set(
      Object.entries(maxScores)
        .filter(([, max]) => max === 0)
        .map(([key]) => key)
    );

    setStudentScores((prev) => {
      let changed = false;
      const updated: Record<number, Record<string, number>> = {};

      for (const [studentIdStr, scores] of Object.entries(prev)) {
        const studentId = Number(studentIdStr);
        const newScores = { ...scores };

        // Remove obsolete keys
        for (const k in newScores) {
          if (!k.includes("-total-grade") && !currentKeys.has(k)) {
            delete newScores[k];
            changed = true;
          }
        }

        // Add new keys
        assessmentNodes.forEach((node) => {
          if (node.key && newScores[node.key] === undefined) {
            newScores[node.key] = 0;
            changed = true;
          }
        });

        for (const k in newScores) {
          // If the key is an assessment key AND its max score is zero
          if (zeroMaxScoreKeys.has(k) && newScores[k] !== 0) {
            newScores[k] = 0;
            changed = true;
          }
        }

        const newMidtermTotal = calculateTermTotal(
          newScores,
          "midterm",
          currentHeaderNodes
        );
        const newFinalTotal = calculateTermTotal(
          newScores,
          "final",
          currentHeaderNodes
        );

        if (newScores["midterm-total-grade"] !== newMidtermTotal) {
          newScores["midterm-total-grade"] = newMidtermTotal;
          changed = true;
        }

        if (newScores["final-total-grade"] !== newFinalTotal) {
          newScores["final-total-grade"] = newFinalTotal;
          changed = true;
        }

        updated[studentId] = newScores;
      }

      return changed ? updated : prev;
    });
  }, [headerNodes, getAllAssessmentNodes, loading, students, maxScores]);

  useEffect(() => {
    const assessmentId = String(assessmentInfoContextMenu.assessmentId);
    if (!assessmentId) return;

    setCurrentAssessmentBlooms(assessmentBloomsMap[assessmentId] ?? []);
    setCurrentAssessmentOutcomes(assessmentOutcomesMap[assessmentId] ?? []);
  }, [
    assessmentInfoContextMenu.assessmentId,
    assessmentBloomsMap,
    assessmentOutcomesMap,
  ]);

  const headerNodesRef = useRef<HeaderNode[]>([]);
  useEffect(() => {
    headerNodesRef.current = headerNodes;
  }, [headerNodes]);

  const handleAddStudent = async () => {
    try {
      if (!section_id) throw new Error("No section selected");

      const newStudent: Partial<Student> = {
        student_name: null,
        id_number: null,
      };

      const created = await createStudent(newStudent, Number(section_id));
      setStudents((prev) => [...prev, created]);

      setStudentScores((prev) => ({
        ...prev,
        [created.student_id]: headerNodes.reduce((acc, node) => {
          if (node.key) acc[node.key] = 0;
          return acc;
        }, {} as Record<string, number>),
      }));
    } catch (err) {
      console.error("Failed to add student:", err);
    }
  };

  const handleRightClickRow = (e: React.MouseEvent, studentId: number) => {
    e.preventDefault();
    setStudentContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      studentId,
    });
  };

  const handleUpdateStudent = useCallback(
    async (studentId: number, updates: Partial<Student>) => {
      try {
        const updated = await updateStudent(studentId, updates);
        setStudents((prev) =>
          prev.map((s) => (s.student_id === studentId ? updated : s))
        );
      } catch (err) {
        console.error("Error updating student:", err);
        setError("Failed to update student.");
      }
    },
    []
  );

  const handleDeleteStudent = useCallback(async (studentId: number) => {
    try {
      await deleteStudent(studentId);

      setStudents((prev) => prev.filter((s) => s.student_id !== studentId));
      setStudentScores((prev) => {
        const copy = { ...prev };
        delete copy[studentId];
        return copy;
      });
    } catch (err) {
      console.error("Error deleting student:", err);
      setError("Failed to delete student.");
    }
  }, []);
  function updateAssessmentInTree(
    nodes: HeaderNode[],
    assessmentId: number,
    updates: Partial<Assessment>
  ): HeaderNode[] {
    return nodes.map((node) => {
      if (node.key === String(assessmentId)) {
        // Map backend fields (Assessment) → frontend fields (HeaderNode)
        const mappedUpdates: Partial<HeaderNode> = {};

        if (
          updates.assessment_title !== undefined &&
          updates.assessment_title !== null
        ) {
          mappedUpdates.title = updates.assessment_title;
        }

        if (
          updates.assessment_highest_score !== undefined &&
          updates.assessment_highest_score !== null
        ) {
          mappedUpdates.maxScore = updates.assessment_highest_score;
        }
        return { ...node, ...mappedUpdates };
      }

      if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: updateAssessmentInTree(
            node.children,
            assessmentId,
            updates
          ),
        };
      }

      return node;
    });
  }

  useEffect(() => {
    console.log("currentAssessmentBlooms changed:", currentAssessmentBlooms);
  }, [currentAssessmentBlooms]);

  const handleRightClickNode = (e: React.MouseEvent, node: HeaderNode) => {
    e.preventDefault();

    setAssessmentContextMenu((prev) => ({ ...prev, visible: false }));
    setComponentContextMenu((prev) => ({ ...prev, visible: false }));

    if (node.nodeType === "assessment") {
      setAssessmentContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        assessmentId: Number(node.key),
        componentId: node.componentId,
      });
    }

    if (node.nodeType === "component") {
      setComponentContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        componentId: node.componentId,
      });
    }
  };

  const handleAddAssessment = async () => {
    try {
      let componentId = componentContextMenu.componentId;
      let parentTermType: "midterm" | "final" = "midterm"; // default

      // Determine parent component and termType
      if (!componentId && assessmentContextMenu.assessmentId) {
        const parentNode = findParentComponentNode(
          headerNodes,
          String(assessmentContextMenu.assessmentId)
        );
        if (parentNode) {
          componentId = parentNode.componentId;

          // Type-safe termType assignment
          const parentNodeTermTypeRaw = parentNode.termType ?? "midterm";
          parentTermType =
            parentNodeTermTypeRaw === "final" ? "final" : "midterm";
        }
      } else if (componentId) {
        const parentNode = headerNodes.find(
          (n) => n.componentId === componentId
        );
        if (parentNode) {
          const parentNodeTermTypeRaw = parentNode.termType ?? "midterm";
          parentTermType =
            parentNodeTermTypeRaw === "final" ? "final" : "midterm";
        }
      }
      if (!componentId) return;

      const newAssessment = await createAssessment({
        course_component_id: componentId,
        assessment_title: null,
        assessment_highest_score: 0,
      });

      const newId = String(newAssessment.assessment_id);

      const newNode: HeaderNode = {
        key: newId,
        title: newAssessment.assessment_title ?? "",
        nodeType: "assessment",
        calculationType: "assignment",
        children: [],
        needsButton: true,
        maxScore: newAssessment.assessment_highest_score ?? 0,
        termType: parentTermType,
      };

      setMaxScores((prev) => ({
        ...prev,
        [newId]: newAssessment.assessment_highest_score ?? 0,
      }));

      setHeaderNodes((prev) => {
        const insertBeforeCalculations = (
          children: HeaderNode[],
          node: HeaderNode
        ) => {
          const calcStartIndex = children.findIndex(
            (c) =>
              c.calculationType === "sum" || c.calculationType === "percentage"
          );
          if (calcStartIndex === -1) return [...children, node];
          return [
            ...children.slice(0, calcStartIndex),
            node,
            ...children.slice(calcStartIndex),
          ];
        };

        const addToComponent = (nodes: HeaderNode[]): HeaderNode[] =>
          nodes.map((node) => {
            if (
              node.nodeType === "component" &&
              node.componentId === componentId
            ) {
              const updatedChildren = insertBeforeCalculations(
                node.children,
                newNode
              );

              const updatedChildrenWithKeys: HeaderNode[] = updatedChildren.map(
                (child) => {
                  if (
                    child.calculationType === "sum" ||
                    child.calculationType === "percentage"
                  ) {
                    const allAssessmentKeys = updatedChildren
                      .filter((c) => c.nodeType === "assessment" && c.key)
                      .map((c) => c.key!);
                    return { ...child, groupKeys: allAssessmentKeys };
                  }
                  return child;
                }
              );
              return { ...node, children: updatedChildrenWithKeys };
            }
            return { ...node, children: addToComponent(node.children) };
          });

        return addToComponent(prev);
      });
    } catch (err) {
      console.error("Failed to add assessment:", err);
    }
  };

  function findParentComponentNode(
    nodes: HeaderNode[],
    targetKey?: string
  ): HeaderNode | null {
    for (const node of nodes) {
      if (
        node.nodeType === "component" &&
        node.children.some((c) => c.key === targetKey)
      ) {
        return node;
      }
      const nested = findParentComponentNode(node.children, targetKey);
      if (nested) return nested;
    }
    return null;
  }
  const handleUpdateAssessment = async (
    assessmentId: number,
    updates: Partial<Assessment> & {
      blooms_classification?: number[];
      course_outcome?: number[];
    }
  ) => {
    setHeaderNodes((prev) =>
      updateAssessmentInTree(prev, assessmentId, updates)
    );

    setStudentScores((prev) => {
      const updatedHeaders = updateAssessmentInTree(
        headerNodesRef.current,
        assessmentId,
        updates
      );

      const copy = { ...prev };
      Object.values(copy).forEach((scores) => {
        scores["midterm-total-grade"] = calculateTermTotal(
          scores,
          "midterm",
          updatedHeaders
        );
        scores["final-total-grade"] = calculateTermTotal(
          scores,
          "final",
          updatedHeaders
        );
      });
      return copy;
    });

    try {
      const updated = await updateAssessment(assessmentId, updates);

      setHeaderNodes((prev) =>
        updateAssessmentInTree(prev, assessmentId, updated)
      );

      if (updates.blooms_classification) {
        setAssessmentBloomsMap((prev) => ({
          ...prev,
          [assessmentId]: updates.blooms_classification!,
        }));
      }

      if (updates.course_outcome) {
        setAssessmentOutcomesMap((prev) => ({
          ...prev,
          [assessmentId]: updates.course_outcome!,
        }));
      }


      if (updated.blooms_classification) {
        setCurrentAssessmentBlooms(updated.blooms_classification);
      }
      if (updated.course_outcome) {
        setCurrentAssessmentOutcomes(updated.course_outcome);
      }
    } catch (err) {
      console.error("Failed to update assessment:", err);
    }
  };

  const openAssessmentInfoContextMenu = (
    e: React.MouseEvent,
    assessmentId: number
  ) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setAssessmentInfoContextMenu({
      visible: true,
      x: rect.left,
      y: rect.bottom + window.scrollY,
      assessmentId,
    });
  };

  const closeAssessmentMenu = () => {
    setAssessmentInfoContextMenu({ visible: false, x: 0, y: 0 });
  };

  const handleDeleteAssessment = async (assessmentId: number) => {
    try {
      await deleteAssessment(assessmentId);

      function removeAssessment(nodes: HeaderNode[], id: number): HeaderNode[] {
        return nodes
          .map((node) => ({
            ...node,
            children: removeAssessment(node.children, id),
          }))
          .filter(
            (node) => node.nodeType !== "assessment" || Number(node.key) !== id
          );
      }
      setHeaderNodes((prev) => removeAssessment(prev, assessmentId));
      setStudentScores((prev) => {
        const copy = { ...prev };
        Object.values(copy).forEach((scores) => {
          delete scores[assessmentId];
          scores["midterm-total-grade"] = calculateTermTotal(
            scores,
            "midterm",
            headerNodes
          );
          scores["final-total-grade"] = calculateTermTotal(
            scores,
            "final",
            headerNodes
          );
        });
        return copy;
      });
    } catch (err) {
      console.error("Failed to delete assessment:", err);
    }
  };

  const handleEditStart = (
    node: HeaderNode,
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (!canOpenPopup) return;

    setCanOpenPopup(false);

    const rect = (event.target as HTMLElement).getBoundingClientRect();

    setEditingAssessment({
      nodeKey: node.key!,
      value: node.title || "",
      coords: {
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      },
    });
    window.setTimeout(() => setCanOpenPopup(true), 100);
  };

  const handleEditSave = async (nodeKey: string, newValue: string) => {
    const assessmentId = Number(nodeKey);
    setHeaderNodes((prev) =>
      updateAssessmentInTree(prev, assessmentId, { assessment_title: newValue })
    );
    await handleUpdateAssessment(assessmentId, { assessment_title: newValue });
    setEditingAssessment(null);
  };

  const handleEditCancel = () => setEditingAssessment(null);

  // const handleCheckboxChange = useCallback(
  //   (level: string) => {
  //     setBloomSelections((prev) => {
  //       const selected = prev[currentItem] || [];
  //       const newSelected = selected.includes(level)
  //         ? selected.filter((l) => l !== level)
  //         : [...selected, level];
  //       return { ...prev, [currentItem]: newSelected };
  //     });
  //   },
  //   [currentItem]
  // );

  const handleInputChange = useCallback(
    (index: number, field: keyof Student, value: string) => {
      setStudents((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: value };
        return updated;
      });
    },
    []
  );

  // const openPopup = useCallback((title: string) => {
  //   setCurrentItem(title);
  //   setShowPopup(true);
  // }, []);

  const saveRawScore = async (
    studentId: number,
    assessmentId: number,
    value: number | null
  ) => {
    try {
      await updateRawScore(studentId, assessmentId, value);
      setStudentScores((prev) => ({
        ...prev,
        [studentId]: {
          ...(prev[studentId] ?? {}),
          [assessmentId]: value,
        },
      }));
    } catch (error) {
      console.error("Failed to update raw score:", error);
    }
  };

  const updateStudentScore = useCallback(
    (studentId: number, key: string, value: number) => {
      setStudentScores((prev) => {
        const prevStudentScore = prev[studentId] || {};

        const updatedStudentScore = {
          ...prevStudentScore,
          [key]: value,
        };

        updatedStudentScore["midterm-total-grade"] = calculateTermTotal(
          updatedStudentScore,
          "midterm",
          headerNodes
        );
        updatedStudentScore["final-total-grade"] = calculateTermTotal(
          updatedStudentScore,
          "final",
          headerNodes
        );

        return {
          ...prev,
          [studentId]: updatedStudentScore,
        };
      });
    },
    [headerNodes]
  );

  const computedMaxValues = useMemo(() => {
    if (headerNodes.length === 0 || Object.keys(maxScores).length === 0)
      return {};
    const rawMaxScoreKeys = Object.keys(maxScores).filter(
      (k) => !k.includes("-total-grade")
    );
    const hasAnyMaxScore = rawMaxScoreKeys.some(
      (k) => maxScores[k] && maxScores[k] > 0
    );
    if (!hasAnyMaxScore) {
      return {};
    }
    return computeValues(maxScores, maxScores, headerNodes);
  }, [maxScores, headerNodes]);

  const computedStudentValues = useMemo(() => {
    if (headerNodes.length === 0 || Object.keys(studentScores).length === 0) {
      return students.reduce<Record<number, Record<string, number>>>(
        (acc, student) => {
          acc[student.student_id] = {};
          return acc;
        },
        {}
      );
    }

    return Object.fromEntries(
      Object.entries(studentScores).map(([studentId, scores]) => {
        const rawScoreKeys = Object.keys(scores).filter(
          (k) => !k.includes("-total-grade")
        );
        const hasAnyScore = rawScoreKeys.some(
          (k) => scores[k] && scores[k] !== 0
        );

        if (!hasAnyScore) {
          return [Number(studentId), {}];
        }

        return [
          Number(studentId),
          computeValues(scores, maxScores, headerNodes),
        ];
      })
    );
  }, [studentScores, maxScores, headerNodes, students]);

  const sortedStudentsData = useMemo(() => {
    return students
      .map((student) => ({
        student,
        score: studentScores[student.student_id] ?? {},
        computed: computedStudentValues[student.student_id] ?? {},
        remark: student.remarks,
      }))
      .sort((a, b) => {
        const nameA = a.student.student_name?.toLowerCase() ?? "";
        const nameB = b.student.student_name?.toLowerCase() ?? "";
        if (!nameA && nameB) return 1;
        if (!nameB && nameA) return -1;
        if (!nameA && !nameB) return 0;
        return nameA.localeCompare(nameB);
      });
  }, [students, studentScores, computedStudentValues]);

  if (loading) return <ClassRecordLoading />;
  if (error) return <ClassRecordError description={error} />;
  if (headerNodes.length === 0 || students.length === 0)
    return <ClassRecordError description={"No data for this class record."} />;

  return (
    <table className="table-fixed border-collapse border-0 min-w-max ml-[-1px] mt-[-1px]">
      <thead>
        <BuildHeaderRow
          nodes={headerNodes}
          originalMaxDepth={Math.max(...headerNodes.map(getMaxDepth))}
          openAssessmentInfoContextMenu={openAssessmentInfoContextMenu}
          maxScores={maxScores}
          setMaxScores={setMaxScores}
          computedMaxValues={computedMaxValues}
          handleEditStart={handleEditStart}
          onRightClickNode={handleRightClickNode}
          handleUpdateAssessment={handleUpdateAssessment}
        />
      </thead>
      <tbody>
        {sortedStudentsData.map(({ student, computed }, i) => (
          <BuildStudentRow
            key={student.student_id}
            student={student}
            index={i} // index in the sorted array
            nodes={headerNodes}
            studentScore={studentScores[student.student_id] ?? {}}
            computedValues={computed}
            maxScores={maxScores}
            remarks={student.remarks ?? ""}
            updateRemark={(newRemark) =>
              handleUpdateStudent(student.student_id, { remarks: newRemark })
            }
            handleInputChange={handleInputChange}
            saveRawScore={saveRawScore}
            updateScoreProp={updateStudentScore}
            onRightClickRow={handleRightClickRow}
            handleUpdateStudent={handleUpdateStudent}
          />
        ))}
      </tbody>
      {/* {showPopup && (
        <BloomPopup
          title="Bloom's Taxonomy"
          selections={bloomSelections}
          onClose={closePopup}
          onChange={handleCheckboxChange}
          currentItem={currentItem}
        />
      )} */}
      {editingAssessment && (
        <EditAssessmentPopup
          editingAssessment={editingAssessment}
          setEditingAssessment={setEditingAssessment}
          handleEditSave={handleEditSave}
          handleEditCancel={handleEditCancel}
        />
      )}
      {assessmentInfoContextMenu.visible &&
        assessmentInfoContextMenu.assessmentId && (
          <AssessmentInfoContextMenu
            x={assessmentInfoContextMenu.x}
            y={assessmentInfoContextMenu.y}
            onClose={closeAssessmentMenu}
            assessmentId={assessmentInfoContextMenu.assessmentId}
            bloomsOptions={bloomSelections}
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
          onAdd={() => handleAddStudent()}
          onDelete={() => handleDeleteStudent(studentContextMenu.studentId!)}
          addLabel="Add Student"
          deleteLabel="Delete Assessment"
          onClose={() =>
            setStudentContextMenu((prev) => ({ ...prev, visible: false }))
          }
        />
      )}
      {assessmentContextMenu.visible && (
        <ContextMenu
          visible
          x={assessmentContextMenu.x}
          y={assessmentContextMenu.y}
          addLabel="Add Assessment"
          deleteLabel="Delete Assessment"
          onAdd={() => handleAddAssessment()}
          onDelete={() =>
            handleDeleteAssessment(assessmentContextMenu.assessmentId!)
          }
          onClose={() =>
            setAssessmentContextMenu((prev) => ({ ...prev, visible: false }))
          }
        />
      )}
      {componentContextMenu.visible && (
        <ContextMenu
          visible={componentContextMenu.visible}
          x={componentContextMenu.x}
          y={componentContextMenu.y}
          onAdd={() => handleAddAssessment()}
          addLabel="Add Assessment"
          onClose={() =>
            setComponentContextMenu((prev) => ({ ...prev, visible: false }))
          }
        />
      )}
    </table>
  );
}
