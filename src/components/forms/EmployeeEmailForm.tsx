import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateEmailSchema } from "@/lib/validation/profile";
import type { UpdateEmailFormData } from "@/lib/validation/profile";
import { updateEmployeeEmail } from "@/services/api";
import NotificationToast from "@/components/common/NotificationToast.tsx";

import "./UpdateForm.css";

interface Props {
  employeeId: string;
  currentEmail: string;
  onSave: () => void;
}

const EmployeeEmailForm: React.FC<Props> = ({ employeeId, currentEmail, onSave }) => {
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
    if (data.nuevoEmail === currentEmail) {
      setNotification({ message: "El nuevo correo es igual al actual.", type: "error" });
      return;
    }

    setIsSubmitting(true);
    setNotification(null);

    try {
      await updateEmployeeEmail(employeeId, data);
      setNotification({ message: "Correo actualizado con éxito.", type: "success" });

      setTimeout(() => {
        onSave();
      }, 1000);

    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Error al actualizar el correo.";
      setNotification({ message: errorMsg, type: "error" });
    } finally {
      setIsSubmitting(false);
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
          <input
            id="current-email"
            type="email"
            value={currentEmail}
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
        <div>
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting || !isDirty}
          >
            {isSubmitting ? "Actualizando..." : "Actualizar Correo"}
          </button>
        </div>
      </form>
    </>
  );
};

export default EmployeeEmailForm;
