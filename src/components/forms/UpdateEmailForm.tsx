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
        {/* Instruction Box */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
            className="flex-shrink-0 text-amber-600  mt-0.5">
            <path fill="currentColor" d="M12 1.67c.955 0 1.845.467 2.39 1.247l.105.16l8.114 13.548a2.914 2.914 0 0 1-2.307 4.363l-.195.008H3.882a2.914 2.914 0 0 1-2.582-4.2l.099-.185l8.11-13.538A2.91 2.91 0 0 1 12 1.67M12 11h-1l-.117.007a1 1 0 0 0 0 1.986L11 13v3l.007.117a1 1 0 0 0 .876.876L12 17h1l.117-.007a1 1 0 0 0 .876-.876L14 16l-.007-.117a1 1 0 0 0-.764-.857l-.112-.02L13 15v-3l-.007-.117a1 1 0 0 0-.876-.876zm.01-3l-.127.007a1 1 0 0 0 0 1.986L12 10l.127-.007a1 1 0 0 0 0-1.986z" />
          </svg>
          <div className="text-sm text-amber-900">
            <p className="font-semibold mb-1">Cambiar correo electrónico</p>
            <p className="text-amber-800">Al actualizar tu correo, se cerrará tu sesión automáticamente. Deberás iniciar sesión nuevamente con el nuevo correo.</p>
          </div>
        </div>
        {/* Use single column layout for better email visibility */}
        <div className="flex flex-col gap-2">
          <label htmlFor="current-email" className="text-sm font-medium text-slate-900">Correo Actual</label>
          <input
            id="current-email"
            type="email"
            value={user?.email || ""}
            disabled
            className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg cursor-not-allowed text-sm"
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
            <p className="text-xs text-red-600 font-medium flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{errors.nuevoEmail.message}</span>
            </p>
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
