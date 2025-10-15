import { useCallback, useMemo, useState, useEffect, startTransition } from "react";
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
  calculateTermTotal,
  collectMaxScores,
  computeValues,
  findParentComponentNode,
  getAllAssessmentNodesPure,
  initializeStudentScores,
  updateAssessmentInTree,
} from "../utils/ClassRecordFunctions";

export function useClassRecord() {
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

  const [bloomsOptions, setBloomsOptions] = useState<
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
    let isMounted = true;

    if (!section_id) return;

    async function fetchData() {
      setLoading(true);
      try {
        const data = await getClassRecord(Number(section_id));
        if (!isMounted) return;
        if (!data) throw new Error("No class record found");

        const fetchedStudents = data.students ?? [];
        const generatedHeaders = generateHeaderConfig(data);
        const defaults = collectMaxScores(generatedHeaders);

        const initialStudentScores = initializeStudentScores(
          fetchedStudents,
          generatedHeaders
        );

        startTransition(() => {
          setStudents(fetchedStudents);
          setHeaderNodes(generatedHeaders);
          setMaxScores(defaults);
          setStudentScores(initialStudentScores);
        });

        if (course_code) {
          const [blooms, outcomes] = await Promise.all([
            getBloomsOptions(),
            getCourseOutcomes(course_code),
          ]);

          if (!isMounted) return;

          const mappedBlooms = blooms.map((b) => ({
            id: b.blooms_classification_id,
            name: b.blooms_classification_type,
          }));

          const mappedOutcomes = outcomes.map((o) => ({
            id: o.course_outcome_id,
            name: o.course_outcome_code,
          }));

          startTransition(() => {
            setBloomsOptions(mappedBlooms);
            setOutcomesOptions(mappedOutcomes);
          });
        }

        const allAssessments = getAllAssessmentNodes(generatedHeaders);
        const infoRequests = allAssessments.map((node) =>
          getAssessmentInfo(Number(node.key))
            .then((info) => ({
              id: String(node.key),
              blooms: info.blooms_classification ?? [],
              outcomes: info.course_outcome ?? [],
            }))
            .catch(() => ({
              id: String(node.key),
              blooms: [],
              outcomes: [],
            }))
        );

        const infos = await Promise.all(infoRequests);
        if (!isMounted) return;

        const bloomsMap: Record<string, number[]> = {};
        const outcomesMap: Record<string, number[]> = {};

        infos.forEach((i) => {
          bloomsMap[i.id] = i.blooms;
          outcomesMap[i.id] = i.outcomes;
        });

        startTransition(() => {
          setAssessmentBloomsMap(bloomsMap);
          setAssessmentOutcomesMap(outcomesMap);
        });
      } catch (err) {
        console.error(err);
        if (isMounted) setError("Failed to load class record data.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [section_id, course_code, getAllAssessmentNodes]);

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
    setStudentScores((prev) => {
      let changed = false;
      const updated: Record<number, Record<string, number>> = {};

      for (const [studentIdStr, scores] of Object.entries(prev)) {
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

        const newMidtermTotal = calculateTermTotal(
          newScores,
          "midterm",
          headerNodes
        );
        const newFinalTotal = calculateTermTotal(
          newScores,
          "final",
          headerNodes
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
  }, [headerNodes, assessmentKeys, zeroMaxScoreKeys, setStudentScores]);

  useEffect(() => {
    if (!loading && headerNodes.length > 0 && students.length > 0) {
      syncStudentScores();
    }
  }, [loading, headerNodes, students, syncStudentScores]);

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
        let updatedTree: HeaderNode[] = [];
        setHeaderNodes((prev) => {
          updatedTree = updateAssessmentInTree(prev, assessmentId, updated);

          return updatedTree;
        });

        setStudentScores((prev) => {
          const copy = { ...prev };

          for (const scores of Object.values(copy)) {
            scores["midterm-total-grade"] = calculateTermTotal(
              scores,
              "midterm",
              updatedTree
            );
            scores["final-total-grade"] = calculateTermTotal(
              scores,
              "final",
              updatedTree
            );
          }

          return copy;
        });

        if (updated.blooms_classification) {
          setAssessmentBloomsMap((prev) => ({
            ...prev,
            [assessmentId]: updated.blooms_classification!,
          }));
          setCurrentAssessmentBlooms(updated.blooms_classification);
        }

        if (updated.course_outcome) {
          setAssessmentOutcomesMap((prev) => ({
            ...prev,
            [assessmentId]: updated.course_outcome!,
          }));
          setCurrentAssessmentOutcomes(updated.course_outcome);
        }
      } catch (err) {
        console.error("Failed to update assessment:", err);
      }
    },
    [
      setStudentScores,
      setAssessmentBloomsMap,
      setAssessmentOutcomesMap,
      setCurrentAssessmentBlooms,
      setCurrentAssessmentOutcomes,
    ]
  );

  const handleEditAssessmentTitle = useCallback(
    (node: HeaderNode, event: React.MouseEvent<HTMLDivElement>) => {
      if (!canOpenPopup) return;
      setCanOpenPopup(false);

      const rect = (event.target as HTMLElement).getBoundingClientRect();

      setEditingAssessment({
        nodeKey: node.key!,
        value: node.title || "",
        coords: {
          top: rect.bottom,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        },
      });
      window.setTimeout(() => setCanOpenPopup(true), 100);
    },
    [canOpenPopup, setCanOpenPopup, setEditingAssessment]
  );

  const handleUpdateAssessmentTitle = useCallback(
    async (nodeKey: string, newValue: string) => {
      const assessmentId = Number(nodeKey);
      setHeaderNodes((prev) =>
        updateAssessmentInTree(prev, assessmentId, {
          assessment_title: newValue,
        })
      );
      await handleUpdateAssessment(assessmentId, {
        assessment_title: newValue,
      });
      setEditingAssessment(null);
    },
    [handleUpdateAssessment, setEditingAssessment, setHeaderNodes]
  );

  const handleEditAssessmentTitleCancel = useCallback(
    () => setEditingAssessment(null),
    [setEditingAssessment]
  );

  const handleStudentInputChange = useCallback(
    (index: number, field: keyof Student, value: string) => {
      setStudents((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: value };
        return updated;
      });
    },
    []
  );

  const handleScoreChange = useCallback(
    async (studentId: number, assessmentId: number, value: number | null) => {
      try {
        await updateRawScore(studentId, assessmentId, value);
        setStudentScores((prev) => {
          const prevStudentScore = prev[studentId] || {};
          return {
            ...prev,
            [studentId]: {
              ...prevStudentScore,
              [assessmentId]: value,
            },
          };
        });
      } catch (error) {
        console.error("Failed to update raw score:", error);
      }
    },
    []
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
    },
    [setAssessmentInfoContextMenu]
  );

  const handleCloseAssessmentInfo = () => {
    setAssessmentInfoContextMenu({ visible: false, x: 0, y: 0 });
  };

  const handleRightClickRow = useCallback(
    (e: React.MouseEvent, studentId: number) => {
      e.preventDefault();
      setStudentContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        studentId,
      });
    },
    [setStudentContextMenu]
  );

  const handleCloseContextMenu = useCallback(() => {
    setStudentContextMenu({ visible: false, x: 0, y: 0 });
  }, []);

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
    handleCloseContextMenu,
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
