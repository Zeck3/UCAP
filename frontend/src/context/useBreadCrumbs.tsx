import { useLocation, useParams } from "react-router-dom";

export interface CrumbState {
  course_code?: string;
  year_and_section?: string;
}

export function useBreadcrumbs() {
  const params = useParams();
  const location = useLocation();

  const { course_code, year_and_section } =
    (location.state || {}) as CrumbState;

  const {
    department_id,
    loaded_course_id,
    section_id,
  } = params;

  const pathname = location.pathname;

  const isCampus = pathname.startsWith("/campus/");
  const isDean = pathname.startsWith("/college/");
  const isInstructor = pathname.startsWith("/instructor/");
  const isDepartmentChair = pathname.startsWith("/department/");

  let base = "/instructor";

  if (isDepartmentChair) base = `/department/${department_id}`;
  else if (isDean) base = `/college/${department_id}`;
  else if (isCampus) base = `/campus/${department_id}`;

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

  if (isInstructor && pathname.endsWith("/assessment")) {
    crumbs.push({
      label: "Assessment",
      path: pathname,
      state: { course_code, year_and_section },
    });
  }

  return crumbs;
}
