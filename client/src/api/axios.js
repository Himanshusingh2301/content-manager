import axios from "axios";

const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  const password = localStorage.getItem("accessPassword");
  const username = localStorage.getItem("username");
  if (password) config.headers["x-access-password"] = password;
  if (username) config.headers["x-username"] = username;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("accessPassword");
      localStorage.removeItem("username");
      localStorage.removeItem("displayName");
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

export default api;
