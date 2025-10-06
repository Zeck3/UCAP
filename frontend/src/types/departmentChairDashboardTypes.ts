// ====================================================
// Department Chair Course Dashboard
// ====================================================
export interface DepartmentDetail {
    department_name: string
    college_name: string
    campus_name: string
};

export interface DepartmentLoadedCoursesDisplay {
    id: number
    course_code: string
    course_title: string
    program_name: string
    year_level: string
    semester_type: string
    academic_year: string
    academicYearAndSem: string
    department_name: string
    lecture_unit?: number 
    lab_unit?: number 
    credit_unit?: number
}

export interface DepartmentLoadedCourses {
    loaded_course_id: number
    course_code: string
    course_title: string
    program_name: string
    year_level: string
    semester_type: string
    academic_year_start: string
    academic_year_end: string
    department_name: string
};

export interface DepartmentCourses {
    course_code: string
    course_title: string
    lecture_unit: number 
    lab_unit: number 
    credit_unit: number 
}

export interface DepartmentCoursesDisplay {
    id: string
    course_title: string
    lecture_unit: number 
    lab_unit: number 
    credit_unit: number
}

export interface LoadDepartmentCourse {
    course: string
    academic_year: number
}

export interface LoadDepartmentCourseMessage {
    message: string
}

// ====================================================
// Department Chair Section Dashboard
// ====================================================
export interface DepartmentLoadedCourseDetails {
    course_title: string,
    department_name: string
    college_name: string
    campus_name: string
    semester_type: string
    year_level: string
    academic_year_start: string
    academic_year_end: string
}

export interface DepartmentLoadedCourseSections {
    section_id: number
    year_and_section: string
    first_name: string
    last_name: string
}

export interface DepartmentLoadedCourseDetailsDisplay {
    course_title: string,
    department_name: string
    college_name: string
    campus_name: string
    semester_type: string
    year_level: string
    academic_year: string
}

export interface DepartmentLoadedCourseSectionsDisplay {
    id: number
    year_and_section: string
    instructor_assigned: string
};


// ====================================================
// Department Path Types
// ====================================================

export type DepartmentPathTypes = {
    department_id: number,
    department_name: string
};