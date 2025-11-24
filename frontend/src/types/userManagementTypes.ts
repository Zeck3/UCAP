export type BackendFieldErrors = Record<string, string[]>;

export interface BackendErrorResponse {
  errors: BackendFieldErrors;
}

export interface UserMutationResult {
  data?: FacultyInfoDisplay;
  errors?: BackendFieldErrors;
}

export interface FacultyInfoDisplay {
  id: number | string;
  name: string;
  email: string;
  role: string;
  departments: string;
  designation: string;
}

export interface FacultyInfo {
  user_id: number;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  suffix?: string;
  email: string;

  user_role?: number | null;
  user_role_id?: number;
  user_role_type?: string;
  user_role_scope?: string;

  department_ids?: number[];
  department_names?: string[];

  chair_department?: number | null;
  dean_college?: number | null;
  vcaa_campus?: number | null;

  chair_department_name?: string | null;
  dean_college_name?: string | null;
  vcaa_campus_name?: string | null;
}


export interface FacultyFormData {
  user_id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  suffix: string;
  email: string;
  user_role: string;
  departments: string[];
  chair_department?: string;
  dean_college?: string;
  vcaa_campus?: string;
}

export interface FacultyPayload {
  user_id: number;
  first_name?: string | null;
  middle_name?: string | null;
  last_name: string;
  suffix?: string | null;
  email: string;
  user_role: number | null;
  departments: number[];
  chair_department?: number | null;
  dean_college?: number | null;
  vcaa_campus?: number | null;
}