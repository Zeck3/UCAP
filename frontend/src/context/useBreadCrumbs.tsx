import { useLocation, useParams } from "react-router-dom";

export interface CrumbState {
  course_code?: string;
  year_and_section?: string;
}

export function useBreadcrumbs() {
  const location = useLocation();
  const params = useParams<{
    campus_id?: string;
    college_id?: string;
    department_id?: string;
    loaded_course_id?: string;
    section_id?: string;
  }>();

  const { course_code, year_and_section } =
    (location.state || {}) as CrumbState;

  const {
    campus_id,
    college_id,
    department_id,
    loaded_course_id,
    section_id,
  } = params;

  const pathname = location.pathname;

  const isInstructor = pathname.startsWith("/instructor");
  const isDepartmentChair = pathname.startsWith("/department/");
  const isDean = pathname.startsWith("/college/");
  const isCampus = pathname.startsWith("/campus/");
  const isVpaa = pathname.startsWith("/university/");

  let base: string;

  if (isDepartmentChair && department_id) {
    base = `/department/${department_id}`;
  } else if (isDean && college_id) {
    base = `/college/${college_id}`;
  } else if (isCampus && campus_id) {
    base = `/campus/${campus_id}`;
  } else if (isVpaa) {
    base = `/university`;
  } else if (isInstructor) {
    base = `/instructor`;
  } else {
    base = "/";
  }

  const crumbs: { label: string; path: string; state?: CrumbState }[] = [];

  if (loaded_course_id && course_code) {
    crumbs.push({
      label: course_code,
      path: `${base}/${loaded_course_id}`,
      state: { course_code },
    });
  }

  if (loaded_course_id && section_id && year_and_section) {
    crumbs.push({
      label: year_and_section,
      path: `${base}/${loaded_course_id}/${section_id}`,
      state: { course_code, year_and_section },
    });
  }

  return crumbs;
}
