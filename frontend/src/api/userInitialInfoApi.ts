import axiosClient from "./axiosClient";
import type { UserInitialInfo } from "../types/userTypes";

export const fetchUserInitialInfo = async (): Promise<UserInitialInfo> => {
  const { data } = await axiosClient.get<UserInitialInfo>("user/initial-info/");
  return data;
};