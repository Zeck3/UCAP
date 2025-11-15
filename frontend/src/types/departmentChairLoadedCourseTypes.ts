export interface DepartmentCourses {
  course_code: string
  course_title: string
  year_level_type: string
  semester_type: string
  lecture_unit: number
  laboratory_unit: number
  credit_unit: number
}

export interface LoadDepartmentCourse {
  course: string
  academic_year: number
}