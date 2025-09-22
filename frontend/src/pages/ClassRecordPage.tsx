// ClassRecordPage.tsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { JSX } from "react";
import { crpInfo } from "../data/crpInfo";

export default function ClassRecordPage(): JSX.Element {
  const navigate = useNavigate();
  const [footerOpen, setFooterOpen] = useState(true);

  // --- pull in from dummy db ---
  const { meta, lectureColumns, labColumns, midtermColumns, finalLectureColumns, finalLabColumns, finalColumns, students: initialStudents } = crpInfo;

  // --- add computed columns ---
  const computedColumns = [
    {
      label: "Computed Final Grade",
      sub: [
        { name: "1/2 MTG + 1/2 FTG" },
        { name: "1/2 MTG + 1/2 FTG (For Removal)" },
        { name: "1/2 MTG + 1/2 FTG (After Removal)" },
        { name: "Description" },
        { name: "1/3 MTG + 2/3 FTG" },
        { name: "1/3 MTG + 2/3 FTG (For Removal)" },
        { name: "1/3 MTG + 2/3 FTG (After Removal)" },
        { name: "Description" },
        { name: "Remarks (INC, Withdrawn, DF, OD)" },
      ],
    },
  ];

  // --- set of subs to render in bold ---
  const boldSubs = new Set([
    "Total Scores (SRC)",
    "CPA",
    "Total Scores (SRQ)",
    "QA",
    "M",
    "Total Score (PIT)",
    "PIT %",
    "MGA",
    "Mid Lec Grade Point",
    "Average",
    "Mid Lab Grade Point",
    "Mid Grade Point",
    "Midterm Grade",
    "F",
    "FGA",
    "Fin Lec Grade Point",
    "Fin Lab Grade Point",
    "Fin Grade Point",
    "Final Period Grade",
    "1/2 MTG + 1/2 FTG",
    "1/2 MTG + 1/2 FTG (For Removal)",
    "1/2 MTG + 1/2 FTG (After Removal)",
    "Description",
    "1/3 MTG + 2/3 FTG",
    "1/3 MTG + 2/3 FTG (For Removal)",
    "1/3 MTG + 2/3 FTG (After Removal)",
    "Description",
    "Remarks (INC, Withdrawn, DF, OD)",
  ]);

  // --- flat list of all sub objects for convenience (order matters) ---
  const allFlatSubs = [
    ...lectureColumns.flatMap((g) => g.sub),
    ...labColumns.flatMap((g) => g.sub),
    ...midtermColumns.flatMap((g) => g.sub),
    ...finalLectureColumns.flatMap((g) => g.sub),
    ...finalLabColumns.flatMap((g) => g.sub),
    ...finalColumns.flatMap((g) => g.sub),
    ...computedColumns.flatMap((g) => g.sub),
  ];

  // --- computed totals for colSpans ---
  const lecSubCount = lectureColumns.reduce((s, c) => s + Math.max(1, c.sub.length), 0);
  const labSubCount = labColumns.reduce((s, c) => s + Math.max(1, c.sub.length), 0);
  const midSubCount = midtermColumns.reduce((s, c) => s + Math.max(1, c.sub.length), 0);
  const midTotalSubCols = lecSubCount + labSubCount + midSubCount;

  const finalLecSubCount = finalLectureColumns.reduce((s, c) => s + Math.max(1, c.sub.length), 0);
  const finalLabSubCount = finalLabColumns.reduce((s, c) => s + Math.max(1, c.sub.length), 0);
  const finalSubCount = finalColumns.reduce((s, c) => s + Math.max(1, c.sub.length), 0);
  const finalTotalSubCols = finalLecSubCount + finalLabSubCount + finalSubCount;

  const computedSubCount = computedColumns.reduce((s, c) => s + Math.max(1, c.sub.length), 0);

  const bigLeftColSpan = 3;
  const verticalBarCols = 1;

  const totalSpan = 7 + initialStudents.length;

  // --- helper: sum numeric maxScores for a column that matches provided keyword ---
  const sumForGroup = (columns: typeof lectureColumns, match: string) => {
    const col = columns.find((g) => g.label.includes(match));
    if (!col) return 0;
    return col.sub.reduce((s, sub) => s + (typeof sub.maxScore === "number" ? sub.maxScore : 0), 0);
  };

  // --- helper: compute percentage (streamlined) ---
  const computePercent = (total: number) => (total > 0 ? 100 : 0);

  // --- helper: compute grade point ---
  const computeGradePoint = (ga: number) =>
    ga >= 70 ? 23 / 3 - (20 / 3) * (ga / 100) : 5 - (20 / 7) * (ga / 100);

  // --- helper: map grade point to scale ---
  const gradeScale = [1.00, 1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00, 3.25, 3.50, 3.75, 4.00, 4.25, 4.50, 4.75, 5.00];
  const mapToGrade = (gradePoint: number) =>
    gradeScale.reduce((prev, curr) =>
      Math.abs(curr - gradePoint) < Math.abs(prev - gradePoint) ? curr : prev
    );

  // --- helper: map grade to description ---
  const getDescription = (grade: number): string => {
    if (grade >= 1.00 && grade <= 1.25) return "Excellent";
    if (grade >= 1.50 && grade <= 1.75) return "Very Good";
    if (grade >= 2.00 && grade <= 2.25) return "Good";
    if (grade >= 2.50 && grade <= 2.75) return "Average";
    if (grade === 3.00) return "Passing";
    if (grade >= 3.25 && grade <= 5.00) return "Failed";
    return "";
  };

  // --- Lecture group totals & derived values ---
  const lecSrcTotal = sumForGroup(lectureColumns, "Class Standing");
  const lecSrqTotal = sumForGroup(lectureColumns, "Quiz/Prelim");
  const lecPitTotal = sumForGroup(lectureColumns, "Per Inno Task");
  const lecMidExamTotal = sumForGroup(lectureColumns, "Midterm Exam");

  const lecCPA = computePercent(lecSrcTotal);
  const lecQA = computePercent(lecSrqTotal);
  const lecM = computePercent(lecMidExamTotal);
  const lecPITp = computePercent(lecPitTotal);
  const lecMGA = lecCPA * 0.1 + lecQA * 0.4 + lecM * 0.3 + lecPITp * 0.2;
  const MidLecGradePoint = computeGradePoint(lecMGA);

  // --- Laboratory group totals & derived values ---
  const labSrcTotal = sumForGroup(labColumns, "Lab Exercises");
  const labSrqTotal = sumForGroup(labColumns, "Hands-On");
  const labMidExamTotal = sumForGroup(labColumns, "Lab Major");

  const labAvg1 = computePercent(labSrcTotal);
  const labAvg2 = computePercent(labSrqTotal);
  const labM = computePercent(labMidExamTotal);
  const labMGA = labAvg1 * 0.3 + labAvg2 * 0.3 + labM * 0.4;
  const MidLabGradePoint = computeGradePoint(labMGA);

  // --- Mid Grade Point & Grade ---
  const MidGradePoint = MidLecGradePoint * 0.67 + MidLabGradePoint * 0.33;
  const MidtermGrade = mapToGrade(MidGradePoint);

  // --- Final Lecture group totals & derived values ---
  const finalLecSrcTotal = sumForGroup(finalLectureColumns, "Class Standing");
  const finalLecSrqTotal = sumForGroup(finalLectureColumns, "Quiz/Prelim");
  const finalLecPitTotal = sumForGroup(finalLectureColumns, "Per Inno Task");
  const finalLecExamTotal = sumForGroup(finalLectureColumns, "Final Exam");

  const finalCPA = computePercent(finalLecSrcTotal);
  const finalQA = computePercent(finalLecSrqTotal);
  const finalF = computePercent(finalLecExamTotal);
  const finalPITp = computePercent(finalLecPitTotal);
  const finalFGA = finalCPA * 0.1 + finalQA * 0.4 + finalF * 0.3 + finalPITp * 0.2;
  const FinLecGradePoint = computeGradePoint(finalFGA);

  // --- Final Laboratory group totals & derived values ---
  const finalLabSrcTotal = sumForGroup(finalLabColumns, "Lab Exercises");
  const finalLabSrqTotal = sumForGroup(finalLabColumns, "Hands-On");
  const finalLabExamTotal = sumForGroup(finalLabColumns, "Lab Major");

  const finalLabAvg1 = computePercent(finalLabSrcTotal);
  const finalLabAvg2 = computePercent(finalLabSrqTotal);
  const finalLabF = computePercent(finalLabExamTotal);
  const finalLabFGA = finalLabAvg1 * 0.3 + finalLabAvg2 * 0.3 + finalLabF * 0.4;
  const FinLabGradePoint = computeGradePoint(finalLabFGA);

  // --- Fin Grade Point & Grade ---
  const FinGradePoint = FinLecGradePoint * 0.67 + FinLabGradePoint * 0.33;
  const FinalGrade = mapToGrade(FinGradePoint);

  // --- computed displayed max values for the Student Header Row ---
  const displayedMaxes: (number | string)[] = [];
  const computeForColumns = (columns: typeof lectureColumns, context: "lecture" | "lab" | "midterm" | "final_lecture" | "final_lab" | "final" | "computed") => {
    for (const col of columns) {
      let sum = 0;
      let values: (number | string)[] = [];
      if (context === "computed") {
        const mtgHeader = MidtermGrade;
        const ftgHeader = FinalGrade;

        // 50/50
        const halfBaseHeader = (0.5 * mtgHeader + 0.5 * ftgHeader).toFixed(2);
        const halfClosestHeader = mapToGrade(parseFloat(halfBaseHeader));

        // 33/67
        const thirdBaseHeader = ((1 / 3) * mtgHeader + (2 / 3) * ftgHeader).toFixed(2);
        const thirdClosestHeader = mapToGrade(parseFloat(thirdBaseHeader));

        values = [
          halfBaseHeader,
          halfClosestHeader.toFixed(2),
          halfClosestHeader.toFixed(2),
          getDescription(halfClosestHeader),
          thirdBaseHeader,
          thirdClosestHeader.toFixed(2),
          thirdClosestHeader.toFixed(2),
          getDescription(thirdClosestHeader),
          ""
        ];
      }
      for (const sub of col.sub) {
        if (!boldSubs.has(sub.name)) {
          const max = sub.maxScore ?? "";
          displayedMaxes.push(max);
          if (typeof sub.maxScore === "number") sum += sub.maxScore;
        } else {
          if (sub.name.startsWith("Total Score")) {
            displayedMaxes.push(sum);
            continue;
          }

          if (context === "lecture") {
            switch (sub.name) {
              case "CPA":
                displayedMaxes.push(`${lecCPA}%`);
                break;
              case "QA":
                displayedMaxes.push(`${lecQA}%`);
                break;
              case "M":
                displayedMaxes.push(`${lecM}%`);
                break;
              case "PIT %":
                displayedMaxes.push(`${lecPITp}%`);
                break;
              case "MGA":
                displayedMaxes.push(`${lecMGA}%`);
                break;
              case "Mid Lec Grade Point":
                displayedMaxes.push(MidLecGradePoint.toFixed(3));
                break;
              default:
                displayedMaxes.push("");
                break;
            }
          } else if (context === "final_lecture") {
            switch (sub.name) {
              case "CPA":
                displayedMaxes.push(`${finalCPA}%`);
                break;
              case "QA":
                displayedMaxes.push(`${finalQA}%`);
                break;
              case "F":
                displayedMaxes.push(`${finalF}%`);
                break;
              case "PIT %":
                displayedMaxes.push(`${finalPITp}%`);
                break;
              case "FGA":
                displayedMaxes.push(`${finalFGA}%`);
                break;
              case "Fin Lec Grade Point":
                displayedMaxes.push(FinLecGradePoint.toFixed(3));
                break;
              default:
                displayedMaxes.push("");
                break;
            }
          } else if (context === "lab") {
            if (sub.name === "Average") {
              if (col.label.includes("Lab Exercises")) {
                displayedMaxes.push(`${labAvg1}%`);
              } else if (col.label.includes("Hands-On")) {
                displayedMaxes.push(`${labAvg2}%`);
              } else {
                displayedMaxes.push("");
              }
              continue;
            }

            switch (sub.name) {
              case "M":
                displayedMaxes.push(`${labM}%`);
                break;
              case "MGA":
                displayedMaxes.push(`${labMGA}%`);
                break;
              case "Mid Lab Grade Point":
                displayedMaxes.push(MidLabGradePoint.toFixed(3));
                break;
              default:
                displayedMaxes.push("");
                break;
            }
          } else if (context === "final_lab") {
            if (sub.name === "Average") {
              if (col.label.includes("Lab Exercises")) {
                displayedMaxes.push(`${finalLabAvg1}%`);
              } else if (col.label.includes("Hands-On")) {
                displayedMaxes.push(`${finalLabAvg2}%`);
              } else {
                displayedMaxes.push("");
              }
              continue;
            }

            switch (sub.name) {
              case "F":
                displayedMaxes.push(`${finalLabF}%`);
                break;
              case "FGA":
                displayedMaxes.push(`${finalLabFGA}%`);
                break;
              case "Fin Lab Grade Point":
                displayedMaxes.push(FinLabGradePoint.toFixed(3));
                break;
              default:
                displayedMaxes.push("");
                break;
            }
          } else if (context === "midterm") {
            switch (sub.name) {
              case "Mid Grade Point":
                displayedMaxes.push(MidGradePoint.toFixed(3));
                break;
              case "Midterm Grade":
                displayedMaxes.push(MidtermGrade.toFixed(2));
                break;
              default:
                displayedMaxes.push("");
                break;
            }
          } else if (context === "final") {
            switch (sub.name) {
              case "Fin Grade Point":
                displayedMaxes.push(FinGradePoint.toFixed(3));
                break;
              case "Final Period Grade":
                displayedMaxes.push(FinalGrade.toFixed(2));
                break;
              default:
                displayedMaxes.push("");
                break;
            }
          } else if (context === "computed") {
            displayedMaxes.push(values.shift() || "");
          } else {
            displayedMaxes.push("");
          }
        }
      }
    }
  };

  computeForColumns(lectureColumns, "lecture");
  computeForColumns(labColumns, "lab");
  computeForColumns(midtermColumns, "midterm");
  computeForColumns(finalLectureColumns, "final_lecture");
  computeForColumns(finalLabColumns, "final_lab");
  computeForColumns(finalColumns, "final");
  computeForColumns(computedColumns, "computed");

  const midDisplayedMaxes = displayedMaxes.slice(0, midTotalSubCols);
  const finalDisplayedMaxes = displayedMaxes.slice(midTotalSubCols, midTotalSubCols + finalTotalSubCols);
  const computedDisplayedMaxes = displayedMaxes.slice(midTotalSubCols + finalTotalSubCols);

  // --- is editable array ---
  const isEditable = allFlatSubs.map((sub) => !boldSubs.has(sub.name));

  // --- student data (initialized from crpInfo.students) ---
  interface Student {
    id: string;
    name: string;
    rawScores: string[];
  }

  const editableCount = isEditable.filter(Boolean).length;
  const [students, setStudents] = useState<Student[]>(initialStudents); // Pull initial data from crpInfo

  // --- function to get displayed values for a student ---
  const getDisplayedForStudent = (student: Student): (number | string)[] => {
    const displayed: (number | string)[] = [];
    let rawIdx = 0;

    let studentLecMGA = 0;
    let studentLabMGA = 0;
    let studentFinalLecGA = 0;
    let studentFinalLabGA = 0;

    const computeForLecture = (columns: typeof lectureColumns, isFinal = false) => {
      let cpa = 0;
      let qa = 0;
      let m = 0;
      let pitp = 0;

      // Class Standing
      const col1 = columns[0];
      let sum1 = 0;
      let max1 = 0;
      for (const sub of col1.sub) {
        if (!boldSubs.has(sub.name)) {
          const scoreStr = student.rawScores[rawIdx];
          const score = parseFloat(scoreStr) || 0;
          displayed.push(scoreStr);
          sum1 += score;
          max1 += sub.maxScore || 0;
          rawIdx++;
        } else if (sub.name === "Total Scores (SRC)") {
          displayed.push(sum1);
        } else if (sub.name === "CPA") {
          cpa = max1 > 0 ? (sum1 / max1) * 100 : 0;
          displayed.push(`${cpa}%`);
        }
      }

      // Quiz/Prelim
      const col2 = columns[1];
      let sum2 = 0;
      let max2 = 0;
      for (const sub of col2.sub) {
        if (!boldSubs.has(sub.name)) {
          const scoreStr = student.rawScores[rawIdx];
          const score = parseFloat(scoreStr) || 0;
          displayed.push(scoreStr);
          sum2 += score;
          max2 += sub.maxScore || 0;
          rawIdx++;
        } else if (sub.name === "Total Scores (SRQ)") {
          displayed.push(sum2);
        } else if (sub.name === "QA") {
          qa = max2 > 0 ? (sum2 / max2) * 100 : 0;
          displayed.push(`${qa}%`);
        }
      }

      // Exam
      const col3 = columns[2];
      let sum3 = 0;
      let max3 = 0;
      for (const sub of col3.sub) {
        if (!boldSubs.has(sub.name)) {
          const scoreStr = student.rawScores[rawIdx];
          const score = parseFloat(scoreStr) || 0;
          displayed.push(scoreStr);
          sum3 += score;
          max3 += sub.maxScore || 0;
          rawIdx++;
        } else if (sub.name === "M" || sub.name === "F") {
          m = max3 > 0 ? (sum3 / max3) * 100 : 0;
          displayed.push(`${m}%`);
        }
      }

      // PIT
      const col4 = columns[3];
      let sum4 = 0;
      let max4 = 0;
      for (const sub of col4.sub) {
        if (!boldSubs.has(sub.name)) {
          const scoreStr = student.rawScores[rawIdx];
          const score = parseFloat(scoreStr) || 0;
          displayed.push(scoreStr);
          sum4 += score;
          max4 += sub.maxScore || 0;
          rawIdx++;
        } else if (sub.name === "Total Score (PIT)") {
          displayed.push(sum4);
        } else if (sub.name === "PIT %") {
          pitp = max4 > 0 ? (sum4 / max4) * 100 : 0;
          displayed.push(`${pitp}%`);
        }
      }

      // Lecture
      const col5 = columns[4];
      for (const sub of col5.sub) {
        if (sub.name === "MGA" || sub.name === "FGA") {
          const ga = cpa * 0.1 + qa * 0.4 + m * 0.3 + pitp * 0.2;
          displayed.push(`${ga}%`);
          if (isFinal) studentFinalLecGA = ga;
          else studentLecMGA = ga;
        } else if (sub.name === "Mid Lec Grade Point" || sub.name === "Fin Lec Grade Point") {
          const ga = cpa * 0.1 + qa * 0.4 + m * 0.3 + pitp * 0.2;
          const gp = computeGradePoint(ga);
          displayed.push(gp.toFixed(3));
        } else {
          displayed.push("");
        }
      }
    };

    computeForLecture(lectureColumns);

    const computeForLab = (columns: typeof labColumns, isFinal = false) => {
      let avg1 = 0;
      let avg2 = 0;
      let m = 0;

      // Lab Exercises
      const col1 = columns[0];
      let sum1 = 0;
      let max1 = 0;
      for (const sub of col1.sub) {
        if (!boldSubs.has(sub.name)) {
          const scoreStr = student.rawScores[rawIdx];
          const score = parseFloat(scoreStr) || 0;
          displayed.push(scoreStr);
          sum1 += score;
          max1 += sub.maxScore || 0;
          rawIdx++;
        } else if (sub.name === "Total Scores (SRC)") {
          displayed.push(sum1);
        } else if (sub.name === "Average") {
          avg1 = max1 > 0 ? (sum1 / max1) * 100 : 0;
          displayed.push(`${avg1}%`); // Display with 2 decimals
        }
      }

      // Hands-On
      const col2 = columns[1];
      let sum2 = 0;
      let max2 = 0;
      for (const sub of col2.sub) {
        if (!boldSubs.has(sub.name)) {
          const scoreStr = student.rawScores[rawIdx];
          const score = parseFloat(scoreStr) || 0;
          displayed.push(scoreStr);
          sum2 += score;
          max2 += sub.maxScore || 0;
          rawIdx++;
        } else if (sub.name === "Total Scores (SRQ)") {
          displayed.push(sum2);
        } else if (sub.name === "Average") {
          avg2 = max2 > 0 ? (sum2 / max2) * 100 : 0;
          displayed.push(`${avg2}%`); // Display with 2 decimals
        }
      }

      // Lab Major
      const col3 = columns[2];
      let sum3 = 0;
      let max3 = 0;
      for (const sub of col3.sub) {
        if (!boldSubs.has(sub.name)) {
          const scoreStr = student.rawScores[rawIdx];
          const score = parseFloat(scoreStr) || 0;
          displayed.push(scoreStr);
          sum3 += score;
          max3 += sub.maxScore || 0;
          rawIdx++;
        } else if (sub.name === "M" || sub.name === "F") {
          m = max3 > 0 ? (sum3 / max3) * 100 : 0;
          displayed.push(`${m}%`); // Display with 2 decimals
        }
      }

      // Laboratory
      const col4 = columns[3];
      for (const sub of col4.sub) {
        if (sub.name === "MGA" || sub.name === "FGA") {
          const ga = avg1 * 0.3 + avg2 * 0.3 + m * 0.4;
          displayed.push(`${ga}%`);
          if (isFinal) studentFinalLabGA = ga;
          else studentLabMGA = ga;
        } else if (sub.name === "Mid Lab Grade Point" || sub.name === "Fin Lab Grade Point") {
          const ga = avg1 * 0.3 + avg2 * 0.3 + m * 0.4;
          const gp = computeGradePoint(ga);
          displayed.push(gp.toFixed(3));
        } else {
          displayed.push("");
        }
      }
    };

    computeForLab(labColumns);

    // Midterm
    const studentMidLecGP = computeGradePoint(studentLecMGA);
    const studentMidLabGP = computeGradePoint(studentLabMGA);
    const studentMidGP = studentMidLecGP * 0.67 + studentMidLabGP * 0.33;
    const studentMidtermGrade = mapToGrade(studentMidGP);

    for (const col of midtermColumns) {
      for (const sub of col.sub) {
        if (sub.name === "Mid Grade Point") {
          displayed.push(studentMidGP.toFixed(3));
        } else if (sub.name === "Midterm Grade") {
          displayed.push(studentMidtermGrade.toFixed(2));
        } else {
          displayed.push("");
        }
      }
    }

    // Final Lecture
    computeForLecture(finalLectureColumns, true);

    // Final Lab
    computeForLab(finalLabColumns, true);

    // Final
    const studentFinLecGP = computeGradePoint(studentFinalLecGA);
    const studentFinLabGP = computeGradePoint(studentFinalLabGA);
    const studentFinGP = studentFinLecGP * 0.67 + studentFinLabGP * 0.33;
    const studentFinalGrade = mapToGrade(studentFinGP);

    for (const col of finalColumns) {
      for (const sub of col.sub) {
        if (sub.name === "Fin Grade Point") {
          displayed.push(studentFinGP.toFixed(3));
        } else if (sub.name === "Final Period Grade") {
          displayed.push(studentFinalGrade.toFixed(2));
        } else {
          displayed.push("");
        }
      }
    }

    // Computed Final Grades
    const mtg = studentMidtermGrade;
    const ftg = studentFinalGrade;

    // 50/50 scheme
    const halfBase = (0.5 * mtg + 0.5 * ftg).toFixed(2);
    displayed.push(halfBase);
    const halfClosest = mapToGrade(parseFloat(halfBase));
    displayed.push(halfClosest.toFixed(2)); // For Removal
    displayed.push(halfClosest.toFixed(2)); // After Removal
    displayed.push(getDescription(halfClosest)); // Description

    // 33/67 scheme
    const thirdBase = ((1 / 3) * mtg + (2 / 3) * ftg).toFixed(2);
    displayed.push(thirdBase);
    const thirdClosest = mapToGrade(parseFloat(thirdBase));
    displayed.push(thirdClosest.toFixed(2)); // For Removal
    displayed.push(thirdClosest.toFixed(2)); // After Removal
    displayed.push(getDescription(thirdClosest)); // Description

    displayed.push(""); // Remarks

    return displayed;
  };

  const displayedForStudents = useMemo(() => students.map(getDisplayedForStudent), [students]);

  const handleChange = (studentIdx: number, rawIdx: number, value: string) => {
    const newStudents = [...students];
    newStudents[studentIdx].rawScores[rawIdx] = value;
    setStudents(newStudents);
  };

  return (
    <div className="text-gray-700 min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-20 bg-white h-20 flex items-center px-6 border border-gray-200">
        <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-800">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold ml-4">Class Record</h1>
      </header>

      {/* Main */}
      <main className="pt-19.5 flex-grow">
        <div className="bg-white">
          <table className="table-auto border-collapse border border-gray-300 min-w-max">
            <tbody>
              {/* Row 1 */}
              <tr>
                <td
                  rowSpan={5}
                  colSpan={bigLeftColSpan}
                  className="border border-gray-300 align-middle"
                  style={{ width: 375 }}
                >
                  <div className="h-full flex flex-col justify-center">
                    <div><span className="font-medium">Department:</span> {meta.department}</div>
                    <div><span className="font-medium">Subject:</span> {meta.subject}</div>
                    <div><span className="font-medium">Schedule:</span> {meta.schedule}</div>
                    <div><span className="font-medium">Year and Section:</span> {meta.yearSection}</div>
                  </div>
                </td>

                {/* First Vertical bar */}
                <td rowSpan={totalSpan} className="bg-ucap-blue" style={{ width: 35 }} />

                <td
                  className="border border-gray-300 px-4 py-2 bg-light-blue text-center font-semibold"
                  colSpan={midTotalSubCols}
                >
                  Midterm Grade
                </td>

                {/* First Space Column */}
                <td rowSpan={totalSpan} style={{ width: 100 }}></td>

                {/* Second Vertical bar */}
                <td rowSpan={totalSpan} className="bg-ucap-blue" style={{ width: 35 }} />

                <td
                  className="border border-gray-300 px-4 py-2 bg-light-blue text-center font-semibold"
                  colSpan={finalTotalSubCols}
                >
                  Final Grade
                </td>

                {/* Second Space Column */}
                <td rowSpan={totalSpan} style={{ width: 100 }}></td>

                {/* Third Vertical bar */}
                <td rowSpan={totalSpan} className="bg-ucap-blue" style={{ width: 35 }} />

                {/* New Computed Final Grade (rows 1-3 merged) */}
                <td
                  className="border border-gray-300 px-4 py-2 bg-ucap-green text-center text-white"
                  colSpan={computedSubCount}
                  rowSpan={3}
                  style={{ fontSize: '25px' }}
                >
                  Computed Final Grade
                </td>
              </tr>

              {/* Row 2 */}
              <tr>
                <td
                  className="border border-gray-300 px-4 py-2 bg-ucap-yellow text-center font-medium"
                  colSpan={lecSubCount}
                >
                  Lecture (67%)
                </td>

                <td
                  className="border border-gray-300 px-4 py-2 bg-ucap-yellow text-center font-medium"
                  colSpan={labSubCount}
                >
                  Laboratory (33%)
                </td>

                <td
                  className="border border-gray-300 px-4 py-2 bg-ucap-yellow text-center font-medium"
                  colSpan={midSubCount}
                >
                  Midterm
                </td>

                <td
                  className="border border-gray-300 px-4 py-2 bg-ucap-yellow text-center font-medium"
                  colSpan={finalLecSubCount}
                >
                  Lecture (67%)
                </td>

                <td
                  className="border border-gray-300 px-4 py-2 bg-ucap-yellow text-center font-medium"
                  colSpan={finalLabSubCount}
                >
                  Laboratory (33%)
                </td>

                <td
                  className="border border-gray-300 px-4 py-2 bg-ucap-yellow text-center font-medium"
                  colSpan={finalSubCount}
                >
                  Final
                </td>
              </tr>

              {/* Row 3: group labels */}
              <tr>
                {lectureColumns.map((g, idx) => (
                  <td
                    key={`lec-g-${idx}`}
                    className="border border-gray-300 px-4 py-2 bg-bright-yellow text-center"
                    colSpan={Math.max(1, g.sub.length)}
                  >
                    {g.label}
                  </td>
                ))}

                {labColumns.map((g, idx) => (
                  <td
                    key={`lab-g-${idx}`}
                    className="border border-gray-300 px-4 py-2 bg-bright-yellow text-center"
                    colSpan={Math.max(1, g.sub.length)}
                  >
                    {g.label}
                  </td>
                ))}

                {midtermColumns.map((g, idx) => (
                  <td
                    key={`mid-g-${idx}`}
                    className="border border-gray-300 px-4 py-2 bg-ucap-yellow text-center"
                    colSpan={Math.max(1, g.sub.length)}
                  >
                    {g.label}
                  </td>
                ))}

                {finalLectureColumns.map((g, idx) => (
                  <td
                    key={`fin-lec-g-${idx}`}
                    className="border border-gray-300 px-4 py-2 bg-bright-yellow text-center"
                    colSpan={Math.max(1, g.sub.length)}
                  >
                    {g.label}
                  </td>
                ))}

                {finalLabColumns.map((g, idx) => (
                  <td
                    key={`fin-lab-g-${idx}`}
                    className="border border-gray-300 px-4 py-2 bg-bright-yellow text-center"
                    colSpan={Math.max(1, g.sub.length)}
                  >
                    {g.label}
                  </td>
                ))}

                {finalColumns.map((g, idx) => (
                  <td
                    key={`fin-g-${idx}`}
                    className="border border-gray-300 px-4 py-2 bg-ucap-yellow text-center"
                    colSpan={Math.max(1, g.sub.length)}
                  >
                    {g.label}
                  </td>
                ))}
              </tr>

              {/* Row 4: rotated sub names */}
              <tr>
                {allFlatSubs.slice(0, midTotalSubCols + finalTotalSubCols).map((sub, idx) => (
                  <td
                    key={`sub-${idx}`}
                    className={`border border-gray-300 px-2 py-2 ${sub.name === "Midterm Grade" || sub.name === "Final Period Grade" ? "bg-ucap-yellow" : ""}`}
                    style={{ width: 50 }}
                  >
                    <div className="flex justify-center h-full">
                      <div
                        style={{ writingMode: "vertical-rl" }}
                        className={`rotate-180 whitespace-nowrap text-sm ${boldSubs.has(sub.name) ? "font-bold" : ""}`}
                      >
                        {sub.name}
                      </div>
                    </div>
                  </td>
                ))}
                {allFlatSubs.slice(midTotalSubCols + finalTotalSubCols).map((sub, idx) => (
                  <td
                    key={`computed-sub-${idx}`}
                    rowSpan={2}
                    className={`border border-gray-300 px-2 py-2 text-center text-sm ${boldSubs.has(sub.name) ? "font-bold" : ""}`}
                    style={{ width: 75 }}
                  >
                    {sub.name}
                  </td>
                ))}
              </tr>

              {/* Row 5: dropdowns (Bloom's Taxonomy) */}
              <tr>
                {allFlatSubs.slice(0, midTotalSubCols + finalTotalSubCols).map((sub, idx) => {
                  const isBold = boldSubs.has(sub.name);
                  return (
                    <td
                      key={`row5-${idx}`}
                      className={`border border-gray-300 px-0 py-2 text-center relative ${isBold ? "" : "bg-gray-200"} ${sub.name === "Midterm Grade" || sub.name === "Final Period Grade" ? "bg-ucap-yellow" : ""}`}
                      style={{ minWidth: 60 }}
                    >
                      {isBold ? null : (
                        <>
                          <select
                            className="w-full h-full text-sm border-0 text-center focus:ring-0 px-2 pr-6 appearance-none bg-gray-200"
                          >
                            {["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"].map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                          <svg
                            className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </>
                      )}
                    </td>
                  );
                })}
                {/* No cells for computed section due to rowspan=2 */}
              </tr>

              {/* Horizontal bar */}
              <tr>
                <td
                  colSpan={bigLeftColSpan + midTotalSubCols + finalTotalSubCols + computedSubCount + 5} // Adjusted for structure (3 big + mid + final + computed + 5 for verticals/spaces)
                  className="bg-ucap-blue h-10"
                />
              </tr>

              {/* Student Header Row with Max Scores */}
              <tr>
                <td className="border border-gray-300 px-2 py-2 text-center font-semibold">No.</td>
                <td className="border border-gray-300 px-2 py-2 text-center font-semibold">Student ID</td>
                <td className="border border-gray-300 px-2 py-2 text-center font-semibold">Name</td>
                {midDisplayedMaxes.map((val, idx) => {
                  const subIdx = allFlatSubs.slice(0, midTotalSubCols)[idx];
                  const isMidtermGrade = subIdx && subIdx.name === "Midterm Grade";
                  const isGradePoint = subIdx && (subIdx.name === "Mid Lec Grade Point" || subIdx.name === "Mid Lab Grade Point");
                  return (
                    <td
                      key={`student-header-mid-${idx}`}
                      className={`border border-gray-300 px-2 py-2 text-center text-coa-blue ${isMidtermGrade ? "bg-ucap-yellow" : ""} ${isGradePoint ? "bg-pale-green" : ""}`}
                      style={{ minWidth: 60 }}
                    >
                      {val}
                    </td>
                  );
                })}
                {finalDisplayedMaxes.map((val, idx) => {
                  const subIdx = allFlatSubs.slice(midTotalSubCols, midTotalSubCols + finalTotalSubCols)[idx];
                  const isFinalGrade = subIdx && subIdx.name === "Final Period Grade";
                  const isGradePoint = subIdx && (subIdx.name === "Fin Lec Grade Point" || subIdx.name === "Fin Lab Grade Point");
                  return (
                    <td
                      key={`student-header-final-${idx}`}
                      className={`border border-gray-300 px-2 py-2 text-center text-coa-blue ${isFinalGrade ? "bg-ucap-yellow" : ""} ${isGradePoint ? "bg-pale-green" : ""}`}
                      style={{ minWidth: 60 }}
                    >
                      {val}
                    </td>
                  );
                })}
                {computedDisplayedMaxes.map((val, idx) => (
                  <td
                    key={`student-header-computed-${idx}`}
                    className="border border-gray-300 px-2 py-2 text-center text-coa-blue"
                    style={{ width: 75 }}
                  >
                    {val}
                  </td>
                ))}
              </tr>

              {/* Student rows */}
              {students.map((student, studentIdx) => (
                <tr key={studentIdx}>
                  <td className="border border-gray-300 px-2 py-2 text-center">{studentIdx + 1}</td>
                  <td className="border border-gray-300 px-2 py-2 text-center">{student.id}</td>
                  <td className="border border-gray-300 px-2 py-2 text-left">{student.name}</td>
                  {displayedForStudents[studentIdx].slice(0, midTotalSubCols).map((val, idx) => {
                    const editableIdx = allFlatSubs.slice(0, idx).filter((sub) => !boldSubs.has(sub.name)).length;
                    const subName = allFlatSubs[idx].name;
                    const isMidtermGrade = subName === "Midterm Grade";
                    const isGradePoint = subName === "Mid Lec Grade Point" || subName === "Mid Lab Grade Point";
                    const isBold = boldSubs.has(subName);
                    let cellClass = `border border-gray-300 px-2 py-2 text-center ${isMidtermGrade ? "bg-ucap-yellow" : ""}`;
                    if (isGradePoint) {
                      cellClass += " bg-pale-green";
                    }
                    let textClass = "";
                    if (isBold && !isGradePoint) {
                      textClass = "text-coa-blue";
                    } else if (isGradePoint) {
                      const gradeValue = parseFloat(val as string);
                      textClass = gradeValue < 3 ? "text-coa-blue" : "text-coa-red";
                    }
                    return (
                      <td
                        key={`mid-${idx}`}
                        className={cellClass}
                        style={{ minWidth: 60 }}
                      >
                        {isEditable[idx] ? (
                          <input
                            type="number"
                            value={val as string}
                            onChange={(e) => handleChange(studentIdx, editableIdx, e.target.value)}
                            className="w-full h-full text-center border-0 focus:ring-0"
                          />
                        ) : (
                          <span className={textClass}>{val}</span>
                        )}
                      </td>
                    );
                  })}
                  {displayedForStudents[studentIdx].slice(midTotalSubCols, midTotalSubCols + finalTotalSubCols).map((val, idx) => {
                    const editableIdx = allFlatSubs.slice(0, midTotalSubCols + idx).filter((sub) => !boldSubs.has(sub.name)).length;
                    const subName = allFlatSubs[midTotalSubCols + idx].name;
                    const isFinalGrade = subName === "Final Period Grade";
                    const isGradePoint = subName === "Fin Lec Grade Point" || subName === "Fin Lab Grade Point";
                    const isBold = boldSubs.has(subName);
                    let cellClass = `border border-gray-300 px-2 py-2 text-center ${isFinalGrade ? "bg-ucap-yellow" : ""}`;
                    if (isGradePoint) {
                      cellClass += " bg-pale-green";
                    }
                    let textClass = "";
                    if (isBold && !isGradePoint) {
                      textClass = "text-coa-blue";
                    } else if (isGradePoint) {
                      const gradeValue = parseFloat(val as string);
                      textClass = gradeValue < 3 ? "text-coa-blue" : "text-coa-red";
                    }
                    return (
                      <td
                        key={`final-${idx}`}
                        className={cellClass}
                        style={{ minWidth: 60 }}
                      >
                        {isEditable[midTotalSubCols + idx] ? (
                          <input
                            type="number"
                            value={val as string}
                            onChange={(e) => handleChange(studentIdx, editableIdx, e.target.value)}
                            className="w-full h-full text-center border-0 focus:ring-0"
                          />
                        ) : (
                          <span className={textClass}>{val}</span>
                        )}
                      </td>
                    );
                  })}
                  {displayedForStudents[studentIdx].slice(midTotalSubCols + finalTotalSubCols).map((val, idx) => {
                    const subName = allFlatSubs[midTotalSubCols + finalTotalSubCols + idx].name;
                    const isGrade = subName.includes("MTG +") && !subName.includes("Description") && !subName.includes("Remarks");
                    const isBold = boldSubs.has(subName);
                    let cellClass = "border border-gray-300 px-2 py-2 text-center";
                    let textClass = "";
                    if (isBold) {
                      textClass = "text-coa-blue";
                    }
                    if (isGrade) {
                      const gradeValue = parseFloat(val as string);
                      if (!isNaN(gradeValue)) {
                        textClass = gradeValue < 3 ? "text-coa-blue" : "text-coa-red";
                      }
                    }
                    if (val === "Failed") {
                      textClass = "text-coa-red";
                    }
                    return (
                      <td
                        key={`computed-${idx}`}
                        className={cellClass}
                        style={{ minWidth: 75 }}
                      >
                        <span className={textClass}>{val}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Footer */}
      <footer
        className={`fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-300 transition-transform duration-300 ${footerOpen ? "translate-y-0" : "translate-y-full"}`}
      >
        <div
          className="absolute -top-10 right-10 w-12 h-10 rounded-tl-full rounded-tr-full bg-white flex items-center justify-center cursor-pointer border-t border-l border-r border-gray-300"
          onClick={() => setFooterOpen((o) => !o)}
        >
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${footerOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <div className="px-8 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6 text-base text-gray-600">
              <button className="flex items-center space-x-2 hover:underline cursor-pointer">
                <img src="/import.svg" alt="Import" className="w-4 h-4" />
                <span>Import Master List</span>
              </button>
              <button className="flex items-center space-x-2 hover:underline cursor-pointer">
                <img src="/customize.svg" alt="Customize" className="w-4 h-4" />
                <span>Customize Class Record</span>
              </button>
              <button className="flex items-center space-x-2 hover:underline cursor-pointer">
                <img src="/export.svg" alt="Export" className="w-4 h-4" />
                <span>Export Class Record</span>
              </button>
            </div>
            <button
              onClick={() => navigate("/course_dashboard/section/course_outcome_assessment")}
              className="flex items-center space-x-2 bg-ucap-yellow bg-ucap-yellow-hover text-white font-semibold py-2 px-4 rounded-full shadow transition-all duration-200"
            >
              <img src="/generate.svg" alt="Generate" className="w-4 h-4" />
              <span>Generate COA Result Sheet</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}