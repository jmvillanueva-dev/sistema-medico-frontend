import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateEmailSchema } from "@/lib/validation/profile";
import type { UpdateEmailFormData } from "@/lib/validation/profile";
import { updateEmployeeEmail } from "@/services/api";
import { toast } from "react-toastify";

interface Props {
  employeeId: string;
  currentEmail: string;
  onSave: () => void;
  setIsLoading: (loading: boolean) => void;
  setIsDirty: (dirty: boolean) => void;
}

const EmployeeEmailForm: React.FC<Props> = ({
  employeeId,
  currentEmail,
  onSave,
  setIsLoading,
  setIsDirty: setParentDirty
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateEmailFormData>({
    resolver: zodResolver(updateEmailSchema),
  });

  // Sync dirty state
  React.useEffect(() => {
    setParentDirty(isDirty);
  }, [isDirty, setParentDirty]);

  const onSubmit = async (data: UpdateEmailFormData) => {
    if (data.nuevoEmail === currentEmail) {
      toast.error("El nuevo correo es igual al actual.");
      return;
    }

    setIsLoading(true);

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
      setIsLoading(false);
    }
  };

  return (
    <>
      <form id="employee-email-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 w-full">
        <div className="flex flex-col gap-2">
          <label htmlFor="current-email" className="text-sm font-medium text-slate-900">Correo Actual</label>
          <input
            id="current-email"
            type="email"
            value={currentEmail}
            disabled
            className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg cursor-not-allowed"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="nuevoEmail" className="text-sm font-medium text-slate-900">Nuevo Correo Electrónico</label>
          <input
            id="nuevoEmail"
            type="email"
            {...register("nuevoEmail")}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
          {errors.nuevoEmail && (
            <p className="text-xs text-red-600 font-medium">{errors.nuevoEmail.message}</p>
          )}
        </div>
      </form>
    </>
  );
};

export default EmployeeEmailForm;
