import React, { useState, useEffect } from "react";
import { verifyAccount } from "@/services/authService";
import { Button } from "@/components/common/Button";

interface VerifyAccountProps {
  token: string;
}

const VerifyAccount: React.FC<VerifyAccountProps> = ({ token }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAlreadyVerified, setIsAlreadyVerified] = useState(false);

  useEffect(() => {
    const verify = async () => {
      try {
        await verifyAccount(token);
        setIsSuccess(true);
      } catch (err: any) {
        if (err.response?.data?.message) {
          const message = err.response.data.message;
          setErrorMessage(message);
          
          // Detectar si la cuenta ya fue verificada
          if (message.toLowerCase().includes("ya ha sido verificada")) {
            setIsAlreadyVerified(true);
          }
        } else {
          setErrorMessage(
            "No se pudo verificar tu cuenta. Por favor, intenta más tarde."
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    verify();
  }, [token]);

  // Estado de carga
  if (isLoading) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6 animate-pulse">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary animate-spin"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Verificando tu cuenta...
        </h1>
        <p className="text-slate-500">
          Por favor espera mientras verificamos tu cuenta.
        </p>
      </div>
    );
  }

  // Estado de éxito
  if (isSuccess) {
    return (
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-600"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            ¡Cuenta verificada exitosamente!
          </h1>
          <p className="text-slate-600 mb-6">
            Tu cuenta ha sido activada correctamente. Ahora puedes iniciar
            sesión en el sistema con tus credenciales.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          fullWidth
          onClick={() => (window.location.href = "/login")}
        >
          Ir a inicio de sesión
        </Button>
      </div>
    );
  }

  // Estado de error
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-red-600"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {isAlreadyVerified
            ? "Cuenta ya verificada"
            : "Error al verificar cuenta"}
        </h1>
        <p className="text-slate-600 mb-6">{errorMessage}</p>
      </div>

      {isAlreadyVerified ? (
        <Button
          type="button"
          variant="primary"
          fullWidth
          onClick={() => (window.location.href = "/login")}
        >
          Ir a inicio de sesión
        </Button>
      ) : (
        <div className="space-y-3">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={() => (window.location.href = "/login")}
          >
            Volver al inicio de sesión
          </Button>
          <p className="text-sm text-center text-slate-500">
            Si el problema persiste, contacta al administrador del sistema.
          </p>
        </div>
      )}
    </div>
  );
};

export default VerifyAccount;
