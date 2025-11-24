

export type CurrentUser = {
  user_id: number;
  role_id: number;
  department_ids: number[];
  first_name: string | null;
  last_name: string | null;
  email: string | null;
};

export type PrimaryDepartment = {
  department_id: number;
  department_name: string;
} | null;

export type PrimaryCollege = {
  college_id: number;
  college_name: string;
} | null;

export type PrimaryCampus = {
  campus_id: number;
  campus_name: string;
} | null;

export type UserInitialInfo = {
  user_id: number;

  user_role_id: number | null;
  user_role_type: string | null;
  user_role_scope: "department" | "college" | "campus" | "university" | null;

  departments: { department_id: number; department_name: string }[];

  leadership:
    | { level: "department"; id: number; name: string }
    | { level: "college"; id: number; name: string }
    | { level: "campus"; id: number; name: string }
    | null;

  primary_department?: { department_id: number; department_name: string } | null;
  primary_college?: { college_id: number; college_name: string } | null;
  primary_campus?: { campus_id: number; campus_name: string } | null;

  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  suffix: string | null;
  email: string | null;
};

export function getLeadershipDepartmentId(info: UserInitialInfo | null): number | null {
  if (!info?.leadership) return null;
  return info.leadership.level === "department" ? info.leadership.id : null;
}