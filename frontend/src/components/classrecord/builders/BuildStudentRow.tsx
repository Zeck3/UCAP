import React, { useEffect, useState, type JSX } from "react";
import type { HeaderNode } from "../types/headerConfigTypes";
import type { Student } from "../../../types/classRecordTypes";
import {
  formatValue,
  getCalculatedBg,
  getDesc,
  getTextClass,
} from "../utils/ClassRecordFunctions";

interface BuildStudentRowProps {
  student: Student;
  index: number;
  nodes: HeaderNode[];
  studentScore: Record<string, number>;
  computedValues: Record<string, number>;
  maxScores: Record<string, number>;
  remarks: string;
  updateRemark: (newRemark: string) => void;
  handleInputChange: (
    index: number,
    field: keyof Student,
    value: string
  ) => void;
  updateScoreProp: (index: number, key: string, value: number) => void;
  onRightClickRow?: (e: React.MouseEvent, studentId: number) => void;
  handleUpdateStudent: (studentId: number, updates: Partial<Student>) => void;
  saveRawScore: (
    studentId: number,
    assessmentId: number,
    value: number | null
  ) => Promise<void>;
}

function BuildStudentRow({
  student,
  index,
  nodes,
  studentScore,
  updateScoreProp,
  computedValues,
  maxScores,
  onRightClickRow,
  handleUpdateStudent,
  saveRawScore,
}: BuildStudentRowProps) {
  const [localStudent, setLocalStudent] = useState(student);

  useEffect(() => {
    setLocalStudent(student);
  }, [student]);

  const handleFieldChange = (
    field: keyof Student,
    value: Student[keyof Student]
  ) => {
    setLocalStudent((prev) => ({ ...prev, [field]: value }));
  };

  const handleFieldBlur = (field: keyof Student) => {
    if (localStudent[field] !== student[field]) {
      handleUpdateStudent(student.student_id, { [field]: localStudent[field] });
    }
  };

  const computeComputedContent = (
    mid: number | "" | null,
    fin: number | "" | null,
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

    // Only compute if both mid and fin are numbers
    const midNum = typeof mid === "number" ? mid : null;
    const finNum = typeof fin === "number" ? fin : null;

    if (midNum !== null && finNum !== null) {
      if (key.includes("half")) raw = midNum * 0.5 + finNum * 0.5;
      else if (key.includes("third")) raw = midNum * (1 / 3) + finNum * (2 / 3);

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
      }
    } else {
      // mid or fin is empty → show nothing
      cont = "";
      textClass = "";
      bgClass = "";
    }

    // Remarks dropdown stays the same
    if (key.endsWith("remarks")) {
      cont = (
        <select
          value={localStudent.remarks ?? ""}
          onChange={(e) => handleFieldChange("remarks", e.target.value)}
          onBlur={() => handleFieldBlur("remarks")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleFieldBlur("remarks");
              e.currentTarget.blur();
            }
          }}
          className="w-full bg-transparent border-none focus:outline-none text-center"
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
      const baseKey = `${node.key ?? node.title}-${node.calculationType}-${
        node.type
      }`;

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
            onContextMenu={(e) => onRightClickRow?.(e, student.student_id)}
          >
            {index + 1}
          </td>,
          <td
            key={`id-${baseKey}`}
            className="border border-[#E9E6E6] w-32 text-left"
            onContextMenu={(e) => onRightClickRow?.(e, student.student_id)}
          >
            <input
              type="number"
              value={localStudent.id_number ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                // allow only digits and max 10 characters
                if (/^\d{0,10}$/.test(val)) {
                  handleFieldChange(
                    "id_number",
                    val === "" ? null : Number(val)
                  );
                }
              }}
              onBlur={() => handleFieldBlur("id_number")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleFieldBlur("id_number");
                  e.currentTarget.blur(); // remove focus
                }
              }}
              className="py-2.25 px-2 w-full h-full border-none outline-none bg-transparent"
            />
          </td>,
          <td
            key={`name-${baseKey}`}
            className="border border-[#E9E6E6] text-left"
            onContextMenu={(e) => onRightClickRow?.(e, student.student_id)}
          >
            <input
              type="text"
              value={localStudent.student_name ?? ""}
              onChange={(e) =>
                handleFieldChange("student_name", e.target.value)
              }
              onBlur={() => handleFieldBlur("student_name")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleFieldBlur("student_name");
                  e.currentTarget.blur();
                }
              }}
              className="py-2.25 px-2 w-full h-full border-none outline-none bg-transparent"
            />
          </td>,
        ];
      }

      let content: JSX.Element | string = "";
      let textClass = "";
      let bgClass = getCalculatedBg(node.calculationType);

      if (node.calculationType === "assignment" && node.key) {
        const scoreKey = node.key;
        const value = studentScore[scoreKey] ?? 0;
        const max = maxScores?.[node.key] ?? 0;

        content = (
          <input
            type="number"
            min={0}
            max={max}
            value={value === 0 ? "" : value}
            onChange={(e) => {
              const val = e.target.value;
              const newValue = val === "" ? 0 : Number(val);
              if (newValue <= max) {
                updateScoreProp(student.student_id, scoreKey, newValue);
              }
            }}
            onBlur={(e) => {
              const val = e.target.value;
              const newValue = val === "" ? 0 : Number(val);
              if (newValue <= max) {
                saveRawScore(student.student_id, Number(scoreKey), newValue);
              }
            }}
            onKeyDown={(e) => {
              if (["e", "E", "+", "-"].includes(e.key)) {
                e.preventDefault();
              }

              // Handle Enter key
              if (e.key === "Enter") {
                const val = (e.target as HTMLInputElement).value;
                const newValue = val === "" ? 0 : Number(val);
                if (newValue <= max) {
                  saveRawScore(student.student_id, Number(scoreKey), newValue);
                  (e.target as HTMLInputElement).blur();
                }
              }
            }}
            onPaste={(e) => {
              const paste = e.clipboardData.getData("text");
              if (!/^\d*$/.test(paste)) {
                e.preventDefault();
              }
            }}
            className="py-2.25 px-2 w-full h-full text-center bg-transparent border-none focus:outline-none"
          />
        );
      } else if (node.calculationType === "computed" && node.key) {
        const mid = computedValues?.["midterm-total-grade"];
        const fin = computedValues?.["final-total-grade"];

        const {
          content: c,
          textClass: t,
          bgClass: b,
        } = computeComputedContent(mid, fin, node.key);

        content = c;
        textClass = t;
        bgClass = b;
      } else if (node.key && computedValues[node.key] !== undefined) {
        const value = computedValues?.[node.key];
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

  return (
    <tr key={student.student_id} className="hover:bg-gray-50 select-none">
      {rowCells}
    </tr>
  );
}

export default React.memo(BuildStudentRow);
