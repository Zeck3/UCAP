// ../data/rspInfo.ts
// Define Assessment interface for individual assessment items with title, blooms, and maximum score
export interface Assessment {
  title: string;
  blooms: string[]; // Changed to array for better handling of multiple levels
  maxScore: number;
}

// Define CO interface for course outcomes with title and assessments array
export interface CO {
  title: string;
  assessments: Assessment[];
}

// Define PO interface for program outcomes with title and cos array
export interface PO {
  title: string;
  cos: CO[];
}

// Define Student interface for student details and scores object
export interface Student {
  id: string;
  fName: string;
  lName: string;
  scores: { [coTitle: string]: number[] };
}

// Define RSPInfo interface for overall response information
export interface RSPInfo {
  info: {
    cacode: string;
    program: string;
    course: string;
    aySemester: string;
    faculty: string;
  };
  pos: PO[];
  students: Student[];
}

// Export the RSPInfo constant containing class details, program outcomes, and student data
export const rspInfo: RSPInfo = {
  info: {
    cacode: "Cagayan de Oro Campus / College of Engineering and Architecture / Department of Electronics Engineering",
    program: "Bachelor in Science in Electronics Engineering",
    course: "ECE 411 - Communication Systems Analysis and Design",
    aySemester: "2025-2026 / 1st Semester",
    faculty: "Jotaro Kujo",
  },
  pos: [
    {
      title: "PO-a, PO-b, PO-c, PO-e, PO-g, & PO-j",
      cos: [
        {
          title: "CO1 (Lecture)",
          assessments: [
            { title: "Assign 1", blooms: ["Remember", "Understand"], maxScore: 15 },
            { title: "Assign 2", blooms: ["Apply"], maxScore: 15 },
            { title: "Assign 3", blooms: ["Remember", "Understand"], maxScore: 10 },
            { title: "Quiz 1", blooms: ["Remember", "Understand"], maxScore: 20 },
            { title: "Quiz 2", blooms: ["Apply"], maxScore: 30 },
            { title: "Quiz 3", blooms: ["Apply"], maxScore: 50 },
            { title: "Quiz 4", blooms: ["Apply", "Analyze"], maxScore: 60 },
            { title: "Seat Work 1", blooms: ["Remember", "Understand"], maxScore: 20 },
            { title: "Seat Work 2", blooms: ["Apply"], maxScore: 15 },
            { title: "Prelim Exam", blooms: ["Apply", "Analyze"], maxScore: 25 },
            { title: "Mid Written Exam", blooms: ["Apply", "Analyze"], maxScore: 100 },
            { title: "PIT 1", blooms: ["Evaluate", "Create"], maxScore: 50 },
            { title: "PIT 2", blooms: ["Evaluate", "Create"], maxScore: 50 },
          ],
        },
        {
          title: "CO1 (Laboratory)",
          assessments: [
            { title: "Laboratory 1", blooms: ["Understand", "Apply"], maxScore: 50 },
            { title: "Laboratory 2", blooms: ["Analyze"], maxScore: 50 },
            { title: "Laboratory 3", blooms: ["Apply", "Analyze"], maxScore: 10 },
            { title: "Laboratory 4", blooms: ["Analyze", "Evaluate"], maxScore: 10 },
            { title: "Laboratory 5", blooms: ["Evaluate"], maxScore: 30 },
            { title: "Problem Set 1", blooms: ["Analyze", "Evaluate"], maxScore: 30 },
            { title: "Problem Set 2", blooms: ["Analyze"], maxScore: 40 },
            { title: "Problem Set 3", blooms: ["Apply"], maxScore: 30 },
            { title: "Mid Lab Exam", blooms: ["Create"], maxScore: 100 },
          ],
        },
      ],
    },
    {
      title: "PO-a, PO-b, PO-c, PO-e, PO-g, & PO-j",
      cos: [
        {
          title: "CO2 (Lecture)",
          assessments: [
            { title: "Assign 4", blooms: ["Apply", "Analyze"], maxScore: 10 },
            { title: "Assign 5", blooms: ["Remember", "Understand"], maxScore: 10 },
            { title: "Quiz 5", blooms: ["Evaluate"], maxScore: 20 },
            { title: "Quiz 6", blooms: ["Apply", "Analyze"], maxScore: 30 },
            { title: "Quiz 7", blooms: ["Understand", "Apply"], maxScore: 10 },
            { title: "Quiz 8", blooms: ["Analyze", "Evaluate"], maxScore: 30 },
            { title: "Seat Work 3", blooms: ["Apply"], maxScore: 20 },
            { title: "Seat Work 4", blooms: ["Remember", "Understand"], maxScore: 10 },
            { title: "Seat Work 5", blooms: ["Remember", "Understand"], maxScore: 10 },
            { title: "Final Exam", blooms: ["Evaluate", "Create"], maxScore: 50 },
            { title: "PIT 1", blooms: ["Evaluate", "Create"], maxScore: 50 },
            { title: "PIT 2", blooms: ["Create"], maxScore: 50 },
          ],
        },
        {
          title: "CO2 (Laboratory)",
          assessments: [
            { title: "Laboratory 6", blooms: ["Apply"], maxScore: 20 },
            { title: "Laboratory 7", blooms: ["Analyze", "Evaluate"], maxScore: 30 },
            { title: "Laboratory 8", blooms: ["Analyze"], maxScore: 10 },
            { title: "Laboratory 9", blooms: ["Remember", "Understand"], maxScore: 20 },
            { title: "Problem Set 4", blooms: ["Apply", "Analyze"], maxScore: 30 },
            { title: "Problem Set 5", blooms: ["Evaluate", "Create"], maxScore: 10 },
            { title: "Problem Set 6", blooms: ["Evaluate"], maxScore: 30 },
            { title: "Report 1", blooms: ["Understand", "Apply"], maxScore: 20 },
            { title: "Mid Lab Exam", blooms: ["Create"], maxScore: 100 },
          ],
        },
      ],
    },
    {
      title: "PO-a, PO-b, PO-c, PO-e, PO-g, & PO-j",
      cos: [
        {
          title: "CO1 & CO2",
          assessments: [
            { title: "Fin Written Exam", blooms: ["Apply", "Analyze"], maxScore: 100 },
          ],
        },
      ],
    },
  ],
  students: [
    {
      id: "2025000000",
      fName: "Dio",
      lName: "Brando",
      scores: {
        "CO1 (Lecture)": [
          15, 10, 8, 18, 25,
          35, 40, 15, 8, 15,
          48, 40, 40,
        ],
        "CO1 (Laboratory)": [
          0, 40, 10, 9, 14,
          30, 28, 21, 90,
        ],
        "CO2 (Lecture)": [
          10, 10, 20, 15, 10,
          15, 20, 9, 8, 45,
          40, 40,
        ],
        "CO2 (Laboratory)": [
          20, 23, 9, 8, 27,
          9, 25, 19, 80,
        ],
        "CO1 & CO2": [40],
      },
    },
    {
      id: "2025000001",
      fName: "Giorno",
      lName: "Giovanna",
      scores: {
        "CO1 (Lecture)": [
          15, 8, 10, 18, 25,
          43, 50, 15, 4, 10,
          42, 40, 40,
        ],
        "CO1 (Laboratory)": [
          0, 40, 8, 10, 15,
          30, 28, 21, 90,
        ],
        "CO2 (Lecture)": [
          10, 10, 20, 20, 10,
          20, 20, 9, 6, 44,
          40, 40,
        ],
        "CO2 (Laboratory)": [
          19, 22, 9, 8, 28,
          5, 10, 17, 98,
        ],
        "CO1 & CO2": [47],
      },
    },
    {
      id: "2025000002",
      fName: "Josuke",
      lName: "Higashikata",
      scores: {
        "CO1 (Lecture)": [
          15, 8, 10, 18, 25,
          43, 55, 15, 5, 15,
          20, 43, 42,
        ],
        "CO1 (Laboratory)": [
          0, 40, 9, 9, 21,
          30, 28, 26, 90,
        ],
        "CO2 (Lecture)": [
          10, 0, 20, 15, 3,
          20, 20, 6, 9, 44,
          42, 45,
        ],
        "CO2 (Laboratory)": [
          17, 11, 8, 8, 20,
          10, 10, 18, 87,
        ],
        "CO1 & CO2": [29],
      },
    },
    {
      id: "2025000003",
      fName: "Koichi",
      lName: "Hirose",
      scores: {
        "CO1 (Lecture)": [
          15, 9, 10, 16, 25,
          35, 35, 20, 6, 15,
          46, 40, 40,
        ],
        "CO1 (Laboratory)": [
          0, 40, 7, 10, 9,
          30, 28, 21, 92,
        ],
        "CO2 (Lecture)": [
          10, 0, 20, 20, 10,
          20, 20, 9, 8, 45,
          40, 40,
        ],
        "CO2 (Laboratory)": [
          18, 18, 8, 9, 14,
          9, 30, 12, 87,
        ],
        "CO1 & CO2": [64],
      },
    },
    {
      id: "2025000004",
      fName: "Hol",
      lName: "Horse",
      scores: {
        "CO1 (Lecture)": [
          15, 10, 8, 18, 25,
          43, 60, 20, 14, 18,
          58, 40, 25,
        ],
        "CO1 (Laboratory)": [
          40, 40, 5, 10, 25,
          24, 0, 0, 90,
        ],
        "CO2 (Lecture)": [
          10, 10, 20, 15, 10,
          25, 20, 6, 8, 49,
          35, 40,
        ],
        "CO2 (Laboratory)": [
          12, 12, 9, 8, 16,
          7, 25, 12, 27,
        ],
        "CO1 & CO2": [61],
      },
    },
  ],
};