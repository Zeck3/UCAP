import axiosClient from "./axiosClient";
import type { CurrentUser } from "../types/userManagementTypes";

export const fetchCurrentUser = async (): Promise<CurrentUser> => {
  const { data } = await axiosClient.get<CurrentUser>("me/");
  return data;
};

export const loginRequest = async (
  userId: number,
  password: string
): Promise<CurrentUser> => {
  await axiosClient.get("csrf/");
  await axiosClient.post("login/", { user_id: userId, password });
  return await fetchCurrentUser();
};

export const logoutRequest = async (): Promise<void> => {
  await axiosClient.post("logout/");
};
