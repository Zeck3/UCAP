import { dummy } from "../data/dummy";

export interface UserInfo {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
}

export function getAllUsers(): UserInfo[] {
  const db = dummy[0];
  const userTbl = db.user_tbl;
  const deptTbl = db.department_tbl;
  const roleTbl = db.role_tbl;

  return userTbl
    .filter((u) => u.role_id !== 1)
    .map((u) => {
      const department = deptTbl.find(
        (d) => d.department_id === u.department_id
      );
      const role = roleTbl.find((r) => r.role_id === u.role_id);

      return {
        id: u.user_id,
        name: [u.first_name, u.middle_name, u.last_name, u.sufflix]
          .filter(Boolean)
          .join(" "),
        email: u.email ?? "—",
        role: role?.role ?? "Unknown",
        department: department?.department_name ?? "—",
      };
    });
}
