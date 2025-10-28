// src/components/LoginForm.tsx

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/authStore";
import { getDashboardPath } from "@/utils/navigation";
// Importar las funciones de utilidad de bloqueo
import { getLockoutStatus, clearLockout } from "@/utils/lockout";

// 1. Definir el esquema de validación con Zod
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El email no puede estar vacío.")
    .email("El email no es válido."),
  password: z.string().min(1, "La contraseña no puede estar vacía."),
});

// 2. Definir el tipo basado en el esquema
type LoginFormInputs = z.infer<typeof loginSchema>;

const LoginForm: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [lockoutMessage, setLockoutMessage] = useState<string | null>(null);

  // 3. Obtener SOLO el estado reactivo necesario con un selector estable
  const login = useAuthStore((state) => state.login);
  const globalError = useAuthStore((state) => state.error);
  const loading = useAuthStore((state) => state.loading);

  // 4. Configurar react-hook-form
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  // 5. Lógica de inicialización - SOLO en cliente
  useEffect(() => {
    // Verificar que estamos en el cliente
    if (typeof window === "undefined") return;

    const initialize = () => {
      try {
        // Obtener las funciones directamente del store sin suscribirse
        const { initializeAuth } = useAuthStore.getState();

        // Inicializar autenticación
        initializeAuth();

        // Limpiar bloqueos expirados
        clearLockout();

        // Verificar estado de bloqueo
        const { isLocked, remainingTime } = getLockoutStatus();
        if (isLocked) {
          setLockoutMessage(
            `Demasiados intentos. Intente de nuevo en ${remainingTime} minutos.`
          );
        } else {
          setLockoutMessage(null);
        }

        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing login form:", error);
        setIsInitialized(true); // Asegurar que se muestre el formulario incluso con error
      }
    };

    // Usar setTimeout en lugar de requestAnimationFrame para mayor compatibilidad
    const timer = setTimeout(initialize, 0);

    return () => clearTimeout(timer);
  }, []); // Dependencias vacías cruciales

  // 6. Manejador de envío
  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setLockoutMessage(null);

    try {
      await login(data);

      // Si login() tiene éxito, obtener roles y redirigir
      const userRoles = useAuthStore.getState().user?.roles || [];
      const path = getDashboardPath(userRoles);
      window.location.href = path; // Redirección
    } catch (err: any) {
      // Manejo de errores de react-hook-form
      if (typeof err === "object" && err !== null && !err.message) {
        if (err.email) {
          setError("email", { type: "manual", message: err.email });
        }
        if (err.password) {
          setError("password", { type: "manual", message: err.password });
        }
      }
      // El error global ya fue seteado en la store por la función login()
    }
  };

  const isFormDisabled = loading || lockoutMessage !== null || !isInitialized;

  // Mostrar un estado de carga mientras se inicializa
  // if (!isInitialized) {
  //   return (
  //     <div className="login-form p-6 text-center text-gray-500">
  //       Cargando formulario...
  //     </div>
  //   );
  // }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="login-form">
      {/* Mostrar error global de la store o el mensaje de bloqueo */}
      {lockoutMessage ? (
        <div className="global-error">{lockoutMessage}</div>
      ) : (
        globalError && <div className="global-error">{globalError}</div>
      )}

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          {...register("email")}
          className={`form-input ${errors.email ? "input-error" : ""}`}
          disabled={isFormDisabled}
        />
        {errors.email && (
          <p className="error-message">{errors.email.message}</p>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          type="password"
          {...register("password")}
          className={`form-input ${errors.password ? "input-error" : ""}`}
          disabled={isFormDisabled}
        />
        {errors.password && (
          <p className="error-message">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        className="btn btn-primary btn-submit"
        x={isFormDisabled}
      >
        {loading ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
};

export default LoginForm;
