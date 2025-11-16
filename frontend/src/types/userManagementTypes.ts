export type BackendFieldErrors = Record<string, string[]>;

export interface BackendErrorResponse {
  errors: BackendFieldErrors;
}

export interface UserMutationResult {
  data?: FacultyInfoDisplay;
  errors?: BackendFieldErrors;
}

export type CurrentUser = {
  user_id: number | null;
  role_id: number;
  department_id: number | null;
  first_name: string;
  last_name: string;
  email: string | null;
};

export interface FacultyInfoDisplay {
  id: number | string;
  name: string;
  email: string;
  role: string;
  department: string;
}

export interface FacultyInfo {
  user_id: number;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  suffix?: string;
  email: string;
  user_role_id?: number;
  user_role_type?: string;
  department_id?: number;
  department_name?: string;
}

export interface FacultyFormData {
  user_id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  suffix: string;
  email: string;
  user_role: string;
  department: string;
}

export interface FacultyPayload {
  user_id: number;
  first_name?: string | null;
  middle_name?: string | null;
  last_name: string;
  suffix?: string | null;
  email: string;
  user_role?: number | null;
  department?: number | null;
}