// src/hooks/useDepartment.ts
import { useContext } from "react";
import { DepartmentContext } from "./DepartmentContext";

export function useDepartment() {
  return useContext(DepartmentContext);
}
