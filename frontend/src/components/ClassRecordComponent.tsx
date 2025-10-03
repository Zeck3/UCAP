// ClassRecordComponent.tsx (modified)
import type { HeaderNode } from "../data/TableHeaderConfig";
import type { JSX } from "react";
import { useMemo, useState } from "react";
import { crpInfo } from "../data/crpInfo";
import type { Student } from "../data/crpInfo";

interface ClassRecordComponentProps {
  headerConfig: HeaderNode[];
}

function countLeaves(node: HeaderNode): number {
  return node.children.length === 0
    ? node.colSpan || 1
    : node.children.map(countLeaves).reduce((a, b) => a + b, 0);
}

function getMaxDepth(node: HeaderNode): number {
  return node.children.length === 0
    ? 1
    : 1 + Math.max(...node.children.map(getMaxDepth));
}

function getTotalLeafCount(nodes: HeaderNode[]): number {
  return nodes
    .filter((node) => node.type !== "h-separator")
    .map(countLeaves)
    .reduce((a, b) => a + b, 0);
}

function renderTitleLines(title: string): JSX.Element | string {
  if (title.includes("\n")) {
    return (
      <div className="text-left">
        {title.split("\n").map((line, i) => (
          <div key={i} className="leading-tight whitespace-normal">
            {line}
          </div>
        ))}
      </div>
    );
  }
  return title;
}

function collectAssignmentKeys(nodes: HeaderNode[]): string[] {
  const keys: string[] = [];
  function collect(node: HeaderNode) {
    if (node.key && node.calculationType === "assignment") {
      keys.push(node.key);
    }
    node.children.forEach(collect);
  }
  nodes.forEach(collect);
  return keys;
}

function collectMaxScores(nodes: HeaderNode[]): Record<string, number> {
  const scores: Record<string, number> = {};
  function collect(node: HeaderNode) {
    if (node.key && node.maxScore !== undefined && node.calculationType === "assignment") {
      scores[node.key] = node.maxScore;
    }
    node.children.forEach(collect);
  }
  nodes.forEach(collect);
  return scores;
}

function computeValues(baseScores: Record<string, number>, maxScores: Record<string, number>, nodes: HeaderNode[]): Record<string, number> {
  const values: Record<string, number> = { ...baseScores };

  function traverse(node: HeaderNode) {
    node.children.forEach(traverse);

    if (node.key && node.calculationType && node.calculationType !== "assignment" && node.calculationType !== "computed") {
      let value: number = 0;
      if (["sum", "percentage"].includes(node.calculationType)) {
        const groupSum = node.groupKeys?.reduce((s, k) => s + (baseScores[k] || 0), 0) ?? 0;
        if (node.calculationType === "sum") {
          value = groupSum;
        } else { // percentage
          const maxGroupSum = node.groupKeys?.reduce((s, k) => s + (maxScores[k] || 0), 0) ?? 0;
          value = maxGroupSum > 0 ? (groupSum / maxGroupSum) * 100 : 0;
        }
      } else if (["weightedAverage", "totalGradePoint"].includes(node.calculationType)) {
        value = node.dependsOn?.reduce((s, k, i) => s + (values[k] || 0) * (node.weights?.[i] ?? 0), 0) ?? 0;
      } else if (node.calculationType === "gradePoint") {
        const mga = values[node.dependsOn?.[0] ?? ""] ?? 0;
        const ratio = mga / 100;
        value = mga >= 70 ? (23 / 3) - (20 / 3) * ratio : 5 - (20 / 7) * ratio;
      } else if (node.calculationType === "roundedGrade") {
        const gp = values[node.dependsOn?.[0] ?? ""] ?? 0;
        const grades = [1.00, 1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00, 3.25, 3.50, 3.75, 4.00, 4.25, 4.50, 4.75, 5.00];
        value = grades.reduce((prev, curr) =>
          Math.abs(curr - gp) < Math.abs(prev - gp) ? curr :
          Math.abs(curr - gp) === Math.abs(prev - gp) ? Math.max(curr, prev) : prev
        );
      }
      values[node.key] = value;
    }
  }

  nodes.forEach(traverse);
  return values;
}

function formatValue(value: number, type?: string): string {
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

function getHeaderClass(node: HeaderNode): string {
  const title = node.title;
  if (title === "Computed Final Grade") return "bg-ucap-green text-white text-lg";
  if (["Midterm Grade", "Final Grade"].includes(title) && node.children.length > 0) return "bg-light-blue";
  if (["Lecture (67%)", "Laboratory (33%)", "Midterm", "Final", ""].includes(title)) return "bg-ucap-yellow";
  if (
    title === "Class Standing Performance (10%)" ||
    (title.includes("Quiz/") && title.endsWith(" Performance Item (40%)")) ||
    title.endsWith(" Exam (30%)") ||
    title === "Per Inno Task (20%)" ||
    title === "Lecture" ||
    title === "Lab Exercises/Reports (30%)" ||
    title === "Hands-On Exercises (30%)" ||
    title === "Lab Major Exam (40%)" ||
    title === "Laboratory"
  ) return "bg-coa-yellow";
  if (node.calculationType === "roundedGrade") return "bg-ucap-yellow";
  if (node.computedGrades) return "text-sm";
  return "";
}

function getCalculatedBg(type?: string): string {
  if (type === "gradePoint") return "bg-pale-green";
  if (type === "roundedGrade") return "bg-ucap-yellow";
  return "";
}

function getTextClass(value: number, type?: string): string {
  if (["gradePoint", "totalGradePoint", "roundedGrade", "computedRounded", "computedWeighted"].includes(type ?? "") && value >= 3.00) {
    return "text-coa-red";
  }
  return "text-coa-blue";
}

function getDesc(g: number): string {
  if (g > 3.00) return "N/A";
  if (g <= 1.25) return "Excellent";
  if (g <= 1.75) return "Very Good";
  if (g <= 2.25) return "Good";
  if (g <= 2.75) return "Average";
  if (g === 3.00) return "Passing";
  return "N/A";
}

// Build rows of <th> elements
function buildHeaderRows(
  nodes: HeaderNode[],
  originalMaxDepth: number,
  openPopup: (title: string) => void,
  maxScores: Record<string, number>,
  setMaxScores: React.Dispatch<React.SetStateAction<Record<string, number>>>,
  computedMaxValues: Record<string, number>
): JSX.Element[][] {
  const newMaxDepth = originalMaxDepth + 1;
  const rows: JSX.Element[][] = Array.from({ length: newMaxDepth }, () => []);
  const hSeparators: JSX.Element[] = []; // collect h-separators
  const buttonRow: JSX.Element[] = []; // collect buttons for the extra row

  function build(node: HeaderNode, level: number) {
    if (node.type === "v-separator") {
      rows[level].push(
        <th
          key={`vsep-${level}-${node.title}`}
          rowSpan={newMaxDepth - level}
          className="bg-ucap-blue w-10 border border-ucap-blue"
        />
      );
      return;
    }

    if (node.type === "spacer") {
      rows[level].push(
        <th
          key={`spacer-${level}-${node.title}`}
          rowSpan={newMaxDepth - level}
          className="bg-white w-20 border border-gray-300"
        />
      );
      return;
    }

    if (node.type === "h-separator") {
      hSeparators.push(
        <th
          key={`hsep-${level}`}
          colSpan={getTotalLeafCount(nodes)}
          className="bg-ucap-blue h-10 border border-ucap-blue p-0"
        />
      );
      return;
    }

    // Default normal node
    const hasChildren = node.children.length > 0;
    const colSpan = node.colSpan || (hasChildren ? node.children.reduce((sum, child) => sum + countLeaves(child), 0) : 1);

    let rowSpan: number;
    if (node.customRowSpan) {
      rowSpan = node.customRowSpan;
    } else if (node.isRowSpan) {
      rowSpan = newMaxDepth - level;
    } else if (hasChildren) {
      rowSpan = 1;
    } else {
      rowSpan = 1;
    }

    // isLeafDeep for vertical text: apply to original deep leaves
    const isLeafDeep = !hasChildren && level === originalMaxDepth - 1 && !node.computedGrades;

    const headerClass = getHeaderClass(node);

    rows[level].push(
      <th
        key={`${level}-${node.title}`}
        colSpan={colSpan}
        rowSpan={rowSpan}
        className={`border border-gray-300 p-2 text-center ${headerClass} ${
          isLeafDeep ? "[writing-mode:vertical-rl] rotate-180 text-xs" : "whitespace-normal"
        }`}
      >
        {renderTitleLines(node.title)}
      </th>
    );

    if (hasChildren) {
      node.children.forEach((child) => build(child, level + rowSpan));
    }
  }

  function addButtons(node: HeaderNode) {
    if (["v-separator", "spacer", "h-separator"].includes(node.type || "")) {
      return;
    }
    if (node.isRowSpan) {
      return;
    }
    if (node.customRowSpan) {
      return;
    }
    if (node.calculationType === "computed") {
      return;
    }
    if (node.children.length > 0) {
      node.children.forEach(addButtons);
    } else {
      if (node.needsButton) {
        buttonRow.push(
          <th
            key={`button-${node.title}`}
            className="border border-gray-200 p-0 text-center"
          >
            <button
              onClick={() => openPopup(node.title)}
              className="w-full h-full bg-gray-300 hover:bg-gray-400 text-gray-800 text-xs py-1.5 px-2"
            >
              Info...
            </button>
          </th>
        );
      } else {
        let bgClass = "";
        if (node.calculationType === "roundedGrade") {
          bgClass = "bg-ucap-yellow";
        }
        buttonRow.push(
          <th
            key={`empty-${node.title}`}
            className={`border border-gray-300 p-2 text-center ${bgClass}`}
          />
        );
      }
    }
  }

  nodes.forEach((node) => build(node, 0));
  nodes.forEach((node) => addButtons(node));

  // Insert button row at the end of the header rows (before h-separators)
  if (buttonRow.length > 0) {
    rows[originalMaxDepth] = buttonRow;
  }

  // Append horizontal separator row
  if (hSeparators.length > 0) {
    rows.push(hSeparators);
  }

  // Build sub row for student headers and max scores
  const subRow = buildSubRow(nodes, maxScores, setMaxScores, computedMaxValues);
  if (subRow.length > 0) {
    rows.push(subRow);
  }

  // Filter out any empty rows (though unlikely)
  return rows.filter((row) => row.length > 0);
}

function buildSubRow(
  nodes: HeaderNode[],
  maxScores: Record<string, number>,
  setMaxScores: React.Dispatch<React.SetStateAction<Record<string, number>>>,
  computedMaxValues: Record<string, number>
): JSX.Element[] {
  const subRow: JSX.Element[] = [];

  function computeComputedValue(mid: number, fin: number, key: string): { content: string; valueNum?: number; type?: string; textClass: string } {
    const grades = [1.00, 1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00, 3.25, 3.50, 3.75, 4.00, 4.25, 4.50, 4.75, 5.00];
    let raw = 0;
    let rounded = 0;
    let type: string | undefined;
    let content = "";
    let textClass = "";

    if (key === "computed-half-weighted") {
      raw = mid * 0.5 + fin * 0.5;
      content = formatValue(raw, "computedWeighted");
      type = "computedWeighted";
      textClass = getTextClass(raw, type);
    } else if (key === "computed-half-for-removal" || key === "computed-half-after-removal") {
      raw = mid * 0.5 + fin * 0.5;
      raw = Number(raw.toFixed(2)); // Added: Round raw to match displayed value for consistent closeness calculation
      rounded = grades.reduce((prev, curr) =>
        Math.abs(curr - raw) < Math.abs(prev - raw) ? curr :
        Math.abs(curr - raw) === Math.abs(prev - raw) ? Math.max(curr, prev) : prev, grades[0]);
      content = formatValue(rounded, "computedRounded");
      type = "computedRounded";
      textClass = getTextClass(rounded, type);
    } else if (key === "computed-half-desc") {
      raw = mid * 0.5 + fin * 0.5;
      raw = Number(raw.toFixed(2)); // Added: Round raw to match displayed value for consistent closeness calculation
      rounded = grades.reduce((prev, curr) =>
        Math.abs(curr - raw) < Math.abs(prev - raw) ? curr :
        Math.abs(curr - raw) === Math.abs(prev - raw) ? Math.max(curr, prev) : prev, grades[0]);
      content = getDesc(rounded);
      textClass = "text-coa-blue";
    } else if (key === "computed-third-weighted") {
      raw = mid * (1 / 3) + fin * (2 / 3);
      content = formatValue(raw, "computedWeighted");
      type = "computedWeighted";
      textClass = getTextClass(raw, type);
    } else if (key === "computed-third-for-removal" || key === "computed-third-after-removal") {
      raw = mid * (1 / 3) + fin * (2 / 3);
      raw = Number(raw.toFixed(2)); // Added: Round raw to match displayed value for consistent closeness calculation
      rounded = grades.reduce((prev, curr) =>
        Math.abs(curr - raw) < Math.abs(prev - raw) ? curr :
        Math.abs(curr - raw) === Math.abs(prev - raw) ? Math.max(curr, prev) : prev, grades[0]);
      content = formatValue(rounded, "computedRounded");
      type = "computedRounded";
      textClass = getTextClass(rounded, type);
    } else if (key === "computed-third-desc") {
      raw = mid * (1 / 3) + fin * (2 / 3);
      raw = Number(raw.toFixed(2)); // Added: Round raw to match displayed value for consistent closeness calculation
      rounded = grades.reduce((prev, curr) =>
        Math.abs(curr - raw) < Math.abs(prev - raw) ? curr :
        Math.abs(curr - raw) === Math.abs(prev - raw) ? Math.max(curr, prev) : prev, grades[0]);
      content = getDesc(rounded);
      textClass = "text-coa-blue";
    } else if (key === "computed-remarks") {
      content = "";
    }

    return { content, valueNum: rounded, type, textClass };
  }

  function addToSub(node: HeaderNode) {
    if (node.type === "v-separator") {
      subRow.push(<th key={`sub-vsep-${node.title}`} className="bg-ucap-blue w-10 border border-ucap-blue" />);
      return;
    }

    if (node.type === "spacer") {
      subRow.push(<th key={`sub-spacer-${node.title}`} className="bg-white w-20 border border-gray-300" />);
      return;
    }

    if (node.type === "h-separator") {
      return; // skip
    }

    if (node.studentInfo) {
      subRow.push(<th key={`sub-student-no`} className="border border-gray-300 p-2 text-center">No.</th>);
      subRow.push(<th key={`sub-student-id`} className="border border-gray-300 p-2 text-center">Student ID</th>);
      subRow.push(<th key={`sub-student-name`} className="border border-gray-300 p-2 text-center">Name</th>);
      return;
    }

    if (node.children.length > 0) {
      node.children.forEach(addToSub);
    } else {
      let content: string | JSX.Element = "";
      let bgClass = getCalculatedBg(node.calculationType);
      let textClass = "";
      let type = node.calculationType;

      if (node.key && node.maxScore !== undefined && node.calculationType === "assignment") {
        content = (
          <input
            type="number"
            value={maxScores[node.key]}
            onChange={(e) => {
              const newValue = Number(e.target.value);
              setMaxScores((prev) => ({ ...prev, [node.key!]: newValue }));
            }}
            className="w-full text-center bg-transparent border-none focus:outline-none text-coa-blue"
          />
        );
      } else if (node.key && computedMaxValues[node.key] !== undefined) {
        content = formatValue(computedMaxValues[node.key], node.calculationType);
        textClass = getTextClass(computedMaxValues[node.key], type);
      } else if (node.calculationType === "computed" && node.key) {
        const mid = computedMaxValues["midterm-total-grade"] || 0;
        const fin = computedMaxValues["final-total-grade"] || 0;
        const { content: compContent, textClass: compTextClass } = computeComputedValue(mid, fin, node.key);
        content = compContent;
        textClass = compTextClass;
      }

      subRow.push(
        <th
          key={`sub-${node.title}`}
          className={`border border-gray-300 p-2 text-center ${bgClass} ${textClass}`}
        >
          {content}
        </th>
      );
    }
  }

  nodes.forEach(addToSub);
  return subRow;
}

function buildStudentRow(
  student: Student,
  index: number,
  nodes: HeaderNode[],
  studentScore: Record<string, number>,
  updateScore: (key: string, value: number) => void,
  computedValues: Record<string, number>,
  maxScores: Record<string, number>,
  remarks: string[],
  updateRemark: (i: number, v: string) => void
): JSX.Element {
  const row: JSX.Element[] = [];

  function computeComputedContent(mid: number, fin: number, key: string, isStudent: boolean, index?: number): { content: string | JSX.Element; textClass: string; bgClass: string } {
    const grades = [1.00, 1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00, 3.25, 3.50, 3.75, 4.00, 4.25, 4.50, 4.75, 5.00];
    let raw = 0;
    let rounded = 0;
    let type: string | undefined;
    let cont: string | JSX.Element = "";
    let textClass = "";
    let bgClass = "";

    if (key === "computed-half-weighted") {
      raw = mid * 0.5 + fin * 0.5;
      cont = formatValue(raw, "computedWeighted");
      type = "computedWeighted";
      textClass = getTextClass(raw, type);
      bgClass = getCalculatedBg(type);
    } else if (key === "computed-half-for-removal" || key === "computed-half-after-removal") {
      raw = mid * 0.5 + fin * 0.5;
      raw = Number(raw.toFixed(2)); // Added: Round raw to match displayed value for consistent closeness calculation
      rounded = grades.reduce((prev, curr) =>
        Math.abs(curr - raw) < Math.abs(prev - raw) ? curr :
        Math.abs(curr - raw) === Math.abs(prev - raw) ? Math.max(curr, prev) : prev, grades[0]);
      cont = formatValue(rounded, "computedRounded");
      type = "computedRounded";
      textClass = getTextClass(rounded, type);
      bgClass = getCalculatedBg(type);
    } else if (key === "computed-half-desc") {
      raw = mid * 0.5 + fin * 0.5;
      raw = Number(raw.toFixed(2)); // Added: Round raw to match displayed value for consistent closeness calculation
      rounded = grades.reduce((prev, curr) =>
        Math.abs(curr - raw) < Math.abs(prev - raw) ? curr :
        Math.abs(curr - raw) === Math.abs(prev - raw) ? Math.max(curr, prev) : prev, grades[0]);
      cont = getDesc(rounded);
      textClass = "text-coa-blue";
    } else if (key === "computed-third-weighted") {
      raw = mid * (1 / 3) + fin * (2 / 3);
      cont = formatValue(raw, "computedWeighted");
      type = "computedWeighted";
      textClass = getTextClass(raw, type);
      bgClass = getCalculatedBg(type);
    } else if (key === "computed-third-for-removal" || key === "computed-third-after-removal") {
      raw = mid * (1 / 3) + fin * (2 / 3);
      raw = Number(raw.toFixed(2)); // Added: Round raw to match displayed value for consistent closeness calculation
      rounded = grades.reduce((prev, curr) =>
        Math.abs(curr - raw) < Math.abs(prev - raw) ? curr :
        Math.abs(curr - raw) === Math.abs(prev - raw) ? Math.max(curr, prev) : prev, grades[0]);
      cont = formatValue(rounded, "computedRounded");
      type = "computedRounded";
      textClass = getTextClass(rounded, type);
      bgClass = getCalculatedBg(type);
    } else if (key === "computed-third-desc") {
      raw = mid * (1 / 3) + fin * (2 / 3);
      raw = Number(raw.toFixed(2)); // Added: Round raw to match displayed value for consistent closeness calculation
      rounded = grades.reduce((prev, curr) =>
        Math.abs(curr - raw) < Math.abs(prev - raw) ? curr :
        Math.abs(curr - raw) === Math.abs(prev - raw) ? Math.max(curr, prev) : prev, grades[0]);
      cont = getDesc(rounded);
      textClass = "text-coa-blue";
    } else if (key === "computed-remarks") {
      if (isStudent && index !== undefined) {
        cont = (
          <select
            value={remarks[index]}
            onChange={(e) => updateRemark(index, e.target.value)}
            className="w-full text-center bg-transparent border-none focus:outline-none"
          >
            <option value=""></option>
            <option value="INC">INC</option>
            <option value="Withdrawn">Withdrawn</option>
            <option value="DF">DF</option>
            <option value="OD">OD</option>
          </select>
        );
      } else {
        cont = "";
      }
    }

    return { content: cont, textClass, bgClass };
  }

  function addToRow(node: HeaderNode) {
    if (node.type === "v-separator") {
      row.push(
        <td
          key={`student-vsep-${node.title}-${index}`}
          className="bg-ucap-blue w-10 border border-ucap-blue"
        />
      );
      return;
    }

    if (node.type === "spacer") {
      row.push(
        <td
          key={`student-spacer-${node.title}-${index}`}
          className="bg-white w-20 border border-gray-300"
        />
      );
      return;
    }

    if (node.type === "h-separator") {
      return; // skip
    }

    if (node.children.length > 0) {
      node.children.forEach(addToRow);
    } else {
      // leaf
      const effectiveColSpan = node.colSpan || 1;
      if (node.isRowSpan) {
        // add three student cells
        row.push(<td key={`student-no-${index}`} className="border border-gray-300 p-2 text-left">{index + 1}</td>);
        row.push(<td key={`student-id-${index}`} className="border border-gray-300 p-2 text-left">{student.studentId}</td>);
        row.push(<td key={`student-name-${index}`} className="border border-gray-300 p-2 text-left">{`${student.fName}, ${student.lName}`}</td>);
      } else {
        let content: JSX.Element | string = "";
        let isCalculated = false;
        let textClass = "";
        let bgClass = getCalculatedBg(node.calculationType);
        if (node.calculationType === "assignment" && node.key) {
          content = (
            <input
              type="number"
              min={0} // Added: Minimum score limit
              max={maxScores[node.key]} // Added: Maximum score limit based on maxScore
              value={node.key ? studentScore[node.key] : ""}
              onChange={(e) => {
                if (node.key) {
                  const newValue = Number(e.target.value);
                  // Optional: Enforce max in JS too (since HTML max is advisory)
                  if (newValue <= maxScores[node.key]) {
                    updateScore(node.key, newValue);
                  }
                }
              }}
              className="w-full text-center bg-transparent border-none focus:outline-none" // Removed text-coa-blue
            />
          );
        } else if (node.key && computedValues[node.key] !== undefined) {
          content = formatValue(computedValues[node.key], node.calculationType);
          isCalculated = true;
          const value = computedValues[node.key];
          textClass = getTextClass(value, node.calculationType);
        } else if (node.calculationType === "computed" && node.key) {
          const mid = computedValues["midterm-total-grade"] || 0;
          const fin = computedValues["final-total-grade"] || 0;
          const { content: compContent, textClass: compTextClass, bgClass: compBgClass } = computeComputedContent(mid, fin, node.key, true, index);
          content = compContent;
          isCalculated = true;
          textClass = compTextClass;
          bgClass = compBgClass;
        }
        row.push(
          <td
            key={`student-${node.title}-${index}`}
            colSpan={effectiveColSpan}
            className={`border border-gray-300 p-2 text-center ${bgClass} ${textClass}`}
          >
            {content}
          </td>
        );
      }
    }
  }

  nodes.forEach(addToRow);
  return <tr key={index}>{row}</tr>;
}

export default function ClassRecordComponent({
  headerConfig,
}: ClassRecordComponentProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [currentItem, setCurrentItem] = useState("");
  const [bloomSelections, setBloomSelections] = useState<Record<string, string[]>>({});
  const [maxScores, setMaxScores] = useState(collectMaxScores(headerConfig));

  const assignmentKeys = useMemo(() => collectAssignmentKeys(headerConfig), []);

  const students = crpInfo.students || [];
  const [studentScores, setStudentScores] = useState(students.map((student) => {
    const scoreObj: Record<string, number> = {};
    assignmentKeys.forEach((key, idx) => {
      scoreObj[key] = student.scores?.[idx] ?? 0; // Map array index to key, default to 0
    });
    return scoreObj;
  }));
  const [remarks, setRemarks] = useState<string[]>(students.map(() => ""));

  const computedMaxValues = useMemo(
    () => computeValues(maxScores, maxScores, headerConfig),
    [maxScores]
  );

  const computedStudentValues = useMemo(
    () => studentScores.map((scores) => computeValues(scores, maxScores, headerConfig)),
    [studentScores, maxScores]
  );

  const openPopup = (title: string) => {
    setCurrentItem(title);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const handleCheckboxChange = (level: string) => {
    const selected = bloomSelections[currentItem] || [];
    const newSelected = selected.includes(level)
      ? selected.filter((l) => l !== level)
      : [...selected, level];
    setBloomSelections({
      ...bloomSelections,
      [currentItem]: newSelected,
    });
  };

  const updateStudentScore = (studentIndex: number, key: string, value: number) => {
    setStudentScores((prev) => {
      const newScores = [...prev];
      newScores[studentIndex] = { ...newScores[studentIndex], [key]: value };
      return newScores;
    });
  };

  const updateRemark = (studentIndex: number, value: string) => {
    setRemarks((prev) => {
      const newRemarks = [...prev];
      newRemarks[studentIndex] = value;
      return newRemarks;
    });
  };

  const bloomLevels = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];

  const originalMaxDepth = Math.max(...headerConfig.map(getMaxDepth));
  const headerRows = buildHeaderRows(headerConfig, originalMaxDepth, openPopup, maxScores, setMaxScores, computedMaxValues);

  return (
    <>
      <thead>
        {headerRows.map((row, idx) => (
          <tr key={idx}>{row}</tr>
        ))}
      </thead>
      <tbody>
        {students.map((student, i) => (
          buildStudentRow(
            student,
            i,
            headerConfig,
            studentScores[i],
            (key, value) => updateStudentScore(i, key, value),
            computedStudentValues[i],
            maxScores,
            remarks,
            updateRemark
          )
        ))}
      </tbody>
      {showPopup && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) closePopup();
          }}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex items-center mb-4">
              <button onClick={closePopup} className="text-gray-600 hover:text-gray-800">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="ml-2 text-lg font-semibold">Bloom's Taxonomy</h2>
            </div>
            <hr className="border-t border-gray-300 mb-4" />
            <div className="grid grid-cols-3 gap-4">
              {bloomLevels.map((level) => (
                <label key={level} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(bloomSelections[currentItem] || []).includes(level)}
                    onChange={() => handleCheckboxChange(level)}
                    className="form-checkbox"
                  />
                  <span>{level}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}