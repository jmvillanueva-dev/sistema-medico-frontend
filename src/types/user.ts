export interface User {
  email: string;
  roles: string[];
  employeeId: string;
  name: string;
  lastName: string;
}

/**
 * Respuesta del endpoint de login.
 * Extiende User con tokens y flag de cambio de contraseña obligatorio.
 */
export interface LoginResponse extends User {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  requiereCambioPassword: boolean;
}

/**
 * Request para cambio obligatorio de contraseña.
 */
export interface ForcePasswordChangeRequest {
  email: string;
  contrasenaActual: string;
  nuevaContrasena: string;
}

/**
 * Respuesta del cambio obligatorio de contraseña.
 */
export interface ForcePasswordChangeResponse {
  mensaje: string;
  success: boolean;
  email: string;
}
