import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/authStore";
import { getDashboardPath } from "@/utils/navigation";
import { getLockoutStatus, clearLockout } from "@/utils/lockout";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";

// Esquema de validacion
const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "El email no puede estar vacío.")
    .email("El email no es válido."),
  password: z.string().trim().min(1, "La contraseña no puede estar vacía."),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lockoutMessage, setLockoutMessage] = useState<string | null>(null);

  const login = useAuthStore((state) => state.login);
  const globalError = useAuthStore((state) => state.error);
  const loading = useAuthStore((state) => state.loading);

  // Configuración de react-hook-form
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  // Lógica de inicialización - SOLO en cliente
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initialize = () => {
      try {
        const { initializeAuth } = useAuthStore.getState();
        initializeAuth();
        clearLockout();

        const { isLocked, remainingTime } = getLockoutStatus();
        if (isLocked) {
          setLockoutMessage(
            `Demasiados intentos. Intente de nuevo en ${remainingTime} minutos.`,
          );
        } else {
          setLockoutMessage(null);
        }

        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing login form:", error);
        setIsInitialized(true);
      }
    };

    const timer = setTimeout(initialize, 0);
    return () => clearTimeout(timer);
  }, []);

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setLockoutMessage(null);

    try {
      const result = await login(data);

      // Verificar si requiere cambio de contraseña obligatorio
      if (result?.requiereCambioPassword) {
        // Redirigir a la página de cambio obligatorio con el email
        window.location.href = `/auth/force-change-password?email=${encodeURIComponent(result.email)}`;
        return;
      }

      // Si no requiere cambio, continuar al dashboard normal
      const userRoles = useAuthStore.getState().user?.roles || [];
      const path = getDashboardPath(userRoles);
      window.location.href = path;
    } catch (err: any) {
      if (typeof err === "object" && err !== null && !err.message) {
        if (err.email) {
          setError("email", { type: "manual", message: err.email });
        }
        if (err.password) {
          setError("password", { type: "manual", message: err.password });
        }
      }
    }
  };

  const isFormDisabled = loading || lockoutMessage !== null || !isInitialized;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-md space-y-6"
    >
      {/* Mostrar error global de la store o el mensaje de bloqueo */}
      {lockoutMessage ? (
        <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
          <span>{lockoutMessage}</span>
        </div>
      ) : (
        globalError && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
            <span>{globalError}</span>
          </div>
        )
      )}

      <Input
        id="email"
        type="email"
        label="Email"
        placeholder="nombre@ejemplo.com"
        {...register("email")}
        error={errors.email?.message}
        disabled={isFormDisabled}
      />

      <div className="relative">
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          label="Contraseña"
          placeholder="••••••••"
          {...register("password")}
          error={errors.password?.message}
          disabled={isFormDisabled}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 focus:outline-none"
          disabled={isFormDisabled}
          aria-label={
            showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
          }
        >
          {showPassword ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>

      <Button
        type="submit"
        variant="primary"
        fullWidth
        isLoading={loading}
        disabled={isFormDisabled}
      >
        {loading ? "Ingresando..." : "Ingresar"}
      </Button>

      <div className="text-center">
        <a
          href="/auth/forgot-password"
          className="text-sm text-primary hover:text-blue-700 hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </a>
      </div>
    </form>
  );
};

export default LoginForm;
