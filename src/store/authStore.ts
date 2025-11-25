// src/store/authStore.ts

import { create } from "zustand";
import Cookies from "js-cookie";
import api from "@/services/api";
import { getDashboardPath } from "@/utils/navigation";
import {
  getLockoutStatus,
  ATTEMPTS_KEY,
  LOCKOUT_KEY,
  MAX_LOGIN_ATTEMPTS,
  LOCKOUT_DURATION_MS,
} from "@/utils/lockout";
import type { User } from "@/types/user";


interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  error: string | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  initializeAuth: () => void;
}

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

  /**
   * Maneja el intento de inicio de sesión.
   */
  login: async (credentials) => {
    set({ loading: true, error: null });

    // 1. Verificar bloqueo
    const { isLocked, remainingTime } = getLockoutStatus();
    if (isLocked) {
      const errorMsg = `Demasiados intentos fallidos. Por favor, espere ${remainingTime} minutos.`;
      set({ loading: false, error: errorMsg });
      throw new Error(errorMsg);
    }

    try {
      // 2. Llamada API
      const response = await api.post("/auth/login", credentials);

      const { data: responseData } = response.data;
      const { accessToken, refreshToken, email, roles, employeeId, name, lastName } = responseData;

      const user: User = { email, roles, employeeId, name, lastName };

      // 3. Guardar en Cookies
      const cookieOptions = {
        secure: import.meta.env.PROD,
        sameSite: "strict",
      } as const;

      Cookies.set("auth-token", accessToken, cookieOptions);
      Cookies.set("auth-refresh-token", refreshToken, cookieOptions);
      Cookies.set("auth-user", JSON.stringify(user), cookieOptions);

      // 4. Resetear intentos fallidos
      localStorage.removeItem(ATTEMPTS_KEY);
      localStorage.removeItem(LOCKOUT_KEY);

      // 5. Actualizar estado
      set({ isAuthenticated: true, user, loading: false });
    } catch (err: any) {
      set({ loading: false });

      // 6. Manejo de Errores
      if (err.response) {
        const data = err.response.data;

        // Verificamos si el mensaje indica credenciales incorrectas
        const errorMessage = data.message || "Error en el servidor.";

        if (errorMessage.includes("Credenciales incorrectas")) {
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
            const errorMsg = `${errorMessage} (Intento ${attempts} de ${MAX_LOGIN_ATTEMPTS})`;
            set({ error: errorMsg });
            throw new Error(errorMsg);
          }
        }

        // Otro error de backend
        set({ error: errorMessage });
        throw new Error(errorMessage);
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
    Cookies.remove("auth-refresh-token");
    Cookies.remove("auth-user");
    set({ isAuthenticated: false, user: null });
    window.location.href = "/login";
  },
}));
