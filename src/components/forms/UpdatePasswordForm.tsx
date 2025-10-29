import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updatePasswordSchema
} from "@/lib/validation/profile";
import type { UpdatePasswordFormData } from "@/lib/validation/profile";
import { useAuthStore } from "@/store/authStore";
import { updateMyPassword } from "@/services/api";
import NotificationToast from "@/components/common/NotificationToast.tsx";

import "./UpdateForm.css";

const UpdatePasswordForm: React.FC = () => {
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
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
    setNotification(null);

    try {
      await updateMyPassword(data);
      setNotification({
        message: "Contraseña actualizada con éxito. La sesión se cerrará para que inicies sesión de nuevo.",
        type: "success",
      });

      // Logout after a delay
      setTimeout(() => {
        useAuthStore.getState().logout();
      }, 4000);

    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Error al actualizar la contraseña.";
      setNotification({ message: errorMsg, type: "error" });
    } finally {
      setIsSubmitting(false);
      reset();
    }
  };

  return (
    <>
      {notification && (
        <NotificationToast
          isVisible
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="update-form">
        <div className="form-group">
          <label htmlFor="contrasenaActual">Contraseña Actual</label>
          <input id="contrasenaActual" type="password" {...register("contrasenaActual")} />
          {errors.contrasenaActual && <p className="error-message">{errors.contrasenaActual.message}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="nuevaContrasena">Nueva Contraseña</label>
          <input id="nuevaContrasena" type="password" {...register("nuevaContrasena")} />
          {errors.nuevaContrasena && <p className="error-message">{errors.nuevaContrasena.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? "Actualizando..." : "Actualizar Contraseña"}
        </button>
      </form>
    </>
  );
};

export default UpdatePasswordForm;
