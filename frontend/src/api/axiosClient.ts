import axios, { AxiosError } from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

axiosClient.interceptors.request.use((config) => {
  const m = (config.method ?? "get").toLowerCase();
  if (["post", "put", "patch", "delete"].includes(m)) {
    config.headers["Content-Type"] = "application/json";
  } else {
    delete config.headers["Content-Type"];
  }
  return config;
});

axiosClient.defaults.withCredentials = true;
axiosClient.defaults.withXSRFToken = true;
axiosClient.defaults.xsrfCookieName = "csrftoken";
axiosClient.defaults.xsrfHeaderName = "X-CSRFToken";

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const axiosError = error as AxiosError;
    if (
      axiosError.response?.status === 403 &&
      window.location.pathname !== "/login"
    ) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
