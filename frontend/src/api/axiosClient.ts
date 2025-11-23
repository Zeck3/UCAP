import axios from "axios";

const axiosClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
});

// axiosClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (axios.isAxiosError(error) && error.response?.status === 400) {
//       return Promise.reject(error);
//     }
//     return Promise.reject(error);
//   }
// );

// axiosClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     const axiosError = error as AxiosError;
//     if (
//       axiosError.response?.status === 403 &&
//       window.location.pathname !== "/login"
//     ) {
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   }
// );

export default axiosClient;
