// utils/getUserDepartmentInfo.ts
import { dummy } from "../data/dummy";
import type { User } from "../types/dropdownTypes";

export function getUserDepartmentInfo(user: User | null) {
  if (!user?.department_id) return null;

  const department = dummy[0].department_tbl.find(
    (d) => d.department_id === user.department_id
  );
  if (!department) return null;

  const college = dummy[0].college_tbl.find(
    (c) => c.college_id === department.college_id
  );
  const campus = dummy[0].campus_tbl.find(
    (camp) => camp.campus_id === department.campus_id
  );

  return {
    department_name: department.department_name,
    college_name: college?.college_name ?? "N/A",
    campus_name: campus?.campus_name ?? "N/A",
  };
}
