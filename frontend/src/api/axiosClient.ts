import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

axiosClient.defaults.withXSRFToken = true;
axiosClient.defaults.withCredentials = true;
axiosClient.defaults.xsrfCookieName = "csrftoken";
axiosClient.defaults.xsrfHeaderName = "X-CSRFToken";

export default axiosClient;
