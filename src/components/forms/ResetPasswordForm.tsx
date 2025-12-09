import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "@/lib/validation/auth";
import type { ResetPasswordFormData } from "@/lib/validation/auth";
import { resetPassword } from "@/services/authService";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";

interface ResetPasswordFormProps {
  token: string;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Efecto para el countdown de redirección
  useEffect(() => {
    if (redirectCountdown === null) return;

    if (redirectCountdown === 0) {
      window.location.href = "/login";
      return;
    }

    const timer = setTimeout(() => {
      setRedirectCountdown(redirectCountdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [redirectCountdown]);

  const onSubmit: SubmitHandler<ResetPasswordFormData> = async (data) => {
    setIsLoading(true);
    setErrorMessage(null);
    setIsSuccess(false);

    try {
      await resetPassword(token, data.nuevaPassword);
      setIsSuccess(true);
      setRedirectCountdown(3); // Redirigir en 3 segundos
    } catch (err: any) {
      if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage(
          "No se pudo restablecer la contraseña. Por favor, intenta más tarde."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-6">
      {/* Mensaje de éxito */}
      {isSuccess && (
        <div className="flex items-start gap-3 p-4 text-sm text-green-700 bg-green-50 rounded-lg border border-green-200">
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
            className="flex-shrink-0 mt-0.5"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <div>
            <p className="font-semibold mb-1">¡Contraseña actualizada!</p>
            <p className="text-green-600">
              Tu contraseña ha sido actualizada exitosamente. Ahora puedes
              iniciar sesión con tu nueva contraseña.
            </p>
            {redirectCountdown !== null && (
              <p className="mt-2 text-green-600 font-medium">
                Redirigiendo al login en {redirectCountdown}...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Mensaje de error */}
      {errorMessage && (
        <div className="flex items-start gap-3 p-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
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
            className="flex-shrink-0 mt-0.5"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
          <div>
            <p className="font-semibold mb-1">Error</p>
            <p>{errorMessage}</p>
            {(errorMessage.includes("expirado") ||
              errorMessage.includes("inválido")) && (
              <p className="mt-2">
                <a
                  href="/auth/forgot-password"
                  className="text-primary hover:text-blue-700 hover:underline font-medium"
                >
                  Solicitar un nuevo enlace de recuperación
                </a>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Campo Nueva Contraseña */}
      <div className="relative">
        <Input
          id="nuevaPassword"
          type={showPassword ? "text" : "password"}
          label="Nueva Contraseña"
          placeholder="••••••••"
          {...register("nuevaPassword")}
          error={errors.nuevaPassword?.message}
          disabled={isLoading || isSuccess}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 focus:outline-none"
          disabled={isLoading || isSuccess}
          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
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

      {/* Campo Confirmar Contraseña */}
      <div className="relative">
        <Input
          id="confirmarPassword"
          type={showConfirmPassword ? "text" : "password"}
          label="Confirmar Contraseña"
          placeholder="••••••••"
          {...register("confirmarPassword")}
          error={errors.confirmarPassword?.message}
          disabled={isLoading || isSuccess}
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 focus:outline-none"
          disabled={isLoading || isSuccess}
          aria-label={
            showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"
          }
        >
          {showConfirmPassword ? (
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
        isLoading={isLoading}
        disabled={isLoading || isSuccess}
      >
        {isLoading ? "Actualizando..." : "Actualizar contraseña"}
      </Button>

      {!isSuccess && (
        <div className="text-center">
          <a
            href="/login"
            className="text-sm text-primary hover:text-blue-700 hover:underline"
          >
            Volver al inicio de sesión
          </a>
        </div>
      )}
    </form>
  );
};

export default ResetPasswordForm;
