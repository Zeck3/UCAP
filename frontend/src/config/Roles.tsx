import UsersIcon from "../assets/users.svg?react";
import CoursesIcon from "../assets/courses.svg?react";
import HomeIcon from "../assets/house-solid.svg?react"
import BuildingIcon from "../assets/building-solid-full.svg?react"
import BookIcon from "../assets/book-solid-full.svg?react"
import type { ReactNode } from "react";
import { useInitialInfo } from "../context/useInitialInfo";

export const Roles = {
  Administrator: 1,
  Instructor: 2,
  DepartmentChair: 3,
  Dean: 4,
  ViceChancellorForAcademicAffairs: 5,
  VicePresidentForAcademicAffairs: 6,
};

export const roleInheritance: Record<number, number[]> = {
  [Roles.DepartmentChair]: [Roles.Instructor],
  [Roles.Dean]: [Roles.Instructor],
  [Roles.ViceChancellorForAcademicAffairs]: [Roles.Instructor],
  [Roles.VicePresidentForAcademicAffairs]: [Roles.Instructor],
};


export const roleRoutes: Record<number, string> = {
  1: "/admin/user_management",
  2: "/instructor",
  3: "/instructor",
  4: "/instructor",
  5: "/instructor",
  6: "/instructor",
};
export function useRoleSideNav(): Record<
  number,
  { label: string; path: string; icon: ReactNode }[]
> {
  const { initialInfo, primaryDepartment, primaryCollege, primaryCampus } =
    useInitialInfo();

  const deptId =
    initialInfo?.leadership?.level === "department"
      ? initialInfo.leadership.id
      : primaryDepartment?.department_id;

  const collegeId =
    initialInfo?.leadership?.level === "college"
      ? initialInfo.leadership.id
      : primaryCollege?.college_id;

  const campusId =
    initialInfo?.leadership?.level === "campus"
      ? initialInfo.leadership.id
      : primaryCampus?.campus_id;

  return {
    1: [ 
      {label: "Manage Users", path: "/admin/user_management", icon: <UsersIcon />},
      {label: "Manage Hierarchy", path: "/admin/hierarchy_management", icon: <BuildingIcon />},
    ],
    2: [ { label: "My Courses", path: "/instructor", icon: <HomeIcon /> } ],
    3: [
      { label: "My Courses", path: "/instructor", icon: <HomeIcon /> },
      { label: "Manage Loaded Courses", path: `/department/${deptId}`, icon: <CoursesIcon /> },
      { label: "Manage Courses", path: `/department/course_management/${deptId}`, icon: <BookIcon /> },
    ],
    4: [ 
      { label: "My Courses", path: "/instructor", icon: <HomeIcon /> },
      { label: "Oversee Courses", path: `/college/${collegeId ?? 0}`, icon: <CoursesIcon /> },
    ],
    5: [
      { label: "My Courses", path: "/instructor", icon: <HomeIcon /> },
      { label: "Oversee Courses", path: `/campus/${campusId ?? 0}`, icon: <CoursesIcon /> },
    ],
    6: [
      { label: "My Courses", path: "/instructor", icon: <HomeIcon /> },
      { label: "Oversee Courses", path: `/university`, icon: <CoursesIcon /> },
    ],
  };
}






