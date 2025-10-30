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
