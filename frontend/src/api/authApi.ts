import axiosClient from "./axiosClient";
import type { CurrentUser } from "../types/userTypes";

export const fetchCurrentUser = async (): Promise<CurrentUser | null> => {
  const { data } = await axiosClient.get<CurrentUser | null>("me/");
  return data;
};

export const loginRequest = async (
  userId: number,
  password: string
): Promise<CurrentUser | null> => {
  await axiosClient.get("csrf/");
  await axiosClient.post("login/", { user_id: userId, password });
  return await fetchCurrentUser();
};

export const logoutRequest = async (): Promise<void> => {
  await axiosClient.post("logout/");
};

export async function changePasswordRequest(
  old_password: string,
  new_password: string
): Promise<{ detail: string }> {
  await axiosClient.get("csrf/");
  const res = await axiosClient.post<{ detail: string }>(
    "change-password/",
    { old_password, new_password }
  );
  return res.data;
}
