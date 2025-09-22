// ../data/crpInfo.ts

// Define the type for sub items
export interface Classwork {
    name: string;
    maxScore?: number; // Optional maxScore property
}

// Define the type for column groups
export interface Column {
    label: string;
    sub: Classwork[];
}

// Define the meta info for class record
export interface CrpMeta {
    department: string;
    subject: string;
    schedule: string;
    yearSection: string;
}

// Define the student type
export interface Student {
    id: string;
    name: string;
    rawScores: string[]; // Changed to string[] to allow empty strings
}

// Define the overall structure
export interface CrpInfo {
    meta: CrpMeta;
    lectureColumns: Column[];
    labColumns: Column[];
    midtermColumns: Column[];
    finalLectureColumns: Column[];
    finalLabColumns: Column[];
    finalColumns: Column[];
    students: Student[]; // Added students array
}

export const crpInfo: CrpInfo = {
    meta: {
        department: "Department of Electronics Engineering",
        subject: "EC 415",
        schedule: "MF/6-9 PM",
        yearSection: "4A_1",
    },

    lectureColumns: [
        {
            label: "Class Standing Performance Items (10%)",
            sub: [
                { name: "Assign 1", maxScore: 15 },
                { name: "Assign 2", maxScore: 15 },
                { name: "Assign 3", maxScore: 10 },
                { name: "Seatwork 1", maxScore: 20 },
                { name: "Seatwork 2", maxScore: 15 },
                { name: "Total Scores (SRC)" },
                { name: "CPA" },
            ],
        },
        {
            label: "Quiz/Prelim Performance Items (40%)",
            sub: [
                { name: "Quiz 1", maxScore: 20 },
                { name: "Quiz 2", maxScore: 30 },
                { name: "Quiz 3", maxScore: 50 },
                { name: "Quiz 4", maxScore: 60 },
                { name: "Prelim Exam", maxScore: 25 },
                { name: "Total Scores (SRQ)" },
                { name: "QA" },
            ],
        },
        {
            label: "Midterm Exam (30%)",
            sub: [
                { name: "Mid Written Exam", maxScore: 100 },
                { name: "M" },
            ],
        },
        {
            label: "Per Inno Task (20%)",
            sub: [
                { name: "PIT 1", maxScore: 50 },
                { name: "PIT 2", maxScore: 50 },
                { name: "Total Score (PIT)" },
                { name: "PIT %" },
            ],
        },
        {
            label: "Lecture",
            sub: [
                { name: "MGA" },
                { name: "Mid Lec Grade Point" },
            ],
        },
    ],

    labColumns: [
        {
            label: "Lab Exercises/Reports (30%)",
            sub: [
                { name: "Laboratory 1", maxScore: 50 },
                { name: "Laboratory 2", maxScore: 50 },
                { name: "Laboratory 3", maxScore: 10 },
                { name: "Laboratory 4", maxScore: 10 },
                { name: "Laboratory 5", maxScore: 30 },
                { name: "Total Scores (SRC)" },
                { name: "Average" },
            ],
        },
        {
            label: "Hands-On Exercises (30%)",
            sub: [
                { name: "Problem Set 1", maxScore: 30 },
                { name: "Problem Set 2", maxScore: 40 },
                { name: "Problem Set 3", maxScore: 30 },
                { name: "Total Scores (SRQ)" },
                { name: "Average" },
            ],
        },
        {
            label: "Lab Major Exam (40%)",
            sub: [
                { name: "Mid Lab Exam", maxScore: 100 },
                { name: "M" },
            ],
        },
        {
            label: "Laboratory",
            sub: [
                { name: "MGA" },
                { name: "Mid Lab Grade Point" },
            ],
        },
    ],

    midtermColumns: [
        {
            label: "",
            sub: [
                { name: "Mid Grade Point" },
                { name: "Midterm Grade" },
            ],
        },
    ],

    finalLectureColumns: [
        {
            label: "Class Standing Performance Items (10%)",
            sub: [
                { name: "Assign 4", maxScore: 10 },
                { name: "Assign 5", maxScore: 10 },
                { name: "Seatwork 3", maxScore: 20 },
                { name: "Seatwork 4", maxScore: 10 },
                { name: "Seatwork 5", maxScore: 10 },
                { name: "Total Scores (SRC)" },
                { name: "CPA" },
            ],
        },
        {
            label: "Quiz/Prelim Performance Items (40%)",
            sub: [
                { name: "Quiz 5", maxScore: 20 },
                { name: "Quiz 6", maxScore: 30 },
                { name: "Quiz 7", maxScore: 10 },
                { name: "Quiz 8", maxScore: 30 },
                { name: "Prelim Exam", maxScore: 50 },
                { name: "Total Scores (SRQ)" },
                { name: "QA" },
            ],
        },
        {
            label: "Final Exam (30%)",
            sub: [
                { name: "Fin Written Exam", maxScore: 100 },
                { name: "F" },
            ],
        },
        {
            label: "Per Inno Task (20%)",
            sub: [
                { name: "PIT 1", maxScore: 50 },
                { name: "PIT 2", maxScore: 50 },
                { name: "Total Score (PIT)" },
                { name: "PIT %" },
            ],
        },
        {
            label: "Lecture",
            sub: [
                { name: "FGA" },
                { name: "Fin Lec Grade Point" },
            ],
        },
    ],

    finalLabColumns: [
        {
            label: "Lab Exercises/Reports (30%)",
            sub: [
                { name: "Report 1", maxScore: 20 },
                { name: "Laboratory 6", maxScore: 20 },
                { name: "Laboratory 7", maxScore: 30 },
                { name: "Laboratory 8", maxScore: 10 },
                { name: "Laboratory 9", maxScore: 20 },
                { name: "Total Scores (SRC)" },
                { name: "Average" },
            ],
        },
        {
            label: "Hands-On Exercises (30%)",
            sub: [
                { name: "Problem Set 4", maxScore: 30 },
                { name: "Problem Set 5", maxScore: 10 },
                { name: "Problem Set 6", maxScore: 30 },
                { name: "Total Scores (SRQ)" },
                { name: "Average" },
            ],
        },
        {
            label: "Lab Major Exam (40%)",
            sub: [
                { name: "Fin Lab Exam", maxScore: 100 },
                { name: "F" },
            ],
        },
        {
            label: "Laboratory",
            sub: [
                { name: "FGA" },
                { name: "Fin Lab Grade Point" },
            ],
        },
    ],

    finalColumns: [
        {
            label: "",
            sub: [
                { name: "Fin Grade Point" },
                { name: "Final Period Grade" },
            ],
        },
    ],
    students: [ // Added example students with initial scores (you can expand this array as needed)
        { 
            id: "2025000000", 
            name: "Brando, Dio", 
            rawScores: new Array(44).fill('')
        },
        { 
            id: "2025000001", 
            name: "Giovanna, Giorno", 
            rawScores: new Array(44).fill('')
        },
    ],
};