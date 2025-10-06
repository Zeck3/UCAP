export interface UserRole {
  user_role_id: number;
  user_role_type: string;
}

export interface Department {
  department_id: number;
  department_name: string;
}

export interface Program {
  program_id: number;
  program_name: string;
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
  first_name: string;
  last_name: string;
  role_id: number;
  department_id: number;
}

export interface AcademicYear {
  academic_year_id: number;
  academic_year_start: number;
  academic_year_end: number;
}