import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  withXSRFToken: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
});

axiosClient.interceptors.request.use((config) => {
  const method = (config.method ?? "get").toLowerCase();

  if (["post", "put", "patch", "delete"].includes(method)) {
    config.headers["Content-Type"] = "application/json";
  } else {
    delete config.headers["Content-Type"];
  }

  return config;
});

export default axiosClient;
