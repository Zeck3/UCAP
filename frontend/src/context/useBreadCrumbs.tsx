import { useParams } from "react-router-dom";

interface Crumb {
  label: string;
  path: string;
}

export function useBreadcrumbs() {
  const {
    department_name,
    loaded_course_id,
    course_code,
    section_id,
    year_and_section,
  } = useParams<{
    department_name?: string;
    loaded_course_id?: string;
    course_code?: string;
    section_id?: string;
    year_and_section?: string;
  }>();

  const crumbs: Crumb[] = [];

  if (loaded_course_id && course_code) {
    const base = department_name
      ? `/department/${department_name}`
      : "/instructor";
    crumbs.push({
      label: course_code,
      path: `${base}/${loaded_course_id}/${course_code}`,
    });
  }

  if (section_id && year_and_section) {
    const base = department_name
      ? `/department/${department_name}`
      : "/instructor";
    crumbs.push({
      label: year_and_section,
      path: `${base}/${loaded_course_id}/${course_code}/${section_id}/${year_and_section}`,
    });
  }

  return crumbs;
}
