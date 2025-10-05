import React, { useMemo, type JSX } from "react";
import type { HeaderNode } from "../../data/TableHeaderConfig";
import type { Student } from "../../data/crpInfo";
import {
  formatValue,
  getCalculatedBg,
  getDesc,
  getTextClass,
} from "./ClassRecordFunctions";

interface StudentRowProps {
  student: Student;
  index: number;
  nodes: HeaderNode[];
  studentScore: Record<string, number>;
  updateScore: (key: string, value: number) => void;
  computedValues: Record<string, number>;
  maxScores: Record<string, number>;
  remarks: string[];
  updateRemark: (index: number, value: string) => void;
}

function StudentRow({
  student,
  index,
  nodes,
  studentScore,
  updateScore,
  computedValues,
  maxScores,
  remarks,
  updateRemark,
}: StudentRowProps) {
  const row = useMemo<JSX.Element[]>(() => [], []);

  const computeComputedContent = React.useCallback(
    (
      mid: number,
      fin: number,
      key: string
    ): {
      content: string | JSX.Element;
      textClass: string;
      bgClass: string;
    } => {
      const grades = [
        1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 3.25, 3.5, 3.75, 4.0,
        4.25, 4.5, 4.75, 5.0,
      ];
      let raw = 0;
      let rounded = 0;
      let cont: string | JSX.Element = "";
      let textClass = "";
      let bgClass = "";

      if (key.includes("half")) {
        raw = mid * 0.5 + fin * 0.5;
      } else if (key.includes("third")) {
        raw = mid * (1 / 3) + fin * (2 / 3);
      }

      if (key.endsWith("weighted")) {
        cont = formatValue(raw, "computedWeighted");
        textClass = getTextClass(raw, "computedWeighted");
        bgClass = getCalculatedBg("computedWeighted");
      } else if (key.includes("for-removal") || key.includes("after-removal")) {
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
        textClass = getTextClass(rounded, "computedRounded");
        bgClass = getCalculatedBg("computedRounded");
      } else if (key.endsWith("desc")) {
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
      } else if (key.endsWith("remarks")) {
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
      }

      return { content: cont, textClass, bgClass };
    },
    [remarks, updateRemark, index]
  );

  const addToRow = React.useCallback(
    (node: HeaderNode) => {
      if (node.type === "v-separator") {
        row.push(
          <td
            key={`vsep-${student.studentId}-${index}-${node.type}-${Math.random().toString(36).slice(2, 6)}`}
            className="bg-ucap-blue w-4 border border-ucap-blue"
          />
        );
        return;
      }

      if (node.type === "spacer") {
        row.push(
          <td
            key={`spacer-${node.key ?? node.title}-${student.studentId}`}
            className="bg-white w-20 border border-[#E9E6E6]"
          />
        );
        return;
      }

      if (node.type === "h-separator") return;

      if (node.children.length > 0) {
        node.children.forEach(addToRow);
        return;
      }

      if (node.isRowSpan) {
        row.push(
          <td key={`no-${student.studentId}`} className="border border-[#E9E6E6] p-2 text-left">
            {index + 1}
          </td>,
          <td key={`id-${student.studentId}`} className="border border-[#E9E6E6] p-2 text-left">
            {student.studentId}
          </td>,
          <td
            key={`name-${student.studentId}`}
            className="border border-[#E9E6E6] p-2 text-left"
          >
            {`${student.fName}, ${student.lName}`}
          </td>
        );
        return;
      }

      let content: JSX.Element | string = "";
      let textClass = "";
      let bgClass = getCalculatedBg(node.calculationType);

      if (node.calculationType === "assignment" && node.key) {
        const key = node.key;

        content = (
          <input
            type="number"
            min={0}
            max={maxScores[key]}
            value={studentScore[key]}
            onChange={(e) => {
              const newValue = Number(e.target.value);
              if (newValue <= maxScores[key]) updateScore(key, newValue);
            }}
            className="w-full text-center bg-transparent border-none focus:outline-none"
          />
        );
      } else if (node.key && computedValues[node.key] !== undefined) {
        const value = computedValues[node.key];
        content = formatValue(value, node.calculationType);
        textClass = getTextClass(value, node.calculationType);
      } else if (node.calculationType === "computed" && node.key) {
        const mid = computedValues["midterm-total-grade"] || 0;
        const fin = computedValues["final-total-grade"] || 0;
        const {
          content: c,
          textClass: t,
          bgClass: b,
        } = computeComputedContent(mid, fin, node.key);
        content = c;
        textClass = t;
        bgClass = b;
      }
      let cellCounter = 0;

      row.push(
        <td
          key={`cell-${student.studentId}-${node.key ?? node.title ?? node.type}-${cellCounter++}`}
          className={`border border-[#E9E6E6] p-2 text-center ${bgClass} ${textClass}`}
        >
          {content}
        </td>
      );
    },
    [
      student,
      studentScore,
      computedValues,
      maxScores,
      updateScore,
      computeComputedContent,
      index,
      row,
    ]
  );

  nodes.forEach(addToRow);

  return <tr>{row}</tr>;
}

export default React.memo(StudentRow);
