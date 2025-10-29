// src/store/authStore.ts

import { create } from "zustand";
import Cookies from "js-cookie";
import api from "@/services/api";
import { getDashboardPath } from "@/utils/navigation";
import {
  getLockoutStatus,
  // NOTA: clearLockout no se usa aquí, pero sí se usan las constantes
  ATTEMPTS_KEY,
  LOCKOUT_KEY,
  MAX_LOGIN_ATTEMPTS,
  LOCKOUT_DURATION_MS,
} from "@/utils/lockout";

// --- Tipos ---
interface User {
  email: string;
  roles: string[];
  employeeId: string;
  name: string;
  lastName: string;
}

// LockoutState ya no se define aquí

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  error: string | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  initializeAuth: () => void;
  // getLockoutStatus y clearLockout eliminados del estado
}

// Las funciones getLockoutStatus y clearLockout se eliminaron de aquí

// --- Store ---
export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  error: null,
  loading: false,

  /**
   * Inicializa el estado de autenticación al cargar la app,
   * leyendo las cookies.
   */
  initializeAuth: () => {
    if (typeof window === "undefined") return;
    const userCookie = Cookies.get("auth-user");
    const token = Cookies.get("auth-token");

    if (userCookie && token) {
      try {
        const user = JSON.parse(userCookie);
        set({ isAuthenticated: true, user });
      } catch (e) {
        // Cookie malformada, limpiar
        get().logout();
      }
    }
  },

  // getLockoutStatus y clearLockout eliminados de aquí

  /**
   * Maneja el intento de inicio de sesión.
   */
  login: async (credentials) => {
    set({ loading: true, error: null });

    // 1. Verificar bloqueo (ahora usa la función importada)
    const { isLocked, remainingTime } = getLockoutStatus();
    if (isLocked) {
      const errorMsg = `Demasiados intentos fallidos. Por favor, espere ${remainingTime} minutos.`;
      set({ loading: false, error: errorMsg });
      throw new Error(errorMsg);
    }

    try {
      // 2. Llamada API
      const response = await api.post("/auth/login", credentials);
      const { accessToken, email, roles, employeeId, name, lastName } =
        response.data;

      const user: User = { email, roles, employeeId, name, lastName };

      // 3. Guardar en Cookies
      const cookieOptions = {
        secure: import.meta.env.PROD,
        sameSite: "strict",
      } as const;

      Cookies.set("auth-token", accessToken, cookieOptions);
      Cookies.set("auth-user", JSON.stringify(user), cookieOptions);

      // 4. Resetear intentos fallidos (usa constantes importadas)
      localStorage.removeItem(ATTEMPTS_KEY);
      localStorage.removeItem(LOCKOUT_KEY);

      // 5. Actualizar estado
      set({ isAuthenticated: true, user, loading: false });
    } catch (err: any) {
      set({ loading: false });

      // 6. Manejo de Errores
      if (err.response) {
        const data = err.response.data;

        // Caso 1: Campos vacíos
        if (typeof data === "object" && (data.email || data.password)) {
          throw data; // Lanzar para que react-hook-form lo capture
        }

        // Caso 2: Credenciales incorrectas (usa constantes importadas)
        if (
          typeof data === "string" &&
          data.includes("Credenciales incorrectas")
        ) {
          const attempts =
            parseInt(localStorage.getItem(ATTEMPTS_KEY) || "0", 10) + 1;

          if (attempts >= MAX_LOGIN_ATTEMPTS) {
            // Bloquear
            const lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
            localStorage.setItem(LOCKOUT_KEY, lockoutUntil.toString());
            localStorage.removeItem(ATTEMPTS_KEY);
            const errorMsg = `Demasiados intentos fallidos. Por favor, espere ${
              LOCKOUT_DURATION_MS / 60000
            } minutos.`;
            set({ error: errorMsg });
            throw new Error(errorMsg);
          } else {
            // Guardar intento
            localStorage.setItem(ATTEMPTS_KEY, attempts.toString());
            const errorMsg = `${data} (Intento ${attempts} de ${MAX_LOGIN_ATTEMPTS})`;
            set({ error: errorMsg });
            throw new Error(errorMsg);
          }
        }

        // Otro error de backend
        const errorMsg = data.message || "Error en el servidor.";
        set({ error: errorMsg });
        throw new Error(errorMsg);
      } else {
        // Error de red o Axios
        const errorMsg = "No se pudo conectar al servidor. Intente más tarde.";
        set({ error: errorMsg });
        throw new Error(errorMsg);
      }
    }
  },

  /**
   * Cierra la sesión del usuario.
   */
  logout: () => {
    Cookies.remove("auth-token");
    Cookies.remove("auth-user");
    set({ isAuthenticated: false, user: null });
    // Redirigir al login
    window.location.href = "/login";
  },
}));
