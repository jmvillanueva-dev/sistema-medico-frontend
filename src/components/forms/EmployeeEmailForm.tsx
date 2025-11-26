import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateEmailSchema } from "@/lib/validation/profile";
import type { UpdateEmailFormData } from "@/lib/validation/profile";
import { updateEmployeeEmail } from "@/services/api";
import { toast } from "react-toastify";

import "./UpdateForm.css";

interface Props {
  employeeId: string;
  currentEmail: string;
  onSave: () => void;
}

const EmployeeEmailForm: React.FC<Props> = ({
  employeeId,
  currentEmail,
  onSave,
}) => {
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
      toast.error("El nuevo correo es igual al actual.");
      return;
    }

    setIsSubmitting(true);

    try {
      await updateEmployeeEmail(employeeId, data);
      toast.success("Correo actualizado con éxito.");

      setTimeout(() => {
        onSave();
      }, 1000);
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Error al actualizar el correo.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
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
