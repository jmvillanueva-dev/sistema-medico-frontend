// src/utils/lockout.ts

// --- Constantes ---
export const MAX_LOGIN_ATTEMPTS = 3;
export const LOCKOUT_DURATION_MS = 10 * 60 * 1000; // 10 minutos
export const ATTEMPTS_KEY = "loginAttempts";
export const LOCKOUT_KEY = "lockoutUntil";

// --- Tipos ---
export interface LockoutState {
  isLocked: boolean;
  remainingTime: number;
}

/**
 * **(SOLO LECTURA)**: Verifica si el usuario está bloqueado por intentos fallidos.
 * NO MODIFICA localStorage.
 */
export const getLockoutStatus = (): LockoutState => {
  // Usamos typeof window !== 'undefined' para manejar el entorno de SSR/Node
  if (typeof window === "undefined") {
    return { isLocked: false, remainingTime: 0 };
  }

  const lockoutUntil = parseInt(localStorage.getItem(LOCKOUT_KEY) || "0", 10);
  const now = Date.now();

  if (lockoutUntil > now) {
    const remainingTime = Math.ceil((lockoutUntil - now) / 1000 / 60);
    return { isLocked: true, remainingTime };
  }

  return { isLocked: false, remainingTime: 0 };
};

/**
 * **(SOLO MUTACIÓN)**: Limpia el bloqueo si ha expirado.
 */
export const clearLockout = () => {
  if (typeof window === "undefined") return;

  const lockoutUntil = parseInt(localStorage.getItem(LOCKOUT_KEY) || "0", 10);
  const now = Date.now();

  if (lockoutUntil > 0 && lockoutUntil <= now) {
    localStorage.removeItem(LOCKOUT_KEY);
    localStorage.removeItem(ATTEMPTS_KEY);
  }
};
