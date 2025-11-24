export interface UserRole {
  user_role_id: number;
  user_role_type: string;
}

export interface Campus {
  campus_id: number;
  campus_name: string;
}

export interface College {
  college_id: number;
  college_name: string;
}

export interface Department {
  department_id: number;
  department_name: string;
}

export interface Program {
  program_id: number;
  program_name: string;


  department_id: number;
  department_name: string;
}

export interface YearLevel {
  year_level_id: number;
  year_level_type: string;
}

export interface Semester {
  semester_id: number;
  semester_type: string;
}

export interface Credit {
  credit_id: number;
  lecture_unit: number;
  laboratory_unit: number;
  credit_unit: number;
}

export interface Instructor {
  user_id: number;
  first_name: string | null;
  last_name: string | null;
  user_role: string;
  department_ids: number[];
}

export interface AcademicYear {
  academic_year_id: number;
  academic_year_start: number;
  academic_year_end: number;
}

export interface BloomsClassification {
  blooms_classification_id: number;
  blooms_classification_type: string;
}

export interface CourseOutcomes {
  course_outcome_id: number;
  course_outcome_code: string;
}

export interface Option {
  id: number;
  name: string;
}
