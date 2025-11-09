import {
  useCallback,
  useMemo,
  useState,
  useEffect,
  startTransition,
} from "react";
import { useParams } from "react-router-dom";
import { generateHeaderConfig } from "../utils/HeaderConfig";
import type { Assessment, Student } from "../../../types/classRecordTypes";
import type { HeaderNode } from "../types/headerConfigTypes";
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
} from "../../../api/classRecordApi";
import { getBloomsOptions, getCourseOutcomes } from "../../../api/dropdownApi";
import {
  calculateAllTermTotals,
  collectMaxScores,
  computeValues,
  findParentComponentNode,
  getAllAssessmentNodesPure,
  initializeStudentScores,
  updateAssessmentInTree,
} from "../utils/ClassRecordFunctions";

type ClassRecordState = {
  headerNodes: HeaderNode[];
  students: Student[];
  maxScores: Record<string, number>;
  studentScores: Record<number, Record<string, number>>;

  assessmentBloomsMap: Record<string, number[]>;
  assessmentOutcomesMap: Record<string, number[]>;

  currentAssessmentBlooms: number[];
  currentAssessmentOutcomes: number[];
};

export function useClassRecord() {
  const { section_id, course_code } = useParams();
  const [classRecord, setClassRecord] = useState<ClassRecordState>({
    headerNodes: [],
    students: [],
    maxScores: {},
    studentScores: {},
    assessmentBloomsMap: {},
    assessmentOutcomesMap: {},
    currentAssessmentBlooms: [],
    currentAssessmentOutcomes: [],
  });

  const {
    students,
    headerNodes,
    maxScores,
    studentScores,
    currentAssessmentBlooms,
    currentAssessmentOutcomes,
  } = classRecord;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canOpenPopup, setCanOpenPopup] = useState<boolean>(true);
  const [editingAssessment, setEditingAssessment] = useState<{
    nodeKey: string;
    value: string;
    coords: { x: number; y: number };
  } | null>(null);

  const [bloomsOptions, setBloomsOptions] = useState<
    { id: number; name: string }[]
  >(() => []);
  const [outcomesOptions, setOutcomesOptions] = useState<
    { id: number; name: string }[]
  >(() => []);

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

  const setMaxScores = useCallback(
    (
      updater:
        | Record<string, number>
        | ((prev: Record<string, number>) => Record<string, number>)
    ) => {
      setClassRecord((prev) => ({
        ...prev,
        maxScores:
          typeof updater === "function" ? updater(prev.maxScores) : updater,
      }));
    },
    []
  );

  const fetchData = useCallback(async () => {
    let isMounted = true;
    setLoading(true);

    try {
      const data = await getClassRecord(Number(section_id));
      if (!data) throw new Error("No class record found");

      const fetchedStudents = data.students ?? [];
      const generatedHeaders = generateHeaderConfig(data);
      const defaults = collectMaxScores(generatedHeaders);
      const initialStudentScores = initializeStudentScores(
        fetchedStudents,
        generatedHeaders
      );

      const [blooms, outcomes] = course_code
        ? await Promise.all([
            getBloomsOptions(),
            getCourseOutcomes(course_code),
          ])
        : [[], []];

      const mappedBlooms = blooms.map((b) => ({
        id: b.blooms_classification_id,
        name: b.blooms_classification_type,
      }));

      const mappedOutcomes = outcomes.map((o) => ({
        id: o.course_outcome_id,
        name: o.course_outcome_code,
      }));

      const allAssessments = getAllAssessmentNodesPure(generatedHeaders);
      const infos = await Promise.all(
        allAssessments.map(async (node) => {
          try {
            const info = await getAssessmentInfo(Number(node.key));
            return {
              id: String(node.key),
              blooms: info.blooms_classification ?? [],
              outcomes: info.course_outcome ?? [],
            };
          } catch {
            return { id: String(node.key), blooms: [], outcomes: [] };
          }
        })
      );

      if (!isMounted) return;

      const bloomsMap = Object.fromEntries(infos.map((i) => [i.id, i.blooms]));
      const outcomesMap = Object.fromEntries(
        infos.map((i) => [i.id, i.outcomes])
      );

      startTransition(() => {
        setClassRecord({
          headerNodes: generatedHeaders,
          students: fetchedStudents,
          maxScores: defaults,
          studentScores: initialStudentScores,
          assessmentBloomsMap: bloomsMap,
          assessmentOutcomesMap: outcomesMap,
          currentAssessmentBlooms: [],
          currentAssessmentOutcomes: [],
        });

        setBloomsOptions(mappedBlooms);
        setOutcomesOptions(mappedOutcomes);
      });
    } catch (err) {
      console.error("Failed to load class record:", err);
      if (isMounted) setError("Failed to load class record data.");
    } finally {
      if (isMounted) setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [section_id, course_code]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const assessmentKeys = useMemo(() => {
    const assessmentNodes = getAllAssessmentNodesPure(headerNodes);
    return new Set(assessmentNodes.map((n) => n.key!).filter(Boolean));
  }, [headerNodes]);

  const zeroMaxScoreKeys = useMemo(() => {
    return new Set(
      Object.entries(maxScores)
        .filter(([, max]) => max === 0)
        .map(([key]) => key)
    );
  }, [maxScores]);

  const syncStudentScores = useCallback(() => {
    setClassRecord((prev) => {
      const prevScores = prev.studentScores;
      let changed = false;
      const updatedScores: Record<number, Record<string, number>> = {};

      for (const [studentIdStr, scores] of Object.entries(prevScores)) {
        const studentId = Number(studentIdStr);
        const newScores = { ...scores };

        for (const k in newScores) {
          if (!k.includes("-total-grade") && !assessmentKeys.has(k)) {
            delete newScores[k];
            changed = true;
          }
        }

        assessmentKeys.forEach((key) => {
          if (newScores[key] === undefined) {
            newScores[key] = 0;
            changed = true;
          }
        });

        zeroMaxScoreKeys.forEach((key) => {
          if (newScores[key] !== 0) {
            newScores[key] = 0;
            changed = true;
          }
        });

        const { midterm: newMidtermTotal, final: newFinalTotal } =
          calculateAllTermTotals(newScores, prev.headerNodes);

        if (newScores["midterm-total-grade"] !== newMidtermTotal) {
          newScores["midterm-total-grade"] = newMidtermTotal;
          changed = true;
        }

        if (newScores["final-total-grade"] !== newFinalTotal) {
          newScores["final-total-grade"] = newFinalTotal;
          changed = true;
        }

        updatedScores[studentId] = newScores;
      }

      return changed ? { ...prev, studentScores: updatedScores } : prev;
    });
  }, [assessmentKeys, zeroMaxScoreKeys]);

  useEffect(() => {
    if (!loading && headerNodes.length > 0 && students.length > 0) {
      syncStudentScores();
    }
  }, [loading, headerNodes, students, syncStudentScores]);

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
    const result: Record<number, Record<string, number>> = {};

    for (const student of students) {
      const scores = studentScores[student.student_id];
      if (!scores) continue;

      const hasAnyRawScore = Object.entries(scores).some(
        ([k, v]) =>
          typeof v === "number" &&
          v !== 0 &&
          !isNaN(v) &&
          !k.includes("-total-grade")
      );

      if (!hasAnyRawScore) {
        result[student.student_id] = {};
        continue;
      }

      result[student.student_id] = computeValues(
        scores,
        maxScores,
        headerNodes
      );
    }

    return result;
  }, [studentScores, maxScores, headerNodes, students]);

  const updateStudentScore = useCallback(
    (studentId: number, key: string, value: number) => {
      setClassRecord((prev) => {
        const prevStudent = prev.studentScores[studentId] ?? {};
        const updated = { ...prevStudent, [key]: value };

        const { midterm, final } = calculateAllTermTotals(
          updated,
          prev.headerNodes
        );
        updated["midterm-total-grade"] = midterm;
        updated["final-total-grade"] = final;

        return {
          ...prev,
          studentScores: { ...prev.studentScores, [studentId]: updated },
        };
      });
    },
    [setClassRecord]
  );

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

  const handleAddStudent = useCallback(async () => {
    const created = await createStudent(
      { student_name: null, id_number: null },
      Number(section_id)
    );
    setClassRecord((prev) => ({
      ...prev,
      students: [...prev.students, created],
      studentScores: {
        ...prev.studentScores,
        [created.student_id]: Object.fromEntries(
          prev.headerNodes.map((node) => [node.key!, 0])
        ),
      },
    }));
  }, [section_id]);

  const handleDeleteStudent = useCallback(async (studentId: number) => {
    try {
      await deleteStudent(studentId);

      setClassRecord((prev) => {
        const updatedStudents = prev.students.filter(
          (s) => s.student_id !== studentId
        );

        const updatedStudentScores = { ...prev.studentScores };
        delete updatedStudentScores[studentId];

        return {
          ...prev,
          students: updatedStudents,
          studentScores: updatedStudentScores,
        };
      });
    } catch (err) {
      console.error("Error deleting student:", err);
      setError("Failed to delete student.");
    }
  }, []);

  const handleUpdateStudent = useCallback(
    async (studentId: number, updates: Partial<Student>) => {
      try {
        const updated = await updateStudent(studentId, updates);

        setClassRecord((prev) => ({
          ...prev,
          students: prev.students.map((s) =>
            s.student_id === studentId ? updated : s
          ),
        }));
      } catch (err) {
        console.error("Error updating student:", err);
        setError("Failed to update student.");
      }
    },
    []
  );

  const insertBeforeCalculations = useCallback(
    (children: HeaderNode[], node: HeaderNode) => {
      const calcStartIndex = children.findIndex(
        (c) => c.calculationType === "sum" || c.calculationType === "percentage"
      );
      if (calcStartIndex === -1) return [...children, node];
      return [
        ...children.slice(0, calcStartIndex),
        node,
        ...children.slice(calcStartIndex),
      ];
    },
    []
  );

  const handleAddAssessment = async () => {
    try {
      let componentId = componentContextMenu.componentId;
      let parentTermType: "midterm" | "final" = "midterm";

      if (!componentId && assessmentContextMenu.assessmentId) {
        const parentNode = findParentComponentNode(
          headerNodes,
          String(assessmentContextMenu.assessmentId)
        );
        if (parentNode) {
          componentId = parentNode.componentId;

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
        course_component: componentId,
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

      setClassRecord((prev) => {
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

        const updatedHeaderNodes = addToComponent(prev.headerNodes);
        const updatedMaxScores = {
          ...prev.maxScores,
          [newId]: newAssessment.assessment_highest_score ?? 0,
        };

        return {
          ...prev,
          headerNodes: updatedHeaderNodes,
          maxScores: updatedMaxScores,
        };
      });
    } catch (err) {
      console.error("Failed to add assessment:", err);
    }
  };

  const handleDeleteAssessment = async (assessmentId: number) => {
    try {
      await deleteAssessment(assessmentId);

      const removeAssessment = (
        nodes: HeaderNode[],
        id: number
      ): HeaderNode[] =>
        nodes
          .map((node) => ({
            ...node,
            children: removeAssessment(node.children, id),
          }))
          .filter(
            (node) => node.nodeType !== "assessment" || Number(node.key) !== id
          );

      setClassRecord((prev) => {
        const updatedHeaderNodes = removeAssessment(
          prev.headerNodes,
          assessmentId
        );

        const updatedStudentScores = Object.fromEntries(
          Object.entries(prev.studentScores).map(([sid, scores]) => {
            const newScores = { ...scores };
            delete newScores[assessmentId];

            const { midterm, final } = calculateAllTermTotals(
              newScores,
              updatedHeaderNodes
            );
            newScores["midterm-total-grade"] = midterm;
            newScores["final-total-grade"] = final;

            return [sid, newScores];
          })
        );

        const updatedMaxScores = { ...prev.maxScores };
        delete updatedMaxScores[assessmentId];

        return {
          ...prev,
          headerNodes: updatedHeaderNodes,
          studentScores: updatedStudentScores,
          maxScores: updatedMaxScores,
        };
      });
    } catch (err) {
      console.error("Failed to delete assessment:", err);
      setError("Failed to delete assessment.");
    }
  };

  const handleUpdateAssessment = useCallback(
    async (
      assessmentId: number,
      updates: Partial<Assessment> & {
        blooms_classification?: number[];
        course_outcome?: number[];
      }
    ) => {
      try {
        const updated = await updateAssessment(assessmentId, updates);

        setClassRecord((prev) => {
          // 1️⃣ Update the header tree (title, max score, etc.)
          const updatedHeaderNodes = updateAssessmentInTree(
            prev.headerNodes,
            assessmentId,
            updated
          );

          // 2️⃣ Recalculate student totals based on updated structure
          const updatedStudentScores = Object.fromEntries(
            Object.entries(prev.studentScores).map(([sid, scores]) => {
              const newScores = { ...scores };
              const { midterm, final } = calculateAllTermTotals(
                newScores,
                updatedHeaderNodes
              );
              newScores["midterm-total-grade"] = midterm;
              newScores["final-total-grade"] = final;
              return [sid, newScores];
            })
          );

          // 3️⃣ Update blooms/outcomes maps if provided
          const updatedBloomsMap = updated.blooms_classification
            ? {
                ...prev.assessmentBloomsMap,
                [assessmentId]: updated.blooms_classification,
              }
            : prev.assessmentBloomsMap;

          const updatedOutcomesMap = updated.course_outcome
            ? {
                ...prev.assessmentOutcomesMap,
                [assessmentId]: updated.course_outcome,
              }
            : prev.assessmentOutcomesMap;

          // 4️⃣ Update "current" selections if this assessment is open
          const updatedCurrentBlooms =
            updated.blooms_classification ?? prev.currentAssessmentBlooms;
          const updatedCurrentOutcomes =
            updated.course_outcome ?? prev.currentAssessmentOutcomes;

          return {
            ...prev,
            headerNodes: updatedHeaderNodes,
            studentScores: updatedStudentScores,
            assessmentBloomsMap: updatedBloomsMap,
            assessmentOutcomesMap: updatedOutcomesMap,
            currentAssessmentBlooms: updatedCurrentBlooms,
            currentAssessmentOutcomes: updatedCurrentOutcomes,
          };
        });
      } catch (err) {
        console.error("Failed to update assessment:", err);
        setError("Failed to update assessment.");
      }
    },
    [setClassRecord]
  );

  const handleEditAssessmentTitle = useCallback(
    (node: HeaderNode, event: React.MouseEvent<HTMLDivElement>) => {
      if (!canOpenPopup) return;
      setCanOpenPopup(false);

      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();

      setEditingAssessment({
        nodeKey: node.key!,
        value: node.title || "",
        coords: {
          x: rect.left - 0.5,
          y: rect.bottom - 0.5,
        },
      });

      setTimeout(() => setCanOpenPopup(true), 100);
    },
    [canOpenPopup]
  );

  const handleUpdateAssessmentTitle = useCallback(
    async (nodeKey: string, newValue: string) => {
      const assessmentId = Number(nodeKey);
      setClassRecord((prev) => ({
        ...prev,
        headerNodes: updateAssessmentInTree(prev.headerNodes, assessmentId, {
          assessment_title: newValue,
        }),
      }));

      await handleUpdateAssessment(assessmentId, {
        assessment_title: newValue,
      });

      setEditingAssessment(null);
    },
    [handleUpdateAssessment, setEditingAssessment, setClassRecord]
  );

  const handleEditAssessmentTitleCancel = useCallback(
    () => setEditingAssessment(null),
    [setEditingAssessment]
  );

  const handleStudentInputChange = useCallback(
    (index: number, field: keyof Student, value: string) => {
      setClassRecord((prev) => {
        const updatedStudents = [...prev.students];
        updatedStudents[index] = {
          ...updatedStudents[index],
          [field]: value,
        };

        return {
          ...prev,
          students: updatedStudents,
        };
      });
    },
    [setClassRecord]
  );

  const handleScoreChange = useCallback(
    async (studentId: number, assessmentId: number, value: number | null) => {
      try {
        await updateRawScore(studentId, assessmentId, value);

        setClassRecord((prev) => {
          const updatedScores = { ...prev.studentScores };
          const studentScores = updatedScores[studentId] || {};

          updatedScores[studentId] = {
            ...studentScores,
            [assessmentId]: value,
          };

          return {
            ...prev,
            studentScores: updatedScores,
          };
        });
      } catch (error) {
        console.error("Failed to update raw score:", error);
      }
    },
    [setClassRecord]
  );

  const handleOpenAssessmentInfo = useCallback(
    (e: React.MouseEvent, assessmentId: number) => {
      const rect = (e.target as HTMLElement).getBoundingClientRect();

      setAssessmentInfoContextMenu({
        visible: true,
        x: rect.left,
        y: rect.bottom + window.scrollY,
        assessmentId,
      });

      setClassRecord((prev) => ({
        ...prev,
        currentAssessmentBlooms:
          prev.assessmentBloomsMap[String(assessmentId)] ?? [],
        currentAssessmentOutcomes:
          prev.assessmentOutcomesMap[String(assessmentId)] ?? [],
      }));
    },
    [setAssessmentInfoContextMenu, setClassRecord]
  );

  const handleCloseAssessmentInfo = () => {
    setAssessmentInfoContextMenu({ visible: false, x: 0, y: 0 });
  };

  const handleRightClickRow = useCallback(
    (e: React.MouseEvent, studentId: number) => {
      e.preventDefault();
      setAssessmentContextMenu((prev) => ({ ...prev, visible: false }));
      setStudentContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        studentId,
      });
    },
    [setStudentContextMenu]
  );

  const handleCloseMenus = () => {
    setStudentContextMenu((prev) => ({ ...prev, visible: false }));
    setAssessmentContextMenu((prev) => ({ ...prev, visible: false }));
    setComponentContextMenu((prev) => ({ ...prev, visible: false }));
  };

  const handleRightClickNode = (e: React.MouseEvent, node: HeaderNode) => {
    e.preventDefault();
    setStudentContextMenu((prev) => ({ ...prev, visible: false }));
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

  return {
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
    setStudentContextMenu,
    assessmentContextMenu,
    setAssessmentContextMenu,
    componentContextMenu,
    setComponentContextMenu,
    assessmentInfoContextMenu,
    editingAssessment,
    setEditingAssessment,
    handleEditAssessmentTitle,
    handleUpdateAssessmentTitle,
    handleEditAssessmentTitleCancel,
    handleOpenAssessmentInfo,
    handleCloseMenus,
    handleCloseAssessmentInfo,
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
  };
}
