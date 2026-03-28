import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || ""
});

let refreshPromise = null;

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (!original || original._retry) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !original.url?.includes("/api/auth/login")) {
      original._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        return Promise.reject(error);
      }

      try {
        if (!refreshPromise) {
          const base = import.meta.env.VITE_API_URL || "";
          refreshPromise = axios
            .post(`${base}/api/auth/refresh`, { refreshToken })
            .finally(() => {
              refreshPromise = null;
            });
        }
        const { data } = await refreshPromise;
        const access = data.accessToken || data.token;
        if (access) {
          localStorage.setItem("accessToken", access);
          localStorage.setItem("token", access);
        }
        original.headers.Authorization = `Bearer ${access}`;
        return api(original);
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
