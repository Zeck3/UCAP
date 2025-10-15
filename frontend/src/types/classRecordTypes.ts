export interface Assessment {
  assessment_id: number;
  course_component: number;
  assessment_title: string | null;
  assessment_highest_score: number | null;
  blooms_classification?: number[];
  course_outcome?: number[];
}

export interface AssessmentInfo {
  id: number;
  blooms: number[];
  outcomes: number[];
}

export interface CourseComponent {
  course_component_id: number;
  course_component_type: string;
  course_component_percentage: number;
  assessments: Assessment[];
}

export interface CourseUnit {
  course_unit_id: number;
  course_unit_type: string;
  course_unit_percentage: number;
  course_components: CourseComponent[];
}

export interface CourseTerm {
  course_term_id: number;
  course_term_type: string;
  section_id: number;
  course_units: CourseUnit[];
}

export interface StudentScore {
  assessment_id: number;
  value: number | null;
}

export interface Student {
  student_id: number;
  id_number: number | null;
  student_name: string | null;
  scores: StudentScore[];
  remarks: string | null;
  section_id: number;
}

export interface ClassRecordInfo {
  department: string;
  subject: string;
  yearSection: string;
}

export interface ClassRecord {
  info: ClassRecordInfo;
  course_terms: CourseTerm[];
  students: Student[];
}
