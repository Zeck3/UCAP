
export interface ClassInfo {
  cacode: string;
  program: string;
  course: string;
  aySemester: string;
  faculty: string;
}

export interface Classwork {
  name: string;
  blooms: string[];
  maxScore: number;
}

export interface CourseOutcome {
  name: string;
  classwork: Classwork[];
}

export interface ProgramOutcome {
  name: string;
  cos: CourseOutcome[];
}

export interface Student {
  id: string;
  name: string;
  remarks?: string | null;
  scores: Record<string, { raw: number | null }[]>;
}

export interface AssessmentPageData {
  classInfo: ClassInfo;
  pos: ProgramOutcome[];
  students: Student[];
}