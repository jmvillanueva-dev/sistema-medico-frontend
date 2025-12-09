import axios from "axios";
import Cookies from "js-cookie";
import { useAuthStore } from "@/store/authStore";


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
    // No añadir token a las rutas públicas de autenticación
    const publicAuthRoutes = [
      "/auth/login",
      "/auth/forgot-password",
      "/auth/reset-password",
    ];
    
    const isPublicRoute = publicAuthRoutes.some((route) =>
      config.url?.endsWith(route)
    );

    if (isPublicRoute) {
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

// Interceptor de Respuesta (Response)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Verificamos si el error es 401 (No autorizado) y si no es un reintento
    // IMPORTANTE: Ignorar errores 401 en el login, ya que son credenciales inválidas, no token expirado
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login")
    ) {
      originalRequest._retry = true; // Marcamos para evitar bucles infinitos

      try {
        const refreshToken = Cookies.get("auth-refresh-token");

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const response = await axios.post(`${baseURL}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } =
          response.data.data;

        const cookieOptions = {
          secure: import.meta.env.PROD,
          sameSite: "strict",
        } as const;
        Cookies.set("auth-token", accessToken, cookieOptions);

        if (newRefreshToken) {
          Cookies.set("auth-refresh-token", newRefreshToken, cookieOptions);
        }

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Reintentar la petición original
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Session expired or refresh failed", refreshError);
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Funciones para el perfil del empleado
export const getEmployees = () => {
  return api.get("/empleados");
};

export const getEmployeeById = (employeeId: string) => {
  return api.get(`/empleados/${employeeId}`);
};

export const updateEmployee = (employeeId: string, data: object) => {
  return api.put(`/empleados/${employeeId}`, data);
};

export const updateEmployeeEmail = (
  employeeId: string,
  data: { nuevoEmail: string }
) => {
  return api.put(`/empleados/${employeeId}/email`, data);
};

export const deleteEmployee = (employeeId: string) => {
  return api.delete(`/empleados/${employeeId}`);
};

export const registerEmployee = (data: object) => {
  return api.post("/auth/register", data);
};

export const updateEmployeePassword = (employeeId: string, data: object) => {
  return api.put(`/empleados/${employeeId}/password`, data);
};

export const updateMyPassword = (data: object) => {
  return api.put("/empleados/me/password", data);
};

// Funciones para Roles
export const getRoles = () => {
  return api.get("/roles");
};

export const createRole = (data: object) => {
  return api.post("/roles", data);
};

export const updateRole = (roleId: string, data: object) => {
  return api.put(`/roles/${roleId}`, data);
};

export const deleteRole = (roleId: string) => {
  return api.delete(`/roles/${roleId}`);
};

export default api;
