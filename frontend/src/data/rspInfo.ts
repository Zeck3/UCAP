// Interfaces for defining the structure of class information, classwork, course outcomes, program outcomes, scores, and students.
export interface ClassInfo {
    cacode: string;
    program: string;
    course: string;
    aySemester: string;
    faculty: string;
}

export interface Classwork {
    name: string;
    blooms: string[]; // Changed to array for better handling of multiple levels
    maxScore: number;
}

export interface CO {
    name: string;
    classwork: Classwork[];
}

export interface PO {
    name: string;
    cos: CO[];
}

export interface Score {
    raw: number;
}

export interface Student {
    id: string;
    name: string;
    scores: { [coName: string]: Score[] };
}

// Constant holding the class information details.
export const classInfo: ClassInfo = {
    cacode: "Cagayan de Oro Campus / College of Engineering and Architecture / Department of Electronics Engineering",
    program: "Bachelor in Science in Electronics Engineering",
    course: "ECE 411 - Communication Systems Analysis and Design",
    aySemester: "2025-2026 / 1st Semester",
    faculty: "Jotaro Kujo",
};

// Array of program outcomes, each linked to course outcomes and their classwork.
export const pos: PO[] = [
    {
        name: "PO-a, PO-b, PO-c, PO-e, PO-g, & PO-j",
        cos: [
            {
                name: "CO1 (Lecture)",
                classwork: [
                    { name: "Assign 1", blooms: ["Remember", "Understand"], maxScore: 15 },
                    { name: "Assign 2", blooms: ["Apply"], maxScore: 15 },
                    { name: "Assign 3", blooms: ["Remember", "Understand"], maxScore: 10 },
                    { name: "Quiz 1", blooms: ["Remember", "Understand"], maxScore: 20 },
                    { name: "Quiz 2", blooms: ["Apply"], maxScore: 30 },
                    { name: "Quiz 3", blooms: ["Apply"], maxScore: 50 },
                    { name: "Quiz 4", blooms: ["Apply", "Analyze"], maxScore: 60 },
                    { name: "Seat Work 1", blooms: ["Remember", "Understand"], maxScore: 20 },
                    { name: "Seat Work 2", blooms: ["Apply"], maxScore: 15 },
                    { name: "Prelim Exam", blooms: ["Apply", "Analyze"], maxScore: 25 },
                    { name: "Mid Written Exam", blooms: ["Apply", "Analyze"], maxScore: 100 },
                    { name: "PIT 1", blooms: ["Evaluate", "Create"], maxScore: 50 },
                    { name: "PIT 2", blooms: ["Evaluate", "Create"], maxScore: 50 },
                ],
            },
            {
                name: "CO1 (Laboratory)",
                classwork: [
                    { name: "Laboratory 1", blooms: ["Understand", "Apply"], maxScore: 50 },
                    { name: "Laboratory 2", blooms: ["Analyze"], maxScore: 50 },
                    { name: "Laboratory 3", blooms: ["Apply", "Analyze"], maxScore: 10 },
                    { name: "Laboratory 4", blooms: ["Analyze", "Evaluate"], maxScore: 10 },
                    { name: "Laboratory 5", blooms: ["Evaluate"], maxScore: 30 },
                    { name: "Problem Set 1", blooms: ["Analyze", "Evaluate"], maxScore: 30 },
                    { name: "Problem Set 2", blooms: ["Analyze"], maxScore: 40 },
                    { name: "Problem Set 3", blooms: ["Apply"], maxScore: 30 },
                    { name: "Mid Lab Exam", blooms: ["Create"], maxScore: 100 },
                ],
            },
        ],
    },
    {
        name: "PO-a, PO-b, PO-c, PO-e, PO-g, & PO-j",
        cos: [
            {
                name: "CO2 (Lecture)",
                classwork: [
                    { name: "Assign 4", blooms: ["Apply", "Analyze"], maxScore: 10 },
                    { name: "Assign 5", blooms: ["Remember", "Understand"], maxScore: 10 },
                    { name: "Quiz 5", blooms: ["Evaluate"], maxScore: 20 },
                    { name: "Quiz 6", blooms: ["Apply", "Analyze"], maxScore: 30 },
                    { name: "Quiz 7", blooms: ["Understand", "Apply"], maxScore: 10 },
                    { name: "Quiz 8", blooms: ["Analyze", "Evaluate"], maxScore: 30 },
                    { name: "Seat Work 3", blooms: ["Apply"], maxScore: 20 },
                    { name: "Seat Work 4", blooms: ["Remember", "Understand"], maxScore: 10 },
                    { name: "Seat Work 5", blooms: ["Remember", "Understand"], maxScore: 10 },
                    { name: "Final Exam", blooms: ["Evaluate", "Create"], maxScore: 50 },
                    { name: "PIT 1", blooms: ["Evaluate", "Create"], maxScore: 50 },
                    { name: "PIT 2", blooms: ["Create"], maxScore: 50 },
                ],
            },
            {
                name: "CO2 (Laboratory)",
                classwork: [
                    { name: "Laboratory 6", blooms: ["Apply"], maxScore: 20 },
                    { name: "Laboratory 7", blooms: ["Analyze", "Evaluate"], maxScore: 30 },
                    { name: "Laboratory 8", blooms: ["Analyze"], maxScore: 10 },
                    { name: "Laboratory 9", blooms: ["Remember", "Understand"], maxScore: 20 },
                    { name: "Problem Set 4", blooms: ["Apply", "Analyze"], maxScore: 30 },
                    { name: "Problem Set 5", blooms: ["Evaluate", "Create"], maxScore: 10 },
                    { name: "Problem Set 6", blooms: ["Evaluate"], maxScore: 30 },
                    { name: "Report 1", blooms: ["Understand", "Apply"], maxScore: 20 },
                    { name: "Mid Lab Exam", blooms: ["Create"], maxScore: 100 },
                ],
            },
        ],
    },
    {
        name: "PO-a, PO-b, PO-c, PO-e, PO-g, & PO-j",
        cos: [
            {
                name: "CO1 & CO2",
                classwork: [
                    { name: "Fin Written Exam", blooms: ["Apply", "Analyze"], maxScore: 100 },
                ],
            },
        ],
    },
];

// Array of student records, including IDs, names, and scores mapped by course outcomes.
export const students: Student[] = [
    {
        id: "2025000000",
        name: "Brando, Dio",
        scores: {
            "CO1 (Lecture)": [
                { raw: 15 }, { raw: 10 }, { raw: 8 }, { raw: 18 }, { raw: 25 },
                { raw: 35 }, { raw: 40 }, { raw: 15 }, { raw: 8 }, { raw: 15 },
                { raw: 48 }, { raw: 40 }, { raw: 40 },
            ],
            "CO1 (Laboratory)": [
                { raw: 0 }, { raw: 40 }, { raw: 10 }, { raw: 9 }, { raw: 14 },
                { raw: 30 }, { raw: 28 }, { raw: 21 }, { raw: 90 },
            ],
            "CO2 (Lecture)": [
                { raw: 10 }, { raw: 10 }, { raw: 20 }, { raw: 15 }, { raw: 10 },
                { raw: 15 }, { raw: 20 }, { raw: 9 }, { raw: 8 }, { raw: 45 },
                { raw: 40 }, { raw: 40 },
            ],
            "CO2 (Laboratory)": [
                { raw: 20 }, { raw: 23 }, { raw: 9 }, { raw: 8 }, { raw: 27 },
                { raw: 9 }, { raw: 25 }, { raw: 19 }, { raw: 80 },
            ],
            "CO1 & CO2": [{ raw: 40 }],
        },
    },
    {
        id: "2025000001",
        name: "Giovanna, Giorno",
        scores: {
            "CO1 (Lecture)": [
                { raw: 15 }, { raw: 8 }, { raw: 10 }, { raw: 18 }, { raw: 25 },
                { raw: 43 }, { raw: 50 }, { raw: 15 }, { raw: 4 }, { raw: 10 },
                { raw: 42 }, { raw: 40 }, { raw: 40 },
            ],
            "CO1 (Laboratory)": [
                { raw: 0 }, { raw: 40 }, { raw: 8 }, { raw: 10 }, { raw: 15 },
                { raw: 30 }, { raw: 28 }, { raw: 21 }, { raw: 90 },
            ],
            "CO2 (Lecture)": [
                { raw: 10 }, { raw: 10 }, { raw: 20 }, { raw: 20 }, { raw: 10 },
                { raw: 20 }, { raw: 20 }, { raw: 9 }, { raw: 6 }, { raw: 44 },
                { raw: 40 }, { raw: 40 },
            ],
            "CO2 (Laboratory)": [
                { raw: 19 }, { raw: 22 }, { raw: 9 }, { raw: 8 }, { raw: 28 },
                { raw: 5 }, { raw: 10 }, { raw: 17 }, { raw: 98 },
            ],
            "CO1 & CO2": [{ raw: 47 }],
        },
    },
    {
        id: "2025000002",
        name: "Higashikata, Josuke",
        scores: {
            "CO1 (Lecture)": [
                { raw: 15 }, { raw: 8 }, { raw: 10 }, { raw: 18 }, { raw: 25 },
                { raw: 43 }, { raw: 55 }, { raw: 15 }, { raw: 5 }, { raw: 15 },
                { raw: 20 }, { raw: 43 }, { raw: 42 },
            ],
            "CO1 (Laboratory)": [
                { raw: 0 }, { raw: 40 }, { raw: 9 }, { raw: 9 }, { raw: 21 },
                { raw: 30 }, { raw: 28 }, { raw: 26 }, { raw: 90 },
            ],
            "CO2 (Lecture)": [
                { raw: 10 }, { raw: 0 }, { raw: 20 }, { raw: 15 }, { raw: 3 },
                { raw: 20 }, { raw: 20 }, { raw: 6 }, { raw: 9 }, { raw: 44 },
                { raw: 42 }, { raw: 45 },
            ],
            "CO2 (Laboratory)": [
                { raw: 17 }, { raw: 11 }, { raw: 8 }, { raw: 8 }, { raw: 20 },
                { raw: 10 }, { raw: 10 }, { raw: 18 }, { raw: 87 },
            ],
            "CO1 & CO2": [{ raw: 29 }],
        },
    },
    {
        id: "2025000003",
        name: "Hirose, Koichi",
        scores: {
            "CO1 (Lecture)": [
                { raw: 15 }, { raw: 9 }, { raw: 10 }, { raw: 16 }, { raw: 25 },
                { raw: 35 }, { raw: 35 }, { raw: 20 }, { raw: 6 }, { raw: 15 },
                { raw: 46 }, { raw: 40 }, { raw: 40 },
            ],
            "CO1 (Laboratory)": [
                { raw: 0 }, { raw: 40 }, { raw: 7 }, { raw: 10 }, { raw: 9 },
                { raw: 30 }, { raw: 28 }, { raw: 21 }, { raw: 92 },
            ],
            "CO2 (Lecture)": [
                { raw: 10 }, { raw: 0 }, { raw: 20 }, { raw: 20 }, { raw: 10 },
                { raw: 20 }, { raw: 20 }, { raw: 9 }, { raw: 8 }, { raw: 45 },
                { raw: 40 }, { raw: 40 },
            ],
            "CO2 (Laboratory)": [
                { raw: 18 }, { raw: 18 }, { raw: 8 }, { raw: 9 }, { raw: 14 },
                { raw: 9 }, { raw: 30 }, { raw: 12 }, { raw: 87 },
            ],
            "CO1 & CO2": [{ raw: 64 }],
        },
    },
    {
        id: "2025000004",
        name: "Horse, Hol",
        scores: {
            "CO1 (Lecture)": [
                { raw: 15 }, { raw: 10 }, { raw: 8 }, { raw: 18 }, { raw: 25 },
                { raw: 43 }, { raw: 60 }, { raw: 20 }, { raw: 14 }, { raw: 18 },
                { raw: 58 }, { raw: 40 }, { raw: 25 },
            ],
            "CO1 (Laboratory)": [
                { raw: 40 }, { raw: 40 }, { raw: 5 }, { raw: 10 }, { raw: 25 },
                { raw: 24 }, { raw: 0 }, { raw: 0 }, { raw: 90 },
            ],
            "CO2 (Lecture)": [
                { raw: 10 }, { raw: 10 }, { raw: 20 }, { raw: 15 }, { raw: 10 },
                { raw: 25 }, { raw: 20 }, { raw: 6 }, { raw: 8 }, { raw: 49 },
                { raw: 35 }, { raw: 40 },
            ],
            "CO2 (Laboratory)": [
                { raw: 12 }, { raw: 12 }, { raw: 9 }, { raw: 8 }, { raw: 16 },
                { raw: 7 }, { raw: 25 }, { raw: 12 }, { raw: 27 },
            ],
            "CO1 & CO2": [{ raw: 61 }],
        },
    },
];