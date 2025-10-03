// crpInfo.ts (modified)
export interface CRPItem {
  title: string;
  maxScore: number;
}

export interface CRPPeriod {
  lecture: {
    classStanding: CRPItem[];
    quizPrelim: CRPItem[];
    lecExam: CRPItem[];
    perInnoTask: CRPItem[];
  };
  laboratory: {
    labRepExc: CRPItem[];
    handsOnExc: CRPItem[];
    labExam: CRPItem[];
  };
}

export interface Student {
  studentId: string;
  fName: string;
  lName: string;
  scores: number[]; // Changed to array; order must match assignmentKeys
}

export interface CRPInfo {
  info: {
    department: string;
    subject: string;
    schedule: string;
    yearSection: string;
  };
  midterm: CRPPeriod;
  final: CRPPeriod;
  students: Student[];
}

export const crpInfo: CRPInfo = {
  info: {
    department: "Department of Electronics Engineering",
    subject: "EC 415",
    schedule: "MF/6-9 PM",
    yearSection: "4A_1",
  },
  midterm: {
    lecture: {
      classStanding: [
        { title: "Assign 1", maxScore: 15 },
        { title: "Assign 2", maxScore: 15 },
        { title: "Assign 3", maxScore: 10 },
        { title: "Seatwork 1", maxScore: 20 },
        { title: "Seatwork 2", maxScore: 15 },
      ],
      quizPrelim: [
        { title: "Quiz 1", maxScore: 20 },
        { title: "Quiz 2", maxScore: 30 },
        { title: "Quiz 3", maxScore: 50 },
        { title: "Quiz 4", maxScore: 60 },
        { title: "Prelim Exam", maxScore: 25 },
      ],
      lecExam: [{ title: "Mid Written Exam", maxScore: 100 }],
      perInnoTask: [
        { title: "PIT 1", maxScore: 50 },
        { title: "PIT 2", maxScore: 50 },
      ],
    },
    laboratory: {
      labRepExc: [
        { title: "Laboratory 1", maxScore: 50 },
        { title: "Laboratory 2", maxScore: 50 },
        { title: "Laboratory 3", maxScore: 10 },
        { title: "Laboratory 4", maxScore: 10 },
        { title: "Laboratory 5", maxScore: 30 },
      ],
      handsOnExc: [
        { title: "Problem Set 1", maxScore: 30 },
        { title: "Problem Set 2", maxScore: 40 },
        { title: "Problem Set 3", maxScore: 30 },
      ],
      labExam: [{ title: "Mid Lab Exam", maxScore: 100 }],
    },
  },
  final: {
    lecture: {
      classStanding: [
        { title: "Assign 4", maxScore: 10 },
        { title: "Assign 5", maxScore: 10 },
        { title: "Seatwork 3", maxScore: 20 },
        { title: "Seatwork 4", maxScore: 10 },
        { title: "Seatwork 5", maxScore: 10 },
      ],
      quizPrelim: [
        { title: "Quiz 5", maxScore: 20 },
        { title: "Quiz 6", maxScore: 30 },
        { title: "Quiz 7", maxScore: 10 },
        { title: "Quiz 8", maxScore: 30 },
        { title: "SFinal Exam", maxScore: 50 },
      ],
      lecExam: [{ title: "Fin Written Exam", maxScore: 100 }],
      perInnoTask: [
        { title: "PIT 1", maxScore: 50 },
        { title: "PIT 2", maxScore: 50 },
      ],
    },
    laboratory: {
      labRepExc: [
        { title: "Report 2", maxScore: 20 },
        { title: "Laboratory 6", maxScore: 20 },
        { title: "Laboratory 7", maxScore: 30 },
        { title: "Laboratory 8", maxScore: 10 },
        { title: "Laboratory 9", maxScore: 20 },
      ],
      handsOnExc: [
        { title: "Problem Set 4", maxScore: 30 },
        { title: "Problem Set 5", maxScore: 10 },
        { title: "Problem Set 6", maxScore: 30 },
      ],
      labExam: [{ title: "Fin Lab Exam", maxScore: 100 }],
    },
  },
  students: [
    {
      studentId: "2025000000",
      fName: "Dio",
      lName: "Brando",
      scores: [
        15, 10, 8, 15, 8,
        18, 25, 35, 40, 15,
        48,
        40, 40,
        0, 40, 10, 9, 14,
        30, 28, 21,
        90,
        10, 10, 20, 9, 8,
        20, 15, 10, 15, 45,
        40,
        40, 40,
        19, 20, 23, 9, 8,
        27, 9, 25,
        80,
      ],
    },
    {
      studentId: "2025000001",
      fName: "Giorno",
      lName: "Giovanna",
      scores: [
        15, 8, 10, 15, 4,
        18, 25, 43, 50, 10,
        42,
        40, 40,
        0, 40, 8, 10, 15,
        30, 28, 21,
        90,
        10, 10, 20, 9, 6,
        20, 20, 10, 20, 44,
        47,
        40, 40,
        17, 19, 22, 9, 8,
        28, 5, 10,
        98,
      ],
    },
    {
      studentId: "2025000002",
      fName: "Josuke",
      lName: "Higashikata",
      scores: [
        15, 8, 10, 15, 5,
        18, 25, 43, 55, 15,
        20,
        43, 42,
        0, 40, 9, 9, 21,
        30, 28, 26,
        90,
        10, 0, 20, 6, 9,
        20, 15, 3, 20, 44,
        29,
        42, 45,
        18, 17, 11, 8, 8,
        20, 10, 10,
        87,
      ],
    },
    
  ],
};