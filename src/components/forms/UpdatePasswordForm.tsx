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
        <div className="flex flex-col gap-2">
          <label htmlFor="contrasenaActual" className="text-sm font-medium text-slate-900">Contraseña Actual</label>
          <input
            id="contrasenaActual"
            type="password"
            {...register("contrasenaActual")}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
          {errors.contrasenaActual && (
            <p className="text-xs text-red-600 font-medium">{errors.contrasenaActual.message}</p>
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
            <p className="text-xs text-red-600 font-medium">{errors.nuevaContrasena.message}</p>
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
