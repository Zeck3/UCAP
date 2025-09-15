import { dummy } from "../data/dummy";

export interface InstructorCourse {
  id: number;
  course_code: string;
  course_title: string;
  academic_year: string;
  semester_type: string;
  department_name: string;
}

export function getInstructorCourses(currentUserId: number): InstructorCourse[] {
  const {
    course_tbl,
    loaded_course_tbl,
    section_tbl,
    semester_tbl,
    academic_year_tbl,
    department_tbl,
    program_tbl,
  } = dummy[0];

  const assignedLoadedCourseIds = [
    ...new Set(
      section_tbl
        .filter((s) => s.instructor_assigned_id === currentUserId)
        .map((s) => s.loaded_course_id)
    ),
  ];

  return assignedLoadedCourseIds
    .map((loadedCourseId) => {
      const loadedCourse = loaded_course_tbl.find(
        (lc) => lc.loaded_course_id === loadedCourseId
      );
      if (!loadedCourse) return null;

      const course = course_tbl.find(
        (c) => c.course_code === loadedCourse.course_code
      );
      if (!course) return null;

      const semester = semester_tbl.find(
        (s) => s.semester_id === course.semester_id
      );
      const academicYear = academic_year_tbl.find(
        (ay) => ay.academic_year_id === loadedCourse.academic_year_id
      );
      const program = program_tbl.find(
        (p) => p.program_id === course.program_id
      );
      const department = department_tbl.find(
        (d) => d.department_id === program?.department_id
      );

      return {
        id: loadedCourse.loaded_course_id,
        course_code: course.course_code,
        course_title: course.course_title,
        academic_year: academicYear
          ? `${academicYear.academic_year_start}-${academicYear.academic_year_end}`
          : "N/A",
        semester_type: semester?.semester_type ?? "N/A",
        department_name: department?.department_name ?? "N/A",
      } satisfies InstructorCourse;
    })
    .filter((c): c is InstructorCourse => c !== null);
}
