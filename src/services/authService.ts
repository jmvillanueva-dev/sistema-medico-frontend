import api from "./api";

/**
 * Servicio de autenticación para manejar operaciones relacionadas
 * con recuperación de contraseña y otras funcionalidades de auth.
 */

/**
 * Solicita el restablecimiento de contraseña enviando un email
 * al usuario con un token de recuperación.
 * 
 * @param email - Email del usuario
 * @returns Promise con la respuesta de la API
 */
export const forgotPassword = async (email: string) => {
  return api.post("/auth/forgot-password", { email });
};

/**
 * Restablece la contraseña del usuario usando un token de recuperación.
 * 
 * @param token - Token de recuperación recibido por email
 * @param nuevaPassword - Nueva contraseña del usuario
 * @returns Promise con la respuesta de la API
 */
export const resetPassword = async (token: string, nuevaPassword: string) => {
  return api.post("/auth/reset-password", { token, nuevaPassword });
};
