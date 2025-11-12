import { createContext } from "react";
import type { UserDepartment } from "../types/userDepartmentTypes";

export const DepartmentContext = createContext<{
  department: UserDepartment | null;
  departmentLoading: boolean;
}>({
  department: null,
  departmentLoading: true,
});
