import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updatePasswordSchema } from "@/lib/validation/profile";
import type { UpdatePasswordFormData } from "@/lib/validation/profile";
import { useAuthStore } from "@/store/authStore";
import { updateMyPassword } from "@/services/api";
import { toast } from "react-toastify";

import "./UpdateForm.css";

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
      <form onSubmit={handleSubmit(onSubmit)} className="update-form">
        <div className="form-group">
          <label htmlFor="contrasenaActual">Contraseña Actual</label>
          <input
            id="contrasenaActual"
            type="password"
            {...register("contrasenaActual")}
          />
          {errors.contrasenaActual && (
            <p className="error-message">{errors.contrasenaActual.message}</p>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="nuevaContrasena">Nueva Contraseña</label>
          <input
            id="nuevaContrasena"
            type="password"
            {...register("nuevaContrasena")}
          />
          {errors.nuevaContrasena && (
            <p className="error-message">{errors.nuevaContrasena.message}</p>
          )}
        </div>
        <button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? "Actualizando..." : "Actualizar Contraseña"}
        </button>
      </form>
    </>
  );
};

export default UpdatePasswordForm;
