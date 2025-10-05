import type { HeaderNode } from "../../data/TableHeaderConfig";
import { useMemo, useState } from "react";
import { crpInfo } from "../../data/crpInfo";
import {
  collectAssignmentKeys,
  collectMaxScores,
  computeValues,
  getMaxDepth,
} from "./ClassRecordFunctions";
import BuildHeaderRow from "./BuildHeaderRow";
import StudentRow from "./StudentRow";

interface ClassRecordComponentProps {
  headerConfig: HeaderNode[];
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
  const headerRows = BuildHeaderRow(
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
        {students.map((student, i) => (
          <StudentRow
            key={student.studentId}
            student={student}
            index={i}
            nodes={headerConfig}
            studentScore={studentScores[i]}
            updateScore={(key, value) => updateStudentScore(i, key, value)}
            computedValues={computedStudentValues[i]}
            maxScores={maxScores}
            remarks={remarks}
            updateRemark={updateRemark}
          />
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
