export interface CourseBackendErrors {
  course_code?: string[];
  [key: string]: string[] | undefined;
}

export interface CourseInfoDisplay {
  id: string;
  course_code: string;
  course_title: string;
  program_name: string;
  semester_type: string;
  year_level_type: string;
}

export interface CourseInfo {
  id: string;
  course_code: string;
  course_title: string;
  program_id: number;
  program_name: string;
  year_level_id: number;
  year_level_type: string;
  semester_id: number;
  semester_type: string;
  lecture_unit: number;
  laboratory_unit: number;
}

export interface CourseFormData {
  course_code: string;
  course_title: string;
  program: string;
  year_level: string;
  semester: string;
  lecture_unit: string;
  laboratory_unit: string;
}

export interface CoursePayload {
  course_code: string;
  course_title: string;
  program: number;
  year_level: number;
  semester: number;
  lecture_unit: number;
  laboratory_unit: number;
}