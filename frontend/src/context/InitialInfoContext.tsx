import { createContext } from "react";
import type { UserInitialInfo } from "../types/userTypes";

export const InitialInfoContext = createContext<{
  initialInfo: UserInitialInfo | null;
  initialInfoLoading: boolean;
  primaryDepartment: UserInitialInfo["primary_department"] | null;
  primaryCollege: UserInitialInfo["primary_college"] | null;
  primaryCampus: UserInitialInfo["primary_campus"] | null;
}>({
  initialInfo: null,
  initialInfoLoading: true,
  primaryDepartment: null,
  primaryCollege: null,
  primaryCampus: null,
});