import { useParams } from "react-router-dom";

interface Crumb {
  label: string;
  path: string;
}

export function useBreadcrumbs() {
  const { department_name, loaded_course_id, course_code, year_and_section } = useParams();
  const crumbs: Crumb[] = [];

  if (loaded_course_id && course_code) {
    const base = department_name ? `/department/${department_name}` : "/instructor";
    crumbs.push({
      label: course_code,
      path: `${base}/${loaded_course_id}/${course_code}`,
    });
  }

  if (year_and_section) {
    crumbs.push({
      label: year_and_section,
      path: `${department_name ? `/department/${department_name}` : "/instructor"}/${loaded_course_id}/${course_code}/${year_and_section}`,
    });
  }

  return crumbs;
}