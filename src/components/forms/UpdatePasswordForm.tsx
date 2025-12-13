import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updatePasswordSchema } from "@/lib/validation/profile";
import type { UpdatePasswordFormData } from "@/lib/validation/profile";
import { useAuthStore } from "@/store/authStore";
import { updateMyPassword } from "@/services/api";
import { toast } from "react-toastify";

const UpdatePasswordForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
  });

  const onSubmit = async (data: UpdatePasswordFormData) => {
    setIsSubmitting(true);

    try {
      await updateMyPassword(data);
      toast.success(
        "Contraseña actualizada con éxito. La sesión se cerrará para que inicies sesión de nuevo."
      );

      // Logout after a delay
      setTimeout(() => {
        useAuthStore.getState().logout();
      }, 4000);
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Error al actualizar la contraseña.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
      reset();
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 w-full">
        {/* Instruction Box */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
            className="flex-shrink-0 text-green-600  mt-0.5">
            <path fill="currentColor" d="M12 1.67c.955 0 1.845.467 2.39 1.247l.105.16l8.114 13.548a2.914 2.914 0 0 1-2.307 4.363l-.195.008H3.882a2.914 2.914 0 0 1-2.582-4.2l.099-.185l8.11-13.538A2.91 2.91 0 0 1 12 1.67M12 11h-1l-.117.007a1 1 0 0 0 0 1.986L11 13v3l.007.117a1 1 0 0 0 .876.876L12 17h1l.117-.007a1 1 0 0 0 .876-.876L14 16l-.007-.117a1 1 0 0 0-.764-.857l-.112-.02L13 15v-3l-.007-.117a1 1 0 0 0-.876-.876zm.01-3l-.127.007a1 1 0 0 0 0 1.986L12 10l.127-.007a1 1 0 0 0 0-1.986z" />
          </svg>
          <div className="text-sm text-green-900">
            <p className="font-semibold mb-1">Actualizar contraseña</p>
            <p className="text-green-800">Tu contraseña debe tener al menos 6 caracteres. Por seguridad, se cerrará tu sesión después del cambio.</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="contrasenaActual" className="text-sm font-medium text-slate-900">Contraseña Actual</label>
          <input
            id="contrasenaActual"
            type="password"
            {...register("contrasenaActual")}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
          {errors.contrasenaActual && (
            <p className="text-xs text-red-600 font-medium flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{errors.contrasenaActual.message}</span>
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="nuevaContrasena" className="text-sm font-medium text-slate-900">Nueva Contraseña</label>
          <input
            id="nuevaContrasena"
            type="password"
            {...register("nuevaContrasena")}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
          {errors.nuevaContrasena && (
            <p className="text-xs text-red-600 font-medium flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{errors.nuevaContrasena.message}</span>
            </p>
          )}
        </div>
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button 
            type="submit" 
            disabled={isSubmitting || !isDirty}
            className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
          >
            {isSubmitting ? "Actualizando..." : "Actualizar Contraseña"}
          </button>
        </div>
      </form>
    </>
  );
};

export default UpdatePasswordForm;
