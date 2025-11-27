import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateEmailSchema } from "@/lib/validation/profile";
import type { UpdateEmailFormData } from "@/lib/validation/profile";
import { useAuthStore } from "@/store/authStore";
import { updateEmployeeEmail } from "@/services/api";
import { toast } from "react-toastify";

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
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 w-full">
        <div className="flex flex-col gap-2">
          <label htmlFor="current-email" className="text-sm font-medium text-slate-900">Correo Actual</label>
          <input
            id="current-email"
            type="email"
            value={user?.email || ""}
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
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            disabled={isSubmitting || !isDirty}
          >
            {isSubmitting ? "Actualizando..." : "Actualizar Correo"}
          </button>
        </div>
      </form>
    </>
  );
};

export default UpdateEmailForm;
