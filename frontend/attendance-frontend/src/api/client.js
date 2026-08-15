import axios from "axios";

const api = axios.create({
  baseURL: "",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(
    "attendance.accessToken"
  );

  if (token) {
    config.headers.Authorization =
      `Bearer ${token}`;
  }

  // Let the browser/Axios set the correct
  // multipart boundary for FormData.
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else {
    config.headers["Content-Type"] =
      "application/json";
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(
        "attendance.accessToken"
      );

      localStorage.removeItem(
        "attendance.refreshToken"
      );

      localStorage.removeItem(
        "attendance.user"
      );

      localStorage.removeItem(
        "attendance.employee"
      );

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;