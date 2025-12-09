import React, { useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/lib/validation/auth";
import type { ForgotPasswordFormData } from "@/lib/validation/auth";
import { forgotPassword } from "@/services/authService";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";

const ForgotPasswordForm: React.FC = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit: SubmitHandler<ForgotPasswordFormData> = async (data) => {
    setIsLoading(true);
    setErrorMessage(null);
    setIsSuccess(false);

    try {
      await forgotPassword(data.email);
      // Siempre mostramos éxito por razones de seguridad
      setIsSuccess(true);
    } catch (err: any) {
      if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage(
          "No se pudo enviar el correo. Por favor, intenta más tarde."
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
            <p className="font-semibold mb-1">Correo enviado</p>
            <p className="text-green-600">
              Se ha enviado un correo con instrucciones para restablecer tu
              contraseña. Por favor revisa tu bandeja de entrada.
            </p>
          </div>
        </div>
      )}

      {/* Mensaje de error */}
      {errorMessage && (
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
          <span>{errorMessage}</span>
        </div>
      )}

      <Input
        id="email"
        type="email"
        label="Correo Electrónico"
        placeholder="nombre@ejemplo.com"
        {...register("email")}
        error={errors.email?.message}
        disabled={isLoading || isSuccess}
      />

      <Button
        type="submit"
        variant="primary"
        fullWidth
        isLoading={isLoading}
        disabled={isLoading || isSuccess}
      >
        {isLoading ? "Enviando..." : "Enviar instrucciones"}
      </Button>

      <div className="text-center">
        <a
          href="/login"
          className="text-sm text-primary hover:text-blue-700 hover:underline"
        >
          Volver al inicio de sesión
        </a>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
