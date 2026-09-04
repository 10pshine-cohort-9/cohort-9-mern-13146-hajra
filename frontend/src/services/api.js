// frontend/src/services/api.js
import axios from "axios";

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // istanbul ignore next -- import.meta.env.PROD is compiled to a non-assignable
  // expression by babel-plugin-transform-vite-meta-env (confirmed: assigning to
  // it throws a Babel parse error, "expected node to be of a type LVal"), so this
  // branch cannot be triggered from a Jest test. Verified safe by code inspection:
  // this guard only fires on a genuine production build missing VITE_API_URL.
  if (import.meta.env.PROD) {
    throw new Error("VITE_API_URL is missing in production environment!");
  }
  return "http://localhost:5000/api";
};

const getApiOrigin = () => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  try {
    const parsedUrl = new URL(apiUrl);
    return parsedUrl.origin;
  } catch {
    return "http://localhost:5000";
  }
};

export const getProfilePicUrl = (user) => {
  if (!user?.profile_picture) return null;
  if (user.profile_picture.startsWith("http")) return user.profile_picture;
  return `${getApiOrigin()}${user.profile_picture}`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
    localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;