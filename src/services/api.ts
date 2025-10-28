import axios from "axios";
import Cookies from "js-cookie";

// Obtén la URL base del .env
const baseURL =
  import.meta.env.PUBLIC_API_URL || "http://localhost:8080/api/v1";

const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para añadir el token a las solicitudes
api.interceptors.request.use(
  (config) => {
    // No añadir token a la ruta de login
    if (config.url?.endsWith("/auth/login")) {
      return config;
    }

    const token = Cookies.get("auth-token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
