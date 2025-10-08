import React, { useCallback, type JSX } from "react";
import type { HeaderNode } from "./HeaderConfig";
import type { Student } from "../../types/classRecordTypes";
import {
  formatValue,
  getCalculatedBg,
  getDesc,
  getTextClass,
} from "./ClassRecordFunctions";

interface BuildStudentRowProps {
  student: Student;
  index: number;
  nodes: HeaderNode[];
  studentScore: Record<string, number>;
  computedValues: Record<string, number>;
  maxScores: Record<string, number>;
  remarks: string[];
  updateRemark: (index: number, value: string) => void;
  handleInputChange: (
    index: number,
    field: keyof Student,
    value: string
  ) => void;
  updateScoreProp: (index: number, key: string, value: number) => void;
}

function BuildStudentRow({
  student,
  index,
  nodes,
  studentScore,
  updateScoreProp,
  computedValues,
  maxScores,
  remarks,
  updateRemark,
  handleInputChange,
}: BuildStudentRowProps) {
  const handleStudentIdChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleInputChange(index, "id_number", e.target.value);
    },
    [index, handleInputChange]
  );

  const handleStudentNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleInputChange(index, "student_name", e.target.value);
    },
    [index, handleInputChange]
  );

  const handleRemarkChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateRemark(index, e.target.value);
    },
    [index, updateRemark]
  );

  const computeComputedContent = (
    mid: number,
    fin: number,
    key: string
  ): { content: string | JSX.Element; textClass: string; bgClass: string } => {
    const grades = [
      1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 3.25, 3.5, 3.75, 4.0,
      4.25, 4.5, 4.75, 5.0,
    ];
    let raw = 0;
    let rounded = 0;
    let cont: string | JSX.Element = "";
    let textClass = "";
    let bgClass = "";

    if (key.includes("half")) raw = mid * 0.5 + fin * 0.5;
    else if (key.includes("third")) raw = mid * (1 / 3) + fin * (2 / 3);

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
          value={remarks[index] ?? ""}
          onChange={handleRemarkChange}
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
  };

  const buildRowCells = (nodes: HeaderNode[]): JSX.Element[] => {
    return nodes.flatMap((node) => {
      const baseKey = `${node.key ?? node.title}-${node.calculationType}-${node.type}`;

      if (node.type === "v-separator") {
        return (
          <td
            key={`${baseKey}-vsep`}
            className="bg-ucap-blue w-4 border border-ucap-blue"
          />
        );
      }

      if (node.type === "spacer") {
        return (
          <td
            key={`${baseKey}-spacer`}
            className="bg-white w-20 border border-[#E9E6E6]"
          />
        );
      }

      if (node.type === "h-separator") return [];

      if (node.children.length > 0) {
        return buildRowCells(node.children);
      }

      if (node.isRowSpan) {
        return [
          <td
            key={`no-${baseKey}`}
            className="border border-[#E9E6E6] p-2 w-12 text-left"
          >
            {index + 1}
          </td>,
          <td
            key={`id-${baseKey}`}
            className="border border-[#E9E6E6] w-32 text-left"
          >
            <input
              type="text"
              value={student.id_number ?? ""}
              onChange={handleStudentIdChange}
              className="py-2.25 px-2 w-full h-full border-none outline-none bg-transparent"
            />
          </td>,
          <td
            key={`name-${baseKey}`}
            className="border border-[#E9E6E6] text-left"
          >
            <input
              type="text"
              value={student.student_name ?? ""}
              onChange={handleStudentNameChange}
              className="py-2.25 px-2 w-full h-full border-none outline-none bg-transparent"
            />
          </td>,
        ];
      }

      let content: JSX.Element | string = "";
      let textClass = "";
      let bgClass = getCalculatedBg(node.calculationType);

      // Assignment input
      if (node.calculationType === "assignment" && node.key) {
        const scoreKey = node.key;
        const value = studentScore[scoreKey] ?? 0;
        const max = maxScores[node.key] ?? 0;

        content = (
          <input
            type="number"
            min={0}
            max={max}
            value={value}
            onChange={(e) => {
              const newValue = Number(e.target.value);
              if (newValue <= max) {
                updateScoreProp(index, scoreKey, newValue);
              }
            }}
            className="py-2.25 px-2 w-full h-full text-center bg-transparent border-none focus:outline-none"
          />
        );
      } else if (node.calculationType === "computed" && node.key) {
        const mid = computedValues["midterm-total-grade"];
        const fin = computedValues["final-total-grade"];

        const {
          content: c,
          textClass: t,
          bgClass: b,
        } = computeComputedContent(mid, fin, node.key);

        content = c;
        textClass = t;
        bgClass = b;
      } else if (node.key && computedValues[node.key] !== undefined) {
        const value = computedValues[node.key];
        content = formatValue(value, node.calculationType);
        textClass = getTextClass(value, node.calculationType);
      }

      return (
        <td
          key={baseKey}
          className={`border border-[#E9E6E6] text-center ${bgClass} ${textClass}`}
        >
          {content}
        </td>
      );
    });
  };

  const rowCells = buildRowCells(nodes);

  return <tr>{rowCells}</tr>;
}

export default React.memo(BuildStudentRow);