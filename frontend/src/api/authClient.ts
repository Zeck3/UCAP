import axiosClient from "./axiosClient";
import type { User } from "../types/types";

export const fetchCurrentUser = async (): Promise<User> => {
  const { data } = await axiosClient.get<User>("me/");
  return data;
};

export const loginRequest = async (userId: number, password: string): Promise<User> => {
  await axiosClient.get("csrf/");
  await axiosClient.post("login/", {user_id: userId, password });
  return await fetchCurrentUser();
};

export const logoutRequest = async (): Promise<void> => {
  await axiosClient.post("logout/");
};
