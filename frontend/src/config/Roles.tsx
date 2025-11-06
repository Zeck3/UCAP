import UsersIcon from "../assets/users.svg?react";
import CoursesIcon from "../assets/courses.svg?react";
import HomeIcon from "../assets/house-solid.svg?react"
import type { ReactNode } from "react";
import { useAuth } from "../context/useAuth";
import { useEffect, useState } from "react";
import { fetchUserDepartment } from "../api/userDepartmentApi";
import type { UserDepartment } from "../types/departmentChairDashboardTypes";

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
  const [departmentInfo, setDepartmentInfo] = useState<UserDepartment | null>(null);

  useEffect(() => {
    if (user?.department_id) {
      fetchUserDepartment(user.department_id)
        .then(setDepartmentInfo)
        .catch((err) => console.error("Failed to fetch department:", err));
    }
  }, [user?.department_id]);

  const departmentId = departmentInfo?.department_id ?? "";
  const departmentName = departmentInfo?.department_name?.replace(/\s+/g, "") ?? "department";

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
      { label: "Manage Courses", path: `/department/${departmentId}/${departmentName}`, icon: <CoursesIcon /> },
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