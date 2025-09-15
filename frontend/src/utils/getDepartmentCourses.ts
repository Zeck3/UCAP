import { dummy } from "../data/dummy";

export interface DepartmentCourse {
  id: number;
  course_code: string;
  course_title: string;
  program_name: string;
  academic_year: string;
  semester_type: string;
  year_level: string;
  department_name: string;
}

export function getDepartmentCourses(currentUserId: number): DepartmentCourse[] {
  const {
    course_tbl,
    loaded_course_tbl,
    semester_tbl,
    academic_year_tbl,
    department_tbl,
    program_tbl,
    year_level_tbl,
    user_tbl,
  } = dummy[0];

  const user = user_tbl.find((u) => u.user_id === currentUserId);
  if (!user) return [];

  const userDepartmentId = user.department_id;
  if (!userDepartmentId) return [];

  return loaded_course_tbl
    .map((loadedCourse) => {
      const course = course_tbl.find((c) => c.course_code === loadedCourse.course_code);
      if (!course) return null;

      const program = program_tbl.find((p) => p.program_id === course.program_id);
      const department = department_tbl.find((d) => d.department_id === program?.department_id);

      if (department?.department_id !== userDepartmentId) return null;

      const semester = semester_tbl.find((s) => s.semester_id === course.semester_id);
      const academicYear = academic_year_tbl.find(
        (ay) => ay.academic_year_id === loadedCourse.academic_year_id
      );
      const yearLevel = year_level_tbl.find(
        (yl) => yl.year_level_id === course.year_level_id
      );

      return {
        id: loadedCourse.loaded_course_id,
        course_code: course.course_code,
        course_title: course.course_title,
        program_name: program?.program_name ?? "N/A",
        academic_year: academicYear
          ? `${academicYear.academic_year_start}-${academicYear.academic_year_end}`
          : "N/A",
        semester_type: semester?.semester_type ?? "N/A",
        year_level: yearLevel?.year_level ?? "N/A",
        department_name: department?.department_name ?? "N/A",
      } satisfies DepartmentCourse;
    })
    .filter((c): c is DepartmentCourse => c !== null);
}
