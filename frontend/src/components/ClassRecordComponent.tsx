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
    if (
      node.key &&
      node.maxScore !== undefined &&
      node.calculationType === "assignment"
    ) {
      scores[node.key] = node.maxScore;
    }
    node.children.forEach(collect);
  }
  nodes.forEach(collect);
  return scores;
}

function computeValues(
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
          node.groupKeys?.reduce((s, k) => s + (baseScores[k] || 0), 0) ?? 0;
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
  if (title === "Computed Final Grade")
    return "bg-ucap-green text-white text-lg";
  if (
    ["Midterm Grade", "Final Grade"].includes(title) &&
    node.children.length > 0
  )
    return "bg-light-blue";
  if (
    ["Lecture (67%)", "Laboratory (33%)", "Midterm", "Final", ""].includes(
      title
    )
  )
    return "bg-ucap-yellow";
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
  )
    return "bg-coa-yellow";
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

function getDesc(g: number): string {
  if (g > 3.0) return "N/A";
  if (g <= 1.25) return "Excellent";
  if (g <= 1.75) return "Very Good";
  if (g <= 2.25) return "Good";
  if (g <= 2.75) return "Average";
  if (g === 3.0) return "Passing";
  return "N/A";
}

function buildHeaderRows(
  nodes: HeaderNode[],
  originalMaxDepth: number,
  openPopup: (title: string) => void,
  maxScores: Record<string, number>,
  setMaxScores: React.Dispatch<React.SetStateAction<Record<string, number>>>,
  computedMaxValues: Record<string, number>,
  columnWidths: Record<string, number>,
  setColumnWidths: React.Dispatch<React.SetStateAction<Record<string, number>>>
): JSX.Element[][] {
  const newMaxDepth = originalMaxDepth + 1;
  const rows: JSX.Element[][] = Array.from({ length: newMaxDepth }, () => []);
  const hSeparators: JSX.Element[] = [];
  const buttonRow: JSX.Element[] = [];

  function build(node: HeaderNode, level: number) {
    if (node.type === "v-separator") {
      const handleMouseDown = createResizeHandler(
        setColumnWidths,
        `col-${level}-${node.title}`
      );

      rows[level].push(
        <th
          key={`vsep-${level}-${node.title}`}
          rowSpan={newMaxDepth - level}
          className="bg-ucap-blue w-1 border border-ucap-blue relative cursor-col-resize"
          onMouseDown={handleMouseDown}
        >
          <div className="absolute top-0 right-0 h-full w-1 cursor-col-resize" />
        </th>
      );
      return;
    }

    if (node.type === "spacer") {
      rows[level].push(
        <th
          key={`spacer-${level}-${node.title}`}
          rowSpan={newMaxDepth - level}
          className="bg-white border border-[#E9E6E6]"
        />
      );
      return;
    }

    if (node.type === "h-separator") {
      hSeparators.push(
        <th
          key={`hsep-${level}`}
          colSpan={getTotalLeafCount(nodes)}
          className="bg-ucap-blue h-4 border border-ucap-blue p-0"
        />
      );
      return;
    }

    const hasChildren = node.children.length > 0;
    const colSpan =
      node.colSpan ||
      (hasChildren
        ? node.children.reduce((sum, child) => sum + countLeaves(child), 0)
        : 1);

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

    const isLeafDeep =
      !hasChildren && level === originalMaxDepth - 1 && !node.computedGrades;

    const headerClass = getHeaderClass(node);

    rows[level].push(
      <th
        key={`${level}-${node.title}`}
        colSpan={colSpan}
        rowSpan={rowSpan}
        className={`border border-[#E9E6E6] p-2 text-center ${headerClass} ${
          isLeafDeep
            ? "[writing-mode:vertical-rl] text-left rotate-180 text-xs"
            : "whitespace-normal"
        } ${node.calculationType ? "w-[3.75rem]" : ""}`}
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
            className={`border border-gray-200 p-0 text-center ${
              node.calculationType ? "w-[3.75rem]" : ""
            }`}
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
            className={`border border-[#E9E6E6] p-2 text-center ${bgClass} ${
              node.calculationType ? "w-[3.75rem]" : ""
            }`}
          />
        );
      }
    }
  }

  nodes.forEach((node) => build(node, 0));
  nodes.forEach((node) => addButtons(node));

  if (buttonRow.length > 0) {
    rows[originalMaxDepth] = buttonRow;
  }

  if (hSeparators.length > 0) {
    rows.push(hSeparators);
  }

  const subRow = buildSubRow(
    nodes,
    maxScores,
    setMaxScores,
    computedMaxValues,
    columnWidths,
    setColumnWidths
  );
  if (subRow.length > 0) {
    rows.push(subRow);
  }

  return rows.filter((row) => row.length > 0);
}

function buildSubRow(
  nodes: HeaderNode[],
  maxScores: Record<string, number>,
  setMaxScores: React.Dispatch<React.SetStateAction<Record<string, number>>>,
  computedMaxValues: Record<string, number>,
  columnWidths: Record<string, number>,
  setColumnWidths: React.Dispatch<React.SetStateAction<Record<string, number>>>
): JSX.Element[] {
  const subRow: JSX.Element[] = [];

  function build(node: HeaderNode) {
    if (node.type === "v-separator") {
      const handleMouseDown = createResizeHandler(
        setColumnWidths,
        `sub-col-${node.title}`
      );

      subRow.push(
        <th
          key={`vsep-${node.title}`}
          className="bg-ucap-blue w-1 border border-ucap-blue relative cursor-col-resize"
          onMouseDown={handleMouseDown}
        >
          <div className="absolute top-0 right-0 h-full w-1 cursor-col-resize" />
        </th>
      );
      return;
    }

    if (node.type === "spacer") {
      subRow.push(
        <th
          key={`sub-spacer-${node.title}`}
          className="bg-white w-20 border border-[#E9E6E6]"
        />
      );
      return;
    }

    if (node.type === "h-separator") {
      return;
    }

    if (node.isRowSpan) {
      subRow.push(
        <th
          key={`sub-no`}
          className="border border-[#E9E6E6] p-2 text-left font-bold"
        >
          No.
        </th>
      );
      subRow.push(
        <th
          key={`sub-id`}
          className="border border-[#E9E6E6] p-2 text-left font-bold"
        >
          Student ID
        </th>
      );
      subRow.push(
        <th
          key={`sub-name`}
          className="border border-[#E9E6E6] p-2 text-left font-bold"
        >
          Name
        </th>
      );
      return;
    }

    if (node.children.length > 0) {
      node.children.forEach(build);
    } else {
      let content: JSX.Element | string | number = "";
      let bgClass = getCalculatedBg(node.calculationType);
      let textClass = "";
      if (node.calculationType === "assignment" && node.key) {
        content = (
          <input
            type="number"
            value={node.key ? maxScores[node.key] : ""}
            onChange={(e) => {
              if (node.key) {
                if (typeof node.key === "string") {
                  setMaxScores((prev) => ({
                    ...prev,
                    [node.key as string]: Number(e.target.value),
                  }));
                }
              }
            }}
            className="w-full text-center bg-transparent border-none focus:outline-none text-coa-blue"
          />
        );
      } else if (node.key && computedMaxValues[node.key] !== undefined) {
        content = formatValue(
          computedMaxValues[node.key],
          node.calculationType
        );
        textClass = "text-coa-blue";
      } else if (node.calculationType === "computed" && node.key) {
        const mid = computedMaxValues["midterm-total-grade"] || 0;
        const fin = computedMaxValues["final-total-grade"] || 0;
        const { content: compContent, type } = computeComputedContent(
          mid,
          fin,
          node.key
        );
        content = compContent;
        bgClass = getCalculatedBg(type);
        textClass = "text-coa-blue";
      }
      subRow.push(
        <th
          key={`sub-${node.title}`}
          className={`border border-[#E9E6E6] p-2 text-center ${bgClass} ${textClass} ${
            node.calculationType ? "w-[3.75rem]" : ""
          }`}
        >
          {content}
        </th>
      );
    }
  }

  nodes.forEach(build);
  return subRow;
}

type ComputedType = "computedWeighted" | "computedRounded" | undefined;

interface ComputedContentResult {
  content: string;
  valueNum: number | null;
  type: ComputedType;
  textClass: string;
}

function computeComputedContent(
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

function buildStudentRow(
  student: Student,
  index: number,
  nodes: HeaderNode[],
  studentScore: Record<string, number>,
  updateScore: (key: string, value: number) => void,
  computedValues: Record<string, number>,
  maxScores: Record<string, number>,
  remarks: string[],
  updateRemark: (index: number, value: string) => void
): JSX.Element {
  const row: JSX.Element[] = [];

  function computeComputedContent(
    mid: number,
    fin: number,
    key: string,
    isStudent: boolean = false,
    index?: number
  ): { content: string | JSX.Element; textClass: string; bgClass: string } {
    const grades = [
      1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 3.25, 3.5, 3.75, 4.0,
      4.25, 4.5, 4.75, 5.0,
    ];
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
    } else if (
      key === "computed-half-for-removal" ||
      key === "computed-half-after-removal"
    ) {
      raw = mid * 0.5 + fin * 0.5;
      raw = Number(raw.toFixed(2));
      rounded = grades.reduce(
        (prev, curr) =>
          Math.abs(curr - raw) < Math.abs(prev - raw)
            ? curr
            : Math.abs(curr - raw) === Math.abs(prev - raw)
            ? Math.max(curr, prev)
            : prev,
        grades[0]
      );
      cont = formatValue(rounded, "computedRounded");
      type = "computedRounded";
      textClass = getTextClass(rounded, type);
      bgClass = getCalculatedBg(type);
    } else if (key === "computed-half-desc") {
      raw = mid * 0.5 + fin * 0.5;
      raw = Number(raw.toFixed(2));
      rounded = grades.reduce(
        (prev, curr) =>
          Math.abs(curr - raw) < Math.abs(prev - raw)
            ? curr
            : Math.abs(curr - raw) === Math.abs(prev - raw)
            ? Math.max(curr, prev)
            : prev,
        grades[0]
      );
      cont = getDesc(rounded);
      textClass = "text-coa-blue";
    } else if (key === "computed-third-weighted") {
      raw = mid * (1 / 3) + fin * (2 / 3);
      cont = formatValue(raw, "computedWeighted");
      type = "computedWeighted";
      textClass = getTextClass(raw, type);
      bgClass = getCalculatedBg(type);
    } else if (
      key === "computed-third-for-removal" ||
      key === "computed-third-after-removal"
    ) {
      raw = mid * (1 / 3) + fin * (2 / 3);
      raw = Number(raw.toFixed(2));
      rounded = grades.reduce(
        (prev, curr) =>
          Math.abs(curr - raw) < Math.abs(prev - raw)
            ? curr
            : Math.abs(curr - raw) === Math.abs(prev - raw)
            ? Math.max(curr, prev)
            : prev,
        grades[0]
      );
      cont = formatValue(rounded, "computedRounded");
      type = "computedRounded";
      textClass = getTextClass(rounded, type);
      bgClass = getCalculatedBg(type);
    } else if (key === "computed-third-desc") {
      raw = mid * (1 / 3) + fin * (2 / 3);
      raw = Number(raw.toFixed(2));
      rounded = grades.reduce(
        (prev, curr) =>
          Math.abs(curr - raw) < Math.abs(prev - raw)
            ? curr
            : Math.abs(curr - raw) === Math.abs(prev - raw)
            ? Math.max(curr, prev)
            : prev,
        grades[0]
      );
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
          className="bg-ucap-blue w-4 border border-ucap-blue"
        />
      );
      return;
    }

    if (node.type === "spacer") {
      row.push(
        <td
          key={`student-spacer-${node.title}-${index}`}
          className="bg-white w-20 border border-[#E9E6E6]"
        />
      );
      return;
    }

    if (node.type === "h-separator") {
      return;
    }

    if (node.children.length > 0) {
      node.children.forEach(addToRow);
    } else {
      const effectiveColSpan = node.colSpan || 1;
      if (node.isRowSpan) {
        row.push(
          <td
            key={`student-no-${index}`}
            className="border border-[#E9E6E6] p-2 w-1 text-left"
          >
            {index + 1}
          </td>
        );
        row.push(
          <td
            key={`student-id-${index}`}
            className="border border-[#E9E6E6] p-2 w-2 text-left"
          >
            {student.studentId}
          </td>
        );
        row.push(
          <td
            key={`student-name-${index}`}
            className="border border-[#E9E6E6] p-2 text-left"
          >{`${student.fName}, ${student.lName}`}</td>
        );
      } else {
        let content: JSX.Element | string = "";
        let textClass = "";
        let bgClass = getCalculatedBg(node.calculationType);
        if (node.calculationType === "assignment" && node.key) {
          content = (
            <input
              type="number"
              min={0}
              max={maxScores[node.key]}
              value={node.key ? studentScore[node.key] : ""}
              onChange={(e) => {
                if (node.key) {
                  const newValue = Number(e.target.value);
                  if (newValue <= maxScores[node.key]) {
                    updateScore(node.key, newValue);
                  }
                }
              }}
              className="w-full text-center bg-transparent border-none focus:outline-none"
            />
          );
        } else if (node.key && computedValues[node.key] !== undefined) {
          content = formatValue(computedValues[node.key], node.calculationType);
          const value = computedValues[node.key];
          textClass = getTextClass(value, node.calculationType);
        } else if (node.calculationType === "computed" && node.key) {
          const mid = computedValues["midterm-total-grade"] || 0;
          const fin = computedValues["final-total-grade"] || 0;
          const {
            content: compContent,
            textClass: compTextClass,
            bgClass: compBgClass,
          } = computeComputedContent(mid, fin, node.key, true, index);
          content = compContent;
          textClass = compTextClass;
          bgClass = compBgClass;
        }
        row.push(
          <td
            key={`student-${node.title}-${index}`}
            colSpan={effectiveColSpan}
            className={`border border-[#E9E6E6] p-2 text-center ${bgClass} ${textClass} ${
              node.calculationType ? "w-[3.75rem]" : ""
            }`}
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

function createResizeHandler(
  setColumnWidths: React.Dispatch<React.SetStateAction<Record<string, number>>>,
  columnKey: string
) {
  return (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const startX = e.clientX;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      setColumnWidths((prev) => ({
        ...prev,
        [columnKey]: Math.max((prev[columnKey] || 120) + deltaX, 40), // min width 40px
      }));
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };
}

export default function ClassRecordComponent({
  headerConfig,
}: ClassRecordComponentProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [currentItem, setCurrentItem] = useState("");
  const [bloomSelections, setBloomSelections] = useState<
    Record<string, string[]>
  >({});
  const [maxScores, setMaxScores] = useState(collectMaxScores(headerConfig));
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});

  const assignmentKeys = useMemo(
    () => collectAssignmentKeys(headerConfig),
    [headerConfig]
  );

  const students = crpInfo.students || [];
  const [studentScores, setStudentScores] = useState(
    students.map((student) => {
      const scoreObj: Record<string, number> = {};
      assignmentKeys.forEach((key, idx) => {
        scoreObj[key] = student.scores?.[idx] ?? 0;
      });
      return scoreObj;
    })
  );
  const [remarks, setRemarks] = useState<string[]>(students.map(() => ""));

  const computedMaxValues = useMemo(
    () => computeValues(maxScores, maxScores, headerConfig),
    [maxScores, headerConfig]
  );

  const computedStudentValues = useMemo(
    () =>
      studentScores.map((scores) =>
        computeValues(scores, maxScores, headerConfig)
      ),
    [studentScores, maxScores, headerConfig]
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

  const updateStudentScore = (
    studentIndex: number,
    key: string,
    value: number
  ) => {
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

  const bloomLevels = [
    "Remember",
    "Understand",
    "Apply",
    "Analyze",
    "Evaluate",
    "Create",
  ];

  const originalMaxDepth = Math.max(...headerConfig.map(getMaxDepth));
  const headerRows = buildHeaderRows(
    headerConfig,
    originalMaxDepth,
    openPopup,
    maxScores,
    setMaxScores,
    computedMaxValues,
    columnWidths,
    setColumnWidths
  );

  return (
    <>
      <thead>
        {headerRows.map((row, idx) => (
          <tr key={idx}>{row}</tr>
        ))}
      </thead>
      <tbody>
        {students.map((student, i) =>
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
        )}
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
              <button
                onClick={closePopup}
                className="text-gray-600 hover:text-gray-800"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <h2 className="ml-2 text-lg font-semibold">Bloom's Taxonomy</h2>
            </div>
            <hr className="border-t border-[#E9E6E6] mb-4" />
            <div className="grid grid-cols-3 gap-4">
              {bloomLevels.map((level) => (
                <label key={level} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(bloomSelections[currentItem] || []).includes(
                      level
                    )}
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
