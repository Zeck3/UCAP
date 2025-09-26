export type User = {
  user_id: number;
  role_id: number;
  department_id: number | null;
  first_name: string;
  last_name: string;
  email: string | null;
};