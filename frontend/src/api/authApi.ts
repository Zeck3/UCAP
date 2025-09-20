import axiosClient from "./axiosClient";

export const authApi = {
  login: (user_id: string, password: string) =>
    axiosClient.post("login/", { user_id, password }),

  refresh: (refresh: string) =>
    axiosClient.post("token/refresh/", { refresh }),

};
