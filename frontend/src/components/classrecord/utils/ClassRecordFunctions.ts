import type { HeaderNode } from "../types/headerConfigTypes";
import type { Assessment, Student } from "../../../types/classRecordTypes";

type ComputedType = "computedWeighted" | "computedRounded" | undefined;

interface ComputedContentResult {
  content: string;
  valueNum: number | null;
  type: ComputedType;
  textClass: string;
}

export function countLeaves(node: HeaderNode): number {
  return node.children.length === 0
    ? node.colSpan || 1
    : node.children.map(countLeaves).reduce((a, b) => a + b, 0);
}

export function getMaxDepth(node: HeaderNode): number {
  return node.children.length === 0
    ? 1
    : 1 + Math.max(...node.children.map(getMaxDepth));
}

export function getTotalLeafCount(nodes: HeaderNode[]): number {
  return nodes
    .filter((node) => node.type !== "h-separator")
    .map(countLeaves)
    .reduce((a, b) => a + b, 0);
}

export function collectMaxScores(nodes: HeaderNode[]): Record<string, number> {
  const scores: Record<string, number> = {};
  function collect(node: HeaderNode) {
    if (
      node.key &&
      node.maxScore !== undefined &&
      node.calculationType === "assignment"
    ) {
      scores[node.key] = node.maxScore ?? 0;
    }
    node.children.forEach(collect);
  }
  nodes.forEach(collect);
  return scores;
}

export function formatValue(value: number, type?: string): string {
  if (["gradePoint", "totalGradePoint"].includes(type ?? "")) {
    return value.toFixed(3);
  } else if (type === "roundedGrade" || type === "computedRounded") {
    return value.toFixed(2);
  } else if (type === "computedWeighted") {
    return value.toFixed(2);
  } else {
    return Math.floor(value).toString();
  }
}

export function getHeaderClass(node: HeaderNode): string {
  const baseBorder = "border border-[#E9E6E6]";

  if (node.title === "" && node.nodeType !== "assessment") {
    return `bg-ucap-yellow ${baseBorder}`;
  }

  if (["Midterm", "Final"].includes(node.title)) {
    return `bg-ucap-yellow ${baseBorder}`;
  }

  if (node.calculationType === "roundedGrade") {
    return `bg-ucap-yellow ${baseBorder}`;
  }

  if (["Lecture", "Laboratory"].includes(node.title)) {
    return `bg-coa-yellow !text-center ${baseBorder}`;
  }

  switch (node.nodeType) {
    case "term":
      return `bg-light-blue ${baseBorder}`;
    case "unit":
      return `bg-ucap-yellow ${baseBorder}`;
    case "component":
      return `bg-coa-yellow ${baseBorder}`;
    case "assessment":
      return `bg-transparent font-normal ${baseBorder}`;
    case "computed":
      return `bg-ucap-green text-white text-2xl ${baseBorder}`;
    default:
      return "";
  }
}

export function getHeaderWidth(node: HeaderNode): string {
  let width = "min-w-[100px]";

  switch (node.key) {
    case "computed-half-weighted":
    case "computed-third-weighted":
      width = "w-[100px]";
      break;

    case "computed-half-for-removal":
    case "computed-third-for-removal":
      width = "w-[100px]";
      break;

    case "computed-half-after-removal":
    case "computed-third-after-removal":
      width = "w-[100px]";
      break;

    case "computed-half-desc":
    case "computed-third-desc":
      width = "w-[100px]";
      break;

    case "computed-remarks":
      width = "w-[100px]";
      break;

    default:
      break;
  }

  return width;
}

export function getCalculatedBg(type?: string): string {
  if (type === "gradePoint") return "bg-pale-green";
  if (type === "roundedGrade") return "bg-ucap-yellow";
  return "";
}

export function getTextClass(value: number, type?: string): string {
  if (
    [
      "gradePoint",
      "totalGradePoint",
      "roundedGrade",
      "computedRounded",
      "computedWeighted",
    ].includes(type ?? "") &&
    value > 3.0
  ) {
    return "text-coa-red";
  }
  return "text-coa-blue";
}

export function getDesc(g: number): string {
  if (g > 3.0) return "N/A";
  if (g <= 1.25) return "Excellent";
  if (g <= 1.75) return "Very Good";
  if (g <= 2.25) return "Good";
  if (g <= 2.75) return "Average";
  if (g === 3.0) return "Passing";
  return "N/A";
}
// ===================================================
export function updateHeaderNodeTitle(
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

export const getAllAssessmentNodesPure = (
  nodes: HeaderNode[]
): HeaderNode[] => {
  const accumulator: HeaderNode[] = [];
  const traverse = (currentNodes: HeaderNode[]) => {
    currentNodes.forEach((node) => {
      if (node.nodeType === "assessment" && node.key) {
        accumulator.push(node);
      }
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    });
  };
  traverse(nodes);
  return accumulator;
};

export function calculateTermTotal(
  scores: Record<string, number>,
  term: "midterm" | "final",
  headerNodes: HeaderNode[]
): number {
  const allAssessmentNodes = getAllAssessmentNodesPure(headerNodes);

  return Object.keys(scores)
    .filter((k) => {
      const node = allAssessmentNodes.find(
        (n) => n.key === k && n.termType === term
      );
      return !!node;
    })
    .reduce((sum, k) => sum + (scores[k] || 0), 0);
}
export function initializeStudentScores(
  students: Student[],
  headers: HeaderNode[]
): Record<number, Record<string, number>> {
  const assessmentNodes = getAllAssessmentNodesPure(headers);
  const result: Record<number, Record<string, number>> = {};

  students.forEach((student) => {
    const scores: Record<string, number> = {};

    // Fill in from backend
    student.scores.forEach((s) => {
      const key = `${s.assessment_id}`;
      scores[key] = s.value ?? 0;
    });

    // Ensure all assessments exist even if missing in backend
    assessmentNodes.forEach((node) => {
      if (node.key && scores[node.key] === undefined) {
        scores[node.key] = 0;
      }
    });

    // Compute totals
    scores["midterm-total-grade"] = calculateTermTotal(
      scores,
      "midterm",
      headers
    );
    scores["final-total-grade"] = calculateTermTotal(scores, "final", headers);

    result[student.student_id] = scores;
  });

  return result;
}

// ===================================================

export function computeValues(
  baseScores: Record<string, number>,
  maxScores: Record<string, number>,
  nodes: HeaderNode[]
): Record<string, number> {
  const values: Record<string, number> = { ...baseScores };

  function traverse(node: HeaderNode) {
    node.children.forEach(traverse);

    if (
      node.key &&
      node.calculationType &&
      node.calculationType !== "assignment" &&
      node.calculationType !== "computed"
    ) {
      let value: number = 0;
      if (["sum", "percentage"].includes(node.calculationType)) {
        const groupSum =
          node.groupKeys?.reduce((s, k) => {
            return s + (values[k] || 0);
          }, 0) ?? 0;
        if (node.calculationType === "sum") {
          value = groupSum;
        } else {
          const maxGroupSum =
            node.groupKeys?.reduce((s, k) => s + (maxScores[k] || 0), 0) ?? 0;
          value = maxGroupSum > 0 ? (groupSum / maxGroupSum) * 100 : 0;
        }
      } else if (
        ["weightedAverage", "totalGradePoint"].includes(node.calculationType)
      ) {
        value =
          node.dependsOn?.reduce(
            (s, k, i) => s + (values[k] || 0) * (node.weights?.[i] ?? 0),
            0
          ) ?? 0;
      } else if (node.calculationType === "gradePoint") {
        const mga = values[node.dependsOn?.[0] ?? ""] ?? 0;
        const ratio = mga / 100;
        value = mga >= 70 ? 23 / 3 - (20 / 3) * ratio : 5 - (20 / 7) * ratio;
      } else if (node.calculationType === "roundedGrade") {
        const gp = values[node.dependsOn?.[0] ?? ""] ?? 0;
        const grades = [
          1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 3.25, 3.5, 3.75, 4.0,
          4.25, 4.5, 4.75, 5.0,
        ];
        value = grades.reduce((prev, curr) =>
          Math.abs(curr - gp) < Math.abs(prev - gp)
            ? curr
            : Math.abs(curr - gp) === Math.abs(prev - gp)
            ? Math.max(curr, prev)
            : prev
        );
      }
      values[node.key] = value;
    }
  }

  nodes.forEach(traverse);
  return values;
}

export function computeComputedContent(
  mid: number,
  fin: number,
  key: string
): ComputedContentResult {
  const grades = [
    1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 3.25, 3.5, 3.75, 4.0, 4.25,
    4.5, 4.75, 5.0,
  ];

  let raw = 0;
  let rounded = 0;
  let type: ComputedType = undefined;
  let content = "";
  let textClass = "";

  const roundToNearestGrade = (value: number) => {
    return grades.reduce(
      (prev, curr) =>
        Math.abs(curr - value) < Math.abs(prev - value)
          ? curr
          : Math.abs(curr - value) === Math.abs(prev - value)
          ? Math.max(curr, prev)
          : prev,
      grades[0]
    );
  };
  if (key === "computed-half-weighted") {
    raw = mid * 0.5 + fin * 0.5;
    content = formatValue(raw, "computedWeighted");
    type = "computedWeighted";
    textClass = getTextClass(raw, type);
  } else if (
    ["computed-half-for-removal", "computed-half-after-removal"].includes(key)
  ) {
    raw = Number((mid * 0.5 + fin * 0.5).toFixed(2));
    rounded = roundToNearestGrade(raw);
    content = formatValue(rounded, "computedRounded");
    type = "computedRounded";
    textClass = getTextClass(rounded, type);
  } else if (key === "computed-half-desc") {
    raw = Number((mid * 0.5 + fin * 0.5).toFixed(2));
    rounded = roundToNearestGrade(raw);
    content = getDesc(rounded);
    textClass = "text-coa-blue";
  } else if (key === "computed-third-weighted") {
    raw = mid * (1 / 3) + fin * (2 / 3);
    content = formatValue(raw, "computedWeighted");
    type = "computedWeighted";
    textClass = getTextClass(raw, type);
  } else if (
    ["computed-third-for-removal", "computed-third-after-removal"].includes(key)
  ) {
    raw = Number((mid * (1 / 3) + fin * (2 / 3)).toFixed(2));
    rounded = roundToNearestGrade(raw);
    content = formatValue(rounded, "computedRounded");
    type = "computedRounded";
    textClass = getTextClass(rounded, type);
  } else if (key === "computed-third-desc") {
    raw = Number((mid * (1 / 3) + fin * (2 / 3)).toFixed(2));
    rounded = roundToNearestGrade(raw);
    content = getDesc(rounded);
    textClass = "text-coa-blue";
  }

  return {
    content,
    valueNum: rounded || raw || null,
    type,
    textClass,
  };
}

export function updateAssessmentInTree(
  nodes: HeaderNode[],
  assessmentId: number,
  updates: Partial<Assessment>
): HeaderNode[] {
  return nodes.map((node) => {
    if (node.key === String(assessmentId)) {
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
        children: updateAssessmentInTree(node.children, assessmentId, updates),
      };
    }

    return node;
  });
}

export function findParentComponentNode(
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
