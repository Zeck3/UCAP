// src/context/DepartmentContext.tsx
import { useEffect, useState} from "react";
import { fetchUserDepartment } from "../api/userDepartmentApi";
import type { UserDepartment } from "../types/userDepartmentTypes";
import { useAuth } from "./useAuth";
import { DepartmentContext } from "./DepartmentContext";

export function DepartmentProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [department, setDepartment] = useState<UserDepartment | null>(null);
  const [departmentLoading, setDepartmentLoading] = useState(true);

  useEffect(() => {
    if (user?.department_id) {
      fetchUserDepartment(user.department_id)
        .then(setDepartment)
        .finally(() => setDepartmentLoading(false));
    } else setDepartmentLoading(false);
  }, [user?.department_id]);

  return (
    <DepartmentContext.Provider value={{ department, departmentLoading }}>
      {children}
    </DepartmentContext.Provider>
  );
}
