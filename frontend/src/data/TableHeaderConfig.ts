import { crpInfo } from "./crpInfo";

// Define HeaderNode interface for table header structure
export interface HeaderNode {
  title: string;
  children: HeaderNode[];
  isRowSpan?: boolean;
  type?: "normal" | "v-separator" | "spacer" | "h-separator";
  needsButton?: boolean;
  maxScore?: number;
  key?: string;
  colSpan?: number;
  calculationType?: "assignment" | "sum" | "percentage" | "weightedAverage" | "gradePoint" | "totalGradePoint" | "roundedGrade" | "computed";
  groupKeys?: string[];
  dependsOn?: string[];
  weights?: number[];
  customRowSpan?: number;
  studentInfo?: boolean;
  computedGrades?: boolean;
}

// Create spanning cell for class information display
export function createSpanningCell(): HeaderNode {
  const lines = [
    `Department: ${crpInfo.info.department}`,
    `Subject: ${crpInfo.info.subject}`,
    `Schedule: ${crpInfo.info.schedule}`,
    `Year and Section: ${crpInfo.info.yearSection}`,
  ];

  return {
    title: lines.join("\n"),
    children: [],
    isRowSpan: true,
    type: "normal",
    colSpan: 3,
    studentInfo: true,
  };
}

// Create computed final grade section with various calculations
export function createComputedSection(): HeaderNode {
  const titles = [
    "1/2 MTG + 1/2 FTG",
    "1/2 MTG + 1/2 FTG (For Removal)",
    "1/2 MTG + 1/2 FTG (After Removal)",
    "Description",
    "1/3 MTG + 2/3 FTG",
    "1/3 MTG + 2/3 FTG (For Removal)",
    "1/3 MTG + 2/3 FTG (After Removal)",
    "Description",
    "Remarks (INC, Withdrawn, DF, OD)"
  ];
  const keys = [
    "computed-half-weighted",
    "computed-half-for-removal",
    "computed-half-after-removal",
    "computed-half-desc",
    "computed-third-weighted",
    "computed-third-for-removal",
    "computed-third-after-removal",
    "computed-third-desc",
    "computed-remarks"
  ];
  const children: HeaderNode[] = titles.map((title, index) => ({
    title,
    children: [],
    key: keys[index],
    calculationType: "computed",
    customRowSpan: 2,
    computedGrades: true
  }));
  return {
    title: "Computed Final Grade",
    children,
    customRowSpan: 3,
    computedGrades: true
  };
}

// Create grade section for midterm or final period
export function createGradeSection(type: "Midterm" | "Final"): HeaderNode {
  const isMidterm = type === "Midterm";
  const period = isMidterm ? crpInfo.midterm : crpInfo.final;
  const periodKey = type.toLowerCase();

  // LECTURE SECTIONS
  const classStandingAssignmentNodes = period.lecture.classStanding.map((item, index) => ({
    title: item.title,
    key: `${periodKey}-lecture-classStanding-${index}`,
    maxScore: item.maxScore,
    children: [],
    needsButton: true,
    calculationType: "assignment" as const,
  }));
  const classStandingGroupKeys = classStandingAssignmentNodes.map((n) => n.key!);
  const classStandingTotalKey = `${periodKey}-lecture-classStanding-total`;
  const classStandingPercKey = `${periodKey}-lecture-classStanding-perc`;

  const quizPrelimAssignmentNodes = period.lecture.quizPrelim.map((item, index) => ({
    title: item.title,
    key: `${periodKey}-lecture-quizPrelim-${index}`,
    maxScore: item.maxScore,
    children: [],
    needsButton: true,
    calculationType: "assignment" as const,
  }));
  const quizPrelimGroupKeys = quizPrelimAssignmentNodes.map((n) => n.key!);
  const quizPrelimTotalKey = `${periodKey}-lecture-quizPrelim-total`;
  const quizPrelimPercKey = `${periodKey}-lecture-quizPrelim-perc`;

  const lecExamAssignmentNodes = period.lecture.lecExam.map((item, index) => ({
    title: item.title,
    key: `${periodKey}-lecture-lecExam-${index}`,
    maxScore: item.maxScore,
    children: [],
    needsButton: true,
    calculationType: "assignment" as const,
  }));
  const lecExamGroupKeys = lecExamAssignmentNodes.map((n) => n.key!);
  const lecExamPercKey = `${periodKey}-lecture-lecExam-perc`;

  const perInnoTaskAssignmentNodes = period.lecture.perInnoTask.map((item, index) => ({
    title: item.title,
    key: `${periodKey}-lecture-perInnoTask-${index}`,
    maxScore: item.maxScore,
    children: [],
    needsButton: true,
    calculationType: "assignment" as const,
  }));
  const perInnoTaskGroupKeys = perInnoTaskAssignmentNodes.map((n) => n.key!);
  const perInnoTaskTotalKey = `${periodKey}-lecture-perInnoTask-total`;
  const perInnoTaskPercKey = `${periodKey}-lecture-perInnoTask-perc`;

  const lectureMgaKey = `${periodKey}-lecture-mga`;
  const lectureGpKey = `${periodKey}-lecture-gradepoint`;

  // LABORATORY SECTIONS
  const labRepExcAssignmentNodes = period.laboratory.labRepExc.map((item, index) => ({
    title: item.title,
    key: `${periodKey}-laboratory-labRepExc-${index}`,
    maxScore: item.maxScore,
    children: [],
    needsButton: true,
    calculationType: "assignment" as const,
  }));
  const labRepExcGroupKeys = labRepExcAssignmentNodes.map((n) => n.key!);
  const labRepExcTotalKey = `${periodKey}-laboratory-labRepExc-total`;
  const labRepExcPercKey = `${periodKey}-laboratory-labRepExc-perc`;

  const handsOnExcAssignmentNodes = period.laboratory.handsOnExc.map((item, index) => ({
    title: item.title,
    key: `${periodKey}-laboratory-handsOnExc-${index}`,
    maxScore: item.maxScore,
    children: [],
    needsButton: true,
    calculationType: "assignment" as const,
  }));
  const handsOnExcGroupKeys = handsOnExcAssignmentNodes.map((n) => n.key!);
  const handsOnExcTotalKey = `${periodKey}-laboratory-handsOnExc-total`;
  const handsOnExcPercKey = `${periodKey}-laboratory-handsOnExc-perc`;

  const labExamAssignmentNodes = period.laboratory.labExam.map((item, index) => ({
    title: item.title,
    key: `${periodKey}-laboratory-labExam-${index}`,
    maxScore: item.maxScore,
    children: [],
    needsButton: true,
    calculationType: "assignment" as const,
  }));
  const labExamGroupKeys = labExamAssignmentNodes.map((n) => n.key!);
  const labExamPercKey = `${periodKey}-laboratory-labExam-perc`;

  const laboratoryMgaKey = `${periodKey}-laboratory-mga`;
  const laboratoryGpKey = `${periodKey}-laboratory-gradepoint`;

  // TOTAL
  const totalGpKey = `${periodKey}-total-gradepoint`;
  const totalGradeKey = `${periodKey}-total-grade`;

  return {
    title: `${type} Grade`,
    children: [
      // LECTURE
      {
        title: "Lecture (67%)",
        children: [
          {
            title: "Class Standing Performance (10%)",
            children: [
              ...classStandingAssignmentNodes,
              {
                title: "Total Score (SRC)",
                key: classStandingTotalKey,
                children: [],
                calculationType: "sum" as const,
                groupKeys: classStandingGroupKeys,
              },
              {
                title: "CPA",
                key: classStandingPercKey,
                children: [],
                calculationType: "percentage" as const,
                groupKeys: classStandingGroupKeys,
              },
            ],
          },
          {
            title: isMidterm
              ? "Quiz/Prelim Performance Item (40%)"
              : "Quiz/Pre-Final Performance Item (40%)",
            children: [
              ...quizPrelimAssignmentNodes,
              {
                title: "Total Score (SRQ)",
                key: quizPrelimTotalKey,
                children: [],
                calculationType: "sum" as const,
                groupKeys: quizPrelimGroupKeys,
              },
              {
                title: "QA",
                key: quizPrelimPercKey,
                children: [],
                calculationType: "percentage" as const,
                groupKeys: quizPrelimGroupKeys,
              },
            ],
          },
          {
            title: `${type} Exam (30%)`,
            children: [
              ...lecExamAssignmentNodes,
              {
                title: isMidterm ? "M" : "F",
                key: lecExamPercKey,
                children: [],
                calculationType: "percentage" as const,
                groupKeys: lecExamGroupKeys,
              },
            ],
          },
          {
            title: "Per Inno Task (20%)",
            children: [
              ...perInnoTaskAssignmentNodes,
              {
                title: "Total Score (PIT)",
                key: perInnoTaskTotalKey,
                children: [],
                calculationType: "sum" as const,
                groupKeys: perInnoTaskGroupKeys,
              },
              {
                title: "PIT%",
                key: perInnoTaskPercKey,
                children: [],
                calculationType: "percentage" as const,
                groupKeys: perInnoTaskGroupKeys,
              },
            ],
          },
          {
            title: "Lecture",
            children: [
              {
                title: isMidterm ? "MGA" : "FGA",
                key: lectureMgaKey,
                children: [],
                calculationType: "weightedAverage" as const,
                dependsOn: [classStandingPercKey, quizPrelimPercKey, lecExamPercKey, perInnoTaskPercKey],
                weights: [0.1, 0.4, 0.3, 0.2],
              },
              {
                title: isMidterm ? "Mid Lec Grade Point" : "Fin Lec Grade Point",
                key: lectureGpKey,
                children: [],
                calculationType: "gradePoint" as const,
                dependsOn: [lectureMgaKey],
              },
            ],
          },
        ],
      },

      // LABORATORY
      {
        title: "Laboratory (33%)",
        children: [
          {
            title: "Lab Exercises/Reports (30%)",
            children: [
              ...labRepExcAssignmentNodes,
              {
                title: "Total Score (SRC)",
                key: labRepExcTotalKey,
                children: [],
                calculationType: "sum" as const,
                groupKeys: labRepExcGroupKeys,
              },
              {
                title: "Average",
                key: labRepExcPercKey,
                children: [],
                calculationType: "percentage" as const,
                groupKeys: labRepExcGroupKeys,
              },
            ],
          },
          {
            title: "Hands-On Exercises (30%)",
            children: [
              ...handsOnExcAssignmentNodes,
              {
                title: "Total Score (SRQ)",
                key: handsOnExcTotalKey,
                children: [],
                calculationType: "sum" as const,
                groupKeys: handsOnExcGroupKeys,
              },
              {
                title: "Average",
                key: handsOnExcPercKey,
                children: [],
                calculationType: "percentage" as const,
                groupKeys: handsOnExcGroupKeys,
              },
            ],
          },
          {
            title: `Lab Major Exam (40%)`,
            children: [
              ...labExamAssignmentNodes,
              {
                title: isMidterm ? "M" : "F",
                key: labExamPercKey,
                children: [],
                calculationType: "percentage" as const,
                groupKeys: labExamGroupKeys,
              },
            ],
          },
          {
            title: "Laboratory",
            children: [
              {
                title: isMidterm ? "MGA" : "FGA",
                key: laboratoryMgaKey,
                children: [],
                calculationType: "weightedAverage" as const,
                dependsOn: [labRepExcPercKey, handsOnExcPercKey, labExamPercKey],
                weights: [0.3, 0.3, 0.4],
              },
              {
                title: isMidterm ? "Mid Lab Grade Point" : "Fin Lab Grade Point",
                key: laboratoryGpKey,
                children: [],
                calculationType: "gradePoint" as const,
                dependsOn: [laboratoryMgaKey],
              },
            ],
          },
        ],
      },

      // TOTAL GRADE
      {
        title: type,
        children: [
          {
            title: "",
            children: [
              {
                title: isMidterm ? "Mid Grade Point" : "Final Grade Point",
                key: totalGpKey,
                children: [],
                calculationType: "totalGradePoint" as const,
                dependsOn: [lectureGpKey, laboratoryGpKey],
                weights: [0.67, 0.33],
              },
              {
                title: isMidterm ? "Midterm Grade" : "Final Period Grade",
                key: totalGradeKey,
                children: [],
                calculationType: "roundedGrade" as const,
                dependsOn: [totalGpKey],
              },
            ],
          },
        ],
      },
    ],
  };
}

// Export header configuration array for table structure
export const headerConfig: HeaderNode[] = [
  createSpanningCell(),
  { title: "", children: [], type: "v-separator" },
  createGradeSection("Midterm"),
  { title: "", children: [], type: "spacer" },
  { title: "", children: [], type: "v-separator" },
  createGradeSection("Final"),
  { title: "", children: [], type: "spacer" },
  { title: "", children: [], type: "v-separator" },
  createComputedSection(),
  { title: "", children: [], type: "h-separator" },
];