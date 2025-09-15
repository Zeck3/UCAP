import UsersIcon from "../assets/users.svg?react";
import CoursesIcon from "../assets/courses.svg?react";
import HomeIcon from "../assets/house-solid.svg?react"
import type { ReactNode } from "react";
import { useAuth } from "../context/useAuth";
import dummy from "../data/dummy";

export const Roles = {
  Administrator: 1,
  Instructor: 2,
  DepartmentChair: 3,
  Dean: 4,
  ViceChancellorOfAcademicAffairs: 5,
  VicePresidentOfAcademicAffairs: 6,
};

export const roleInheritance: Record<number, number[]> = {
  [Roles.DepartmentChair]: [Roles.Instructor],
  [Roles.Dean]: [Roles.Instructor],
  [Roles.ViceChancellorOfAcademicAffairs]: [Roles.Instructor],
  [Roles.VicePresidentOfAcademicAffairs]: [Roles.Instructor],
};


export const roleRoutes: Record<number, string> = {
  1: "/admin/user_management",
  2: "/instructor",
  3: "/instructor",
  4: "/instructor",
  5: "/instructor",
  6: "/instructor",
};

export function useRoleSideNav(): Record<number, { label: string; path: string; icon: ReactNode }[]> {
  const { user } = useAuth();

  const departmentPath = user?.department_id
    ? dummy[0].department_tbl
        .find((d) => d.department_id === user.department_id)
        ?.department_name.replace(/\s+/g, "") ?? "department"
    : "department";

  return {
    1: [
      { label: "Manage Users", path: "/admin/user_management", icon: <UsersIcon /> },
      { label: "Manage Courses", path: "/admin/course_management", icon: <CoursesIcon /> },
    ],
    2: [
      { label: "My Courses", path: "/instructor", icon: <HomeIcon /> },
    ],
    3: [
      { label: "My Courses", path: "/instructor", icon: <HomeIcon /> },
      { label: "Manage Courses", path: `/department/${departmentPath}`, icon: <CoursesIcon /> },
    ],
    4: [
      { label: "My Courses", path: "/instructor", icon: <HomeIcon /> },
    ],
    5: [
      { label: "My Courses", path: "/instructor", icon: <HomeIcon /> },
    ],
    6: [
      { label: "My Courses", path: "/instructor", icon: <HomeIcon /> },
    ],
  };
}