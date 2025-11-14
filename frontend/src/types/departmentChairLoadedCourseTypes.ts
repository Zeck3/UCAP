export interface DepartmentCourses {
  course_code: string
  course_title: string
  year_level_type: string
  semester_type: string
  lecture_unit: number
  laboratory_unit: number
  credit_unit: number
}

export interface DepartmentLoadedCourses {
  loaded_course_id: number
  course_code: string
  course_title: string
  program_name: string
  academic_year_start: number
  academic_year_end: number
  year_level_type: string
  semester_type: string
}

export interface DepartmentLoadedCoursesDisplay {
  id: number
  course_code: string
  course_title: string
  program_name: string
  year_level: string
  semester_type: string
  academic_year_and_semester: string
  department_name?: string
  lecture_unit?: number
  lab_unit?: number
  credit_unit?: number
}

export interface LoadDepartmentCourse {
  course: string
  academic_year: number
}