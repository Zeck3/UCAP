import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
  headers: { "Content-Type": "application/json" },
});

function getCookie(name = "csrftoken"): string | null {
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                return decodeURIComponent(cookie.substring(name.length + 1));
            }
        }
    }
    return null;
}

axiosClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const method = config.method ? config.method.toUpperCase() : '';
    const isSafeMethod = ['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(method);
    if (!isSafeMethod) {
        const csrftoken = getCookie("csrftoken");
      
        if (csrftoken) {
            config.headers['X-CSRFToken'] = csrftoken;
        }
    }
    return config;
}, error => {
    return Promise.reject(error);
});

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
