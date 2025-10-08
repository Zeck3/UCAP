import type { HeaderNode } from "./HeaderConfig";
import { useCallback, useMemo, useState, useEffect } from "react";
import { crpInfo } from "./ClassRecordDummy";
import {
  collectMaxScores,
  computeValues,
  getMaxDepth,
} from "./ClassRecordFunctions";
import BuildHeaderRow from "./BuildHeaderRow";
import BloomPopup from "./BloomPopup";
import BuildStudentRow from "./BuildStudentRow";
import type { Student } from "../../types/classRecordTypes";
import EditAssessmentPopup from "./EditAssessmentPopup";

interface ClassRecordComponentProps {
  headerConfig: HeaderNode[];
}

export default function ClassRecordComponent({
  headerConfig,
}: ClassRecordComponentProps) {
  // const [classRecord, setClassRecord] = useState(crpInfo);
  const [showPopup, setShowPopup] = useState(false);
  const [currentItem, setCurrentItem] = useState("");
  const [students, setStudents] = useState(() => crpInfo.students || []);
  const [headerNodes, setHeaderNodes] = useState<HeaderNode[]>(headerConfig);
  const [canOpenPopup, setCanOpenPopup] = useState<boolean>(true);
  const [editingAssessment, setEditingAssessment] = useState<{
    nodeKey: string;
    value: string;
    coords: { top: number; left: number; width: number; height: number };
  } | null>(null);
  const [bloomSelections, setBloomSelections] = useState<
    Record<string, string[]>
  >({});
  const [maxScores, setMaxScores] = useState(() =>
    collectMaxScores(headerConfig)
  );

  // Sync headerNodes with headerConfig prop changes (handles hot reload when headerConfig updates)
  useEffect(() => {
    setHeaderNodes(headerConfig);
  }, [headerConfig]);

  // When headerNodes change (e.g., via hot reload or title edits), sync maxScores and studentScores.
  useEffect(() => {
    // Sync maxScores
    setMaxScores((prev) => {
      const defaults = collectMaxScores(headerNodes);
      return { ...defaults, ...prev };
    });

    // Sync studentScores
    const assessmentNodes = getAllAssessmentNodes(headerNodes);
    const currentKeys = new Set(assessmentNodes.map((n) => n.key!).filter(Boolean));
    setStudentScores((prev) =>
      prev.map((scores) => {
        const newScores = { ...scores };

        // Remove keys for deleted assessments (cleans up state)
        for (let k in newScores) {
          if (!currentKeys.has(k)) {
            delete newScores[k];
          }
        }

        // Add missing keys for new assessments (set to 0)
        assessmentNodes.forEach((node) => {
          if (node.key && newScores[node.key] === undefined) {
            newScores[node.key] = 0;
          }
        });

        return newScores;
      })
    );
  }, [headerNodes]);

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

  const handleEditSave = (nodeKey: string, newValue: string) => {
    setHeaderNodes((prev) =>
      updateHeaderNodeTitle(prev, nodeKey, newValue)
    );
    setEditingAssessment(null);
  };

  const handleEditCancel = () => setEditingAssessment(null);

  function updateHeaderNodeTitle(
    nodes: HeaderNode[],
    nodeKey: string,
    newTitle: string
  ): HeaderNode[] {
    return nodes.map((n) => {
      if (n.key === nodeKey) return { ...n, title: newTitle };
      if (n.children)
        return {
          ...n,
          children: updateHeaderNodeTitle(n.children, nodeKey, newTitle),
        };
      return n;
    });
  }

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

  function calculateTermTotal(
    scores: Record<string, number>,
    term: "midterm" | "final"
  ) {
    return Object.keys(scores)
      .filter((k) => {
        const node = getAllAssessmentNodes(headerConfig).find(
          (n) => n.key === k && n.termType === term
        );
        return !!node;
      })
      .reduce((sum, k) => sum + (scores[k] || 0), 0);
  }

  const getAllAssessmentNodes = (
    nodes: HeaderNode[],
    accumulator: HeaderNode[] = []
  ): HeaderNode[] => {
    nodes.forEach((node) => {
      // Check for assessment type and ensure it has a key
      if (node.nodeType === "assessment" && node.key) {
        // We know this node is an assessment, push it to the accumulator
        accumulator.push(node);
      }
      // Recursively check children
      if (node.children && node.children.length > 0) {
        getAllAssessmentNodes(node.children, accumulator);
      }
    });
    return accumulator;
  };

  const [studentScores, setStudentScores] = useState<Record<string, number>[]>(() => {
    const assessmentNodes = getAllAssessmentNodes(headerConfig);

    return students.map((student) => {
      const scores: Record<string, number> = {};

      student.scores.forEach((s) => {
        const key = `${s.assessment_id}`;
        scores[key] = s.value ?? 0;
      });

      assessmentNodes.forEach((node) => {
        if (node.key && scores[node.key] === undefined) {
          scores[node.key] = 0;
        }
      });

      return scores;
    });
  });

  const [remarks, setRemarks] = useState<string[]>(students.map(() => ""));

  const computedMaxValues = useMemo(
    () => computeValues(maxScores, maxScores, headerNodes),
    [maxScores, headerNodes]
  );

  const computedStudentValues = useMemo(
    () =>
      studentScores.map((scores) =>
        computeValues(scores, maxScores, headerNodes)
      ),
    [studentScores, maxScores, headerNodes]
  );

  const openPopup = useCallback((title: string) => {
    setCurrentItem(title);
    setShowPopup(true);
  }, []);

  const closePopup = useCallback(() => setShowPopup(false), []);

  const handleCheckboxChange = useCallback(
    (level: string) => {
      setBloomSelections((prev) => {
        const selected = prev[currentItem] || [];
        const newSelected = selected.includes(level)
          ? selected.filter((l) => l !== level)
          : [...selected, level];
        return { ...prev, [currentItem]: newSelected };
      });
    },
    [currentItem]
  );

  const updateStudentScore = useCallback(
    (i: number, key: string, value: number) => {
      setStudentScores((prev) => {
        const copy = [...prev];
        copy[i] = { ...copy[i], [key]: value };
        copy[i]["midterm-total-grade"] = calculateTermTotal(copy[i], "midterm");
        copy[i]["final-total-grade"] = calculateTermTotal(copy[i], "final");
        return copy;
      });
    },
    []
  );

  const updateRemark = useCallback((studentIndex: number, value: string) => {
    setRemarks((prev) => {
      const newRemarks = [...prev];
      newRemarks[studentIndex] = value;
      return newRemarks;
    });
  }, []);

  const bloomLevels = [
    "Remember",
    "Understand",
    "Apply",
    "Analyze",
    "Evaluate",
    "Create",
  ];

  return (
    <>
      <thead>
        <BuildHeaderRow
          nodes={headerNodes}
          originalMaxDepth={Math.max(...headerConfig.map(getMaxDepth))}
          openPopup={openPopup}
          maxScores={maxScores}
          setMaxScores={setMaxScores}
          computedMaxValues={computedMaxValues}
          handleEditStart={handleEditStart}
        />
      </thead>
      <tbody>
        {students.map((student, i) => (
          <BuildStudentRow
            key={student.student_id}
            student={student}
            index={i}
            nodes={headerNodes}
            studentScore={studentScores[i]}
            computedValues={computedStudentValues[i]}
            maxScores={maxScores}
            remarks={remarks}
            updateRemark={updateRemark}
            handleInputChange={handleInputChange}
            updateScoreProp={updateStudentScore}
          />
        ))}
      </tbody>
      {showPopup && (
        <BloomPopup
          title="Bloom's Taxonomy"
          levels={bloomLevels}
          selections={bloomSelections}
          onClose={closePopup}
          onChange={handleCheckboxChange}
          currentItem={currentItem}
        />
      )}
      {editingAssessment && (
        <EditAssessmentPopup
          editingAssessment={editingAssessment}
          setEditingAssessment={setEditingAssessment}
          handleEditSave={handleEditSave}
          handleEditCancel={handleEditCancel}
        />
      )}
    </>
  );
}