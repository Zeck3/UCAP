// Define CRPItem interface for individual items with title and maximum score
export interface CRPItem {
  title: string;
  maxScore: number;
}

// Define CRPPeriod interface for lecture and laboratory sections in a period
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

// Define Student interface for student details and scores array
export interface Student {
  studentId: string;
  fName: string;
  lName: string;
  scores: number[];
}

export interface RawScore{
  student_id: number;
  assessment_id: number;
  raw_score: number;
}

// Define CRPInfo interface for overall class record information
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

// Export the CRPInfo constant containing class details, midterm and final periods, and student data
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
      ],
      quizPrelim: [
        { title: "Quiz 5", maxScore: 20 },
        { title: "Quiz 6", maxScore: 30 },
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
      studentId: "2025000002",
      fName: "Josuke",
      lName: "Higashikata",
      scores: [
        15
      ],
    },
  ],
};