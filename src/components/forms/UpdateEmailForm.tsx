import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateEmailSchema } from "@/lib/validation/profile";
import type { UpdateEmailFormData } from "@/lib/validation/profile";
import { useAuthStore } from "@/store/authStore";
import { updateEmployeeEmail } from "@/services/api";
import { toast } from "react-toastify";

import "./UpdateForm.css";

const UpdateEmailForm: React.FC = () => {
  const { user } = useAuthStore((state) => state);

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
      toast.error("El nuevo correo es igual al actual.");
      return;
    }

    setIsSubmitting(true);

    try {
      await updateEmployeeEmail(user.employeeId, data);
      toast.success(
        "Correo actualizado con éxito. La sesión se cerrará para que inicies sesión con tu nuevo correo."
      );

      // Logout after a delay to allow user to read the message
      setTimeout(() => {
        useAuthStore.getState().logout();
      }, 4000);
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Error al actualizar el correo.";
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
          <label htmlFor="current-email">Correo Actual</label>
          <input
            id="current-email"
            type="email"
            value={user?.email || ""}
            disabled
          />
        </div>
        <div className="form-group">
          <label htmlFor="nuevoEmail">Nuevo Correo Electrónico</label>
          <input id="nuevoEmail" type="email" {...register("nuevoEmail")} />
          {errors.nuevoEmail && (
            <p className="error-message">{errors.nuevoEmail.message}</p>
          )}
        </div>
        <button
          type="submit"
          className="submit-button"
          disabled={isSubmitting || !isDirty}
        >
          {isSubmitting ? "Actualizando..." : "Actualizar Correo"}
        </button>
      </form>
    </>
  );
};

export default UpdateEmailForm;
