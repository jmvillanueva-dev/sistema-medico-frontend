import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateEmailSchema
} from "@/lib/validation/profile";
import type { UpdateEmailFormData } from "@/lib/validation/profile";
import { useAuthStore } from "@/store/authStore";
import { updateEmployeeEmail } from "@/services/api";
import NotificationToast from "@/components/common/NotificationToast.tsx";

import "./UpdateForm.css";

const UpdateEmailForm: React.FC = () => {
  const { user } = useAuthStore((state) => state);

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
  } = useForm<UpdateEmailFormData>({
    resolver: zodResolver(updateEmailSchema),
  });

  const onSubmit = async (data: UpdateEmailFormData) => {
    if (!user?.employeeId) return;

    if (data.nuevoEmail === user.email) {
        setNotification({ message: "El nuevo correo es igual al actual.", type: "error" });
        return;
    }

    setIsSubmitting(true);
    setNotification(null);

    try {
      await updateEmployeeEmail(user.employeeId, data);
      setNotification({
        message: "Correo actualizado con éxito. La sesión se cerrará para que inicies sesión con tu nuevo correo.",
        type: "success",
      });
      
      // Logout after a delay to allow user to read the message
      setTimeout(() => {
        useAuthStore.getState().logout();
      }, 4000);

    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Error al actualizar el correo.";
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
          <label htmlFor="current-email">Correo Actual</label>
          <input id="current-email" type="email" value={user?.email || ''} disabled />
        </div>
        <div className="form-group">
          <label htmlFor="nuevoEmail">Nuevo Correo Electrónico</label>
          <input id="nuevoEmail" type="email" {...register("nuevoEmail")} />
          {errors.nuevoEmail && <p className="error-message">{errors.nuevoEmail.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? "Actualizando..." : "Actualizar Correo"}
        </button>
      </form>
    </>
  );
};

export default UpdateEmailForm;
