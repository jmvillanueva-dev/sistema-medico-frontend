import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema } from "@/lib/validation/profile";
import type { UpdateProfileFormData } from "@/lib/validation/profile";
import { useAuthStore } from "@/store/authStore";
import { useUserProfileStore } from "@/store/userProfileStore";
import { updateEmployee } from "@/services/api";
import { toast } from "react-toastify";

const UpdateProfileForm: React.FC = () => {
  const { user, initializeAuth } = useAuthStore((state) => state);
  const { employeeData, fetchEmployeeData, setEmployeeData, loading, error } =
    useUserProfileStore((state) => state);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      especialidad: "",
      telefono: "",
      codigoProfesional: "",
    },
  });

  useEffect(() => {
    const initAndFetch = async () => {
      await Promise.resolve(initializeAuth());
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.employeeId) {
        fetchEmployeeData(currentUser.employeeId);
      }
    };
    initAndFetch();
  }, [initializeAuth, fetchEmployeeData]);
  useEffect(() => {
    if (employeeData) {
      reset({
        nombre: employeeData.nombre || "",
        apellido: employeeData.apellido || "",
        especialidad: employeeData.especialidad || "",
        telefono: employeeData.telefono || "",
        codigoProfesional: employeeData.codigoProfesional || "",
      });
    }
  }, [employeeData, reset]);

  const onSubmit = async (data: UpdateProfileFormData) => {
    if (!user?.employeeId || !employeeData) return;

    const changedData: Partial<UpdateProfileFormData> = {};

    // Check all editable fields for changes
    (Object.keys(data) as Array<keyof UpdateProfileFormData>).forEach((key) => {
      if (data[key] !== employeeData[key]) {
        changedData[key] = data[key];
      }
    });

    if (Object.keys(changedData).length === 0) {
      toast.info("No hay cambios para guardar.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await updateEmployee(user.employeeId, changedData);
      setEmployeeData(response.data.data);
      toast.success("Perfil actualizado con éxito.");
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Error al actualizar el perfil.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show spinner while loading OR if we don't have data yet and no error (initial state)
  if (loading || (!employeeData && !error)) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-4">
        <svg
          className="animate-spin h-10 w-10 text-primary"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="text-sm text-slate-600">Cargando información del perfil...</p>
      </div>
    );
  }

  // Only show error if NOT loading and we have a store error or still no data
  if (!loading && (!employeeData || error)) {
    return (
      <div className="p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-red-600 font-medium">
            {error || "No se pudo cargar la información del perfil."}
          </p>
          <p className="text-sm text-slate-500">Por favor, intenta recargar la página.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 w-full">
        {/* Instruction Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
            className="flex-shrink-0 text-blue-600 mt-0.5">
            <path fill="currentColor" d="M12 1.67c.955 0 1.845.467 2.39 1.247l.105.16l8.114 13.548a2.914 2.914 0 0 1-2.307 4.363l-.195.008H3.882a2.914 2.914 0 0 1-2.582-4.2l.099-.185l8.11-13.538A2.91 2.91 0 0 1 12 1.67M12 11h-1l-.117.007a1 1 0 0 0 0 1.986L11 13v3l.007.117a1 1 0 0 0 .876.876L12 17h1l.117-.007a1 1 0 0 0 .876-.876L14 16l-.007-.117a1 1 0 0 0-.764-.857l-.112-.02L13 15v-3l-.007-.117a1 1 0 0 0-.876-.876zm.01-3l-.127.007a1 1 0 0 0 0 1.986L12 10l.127-.007a1 1 0 0 0 0-1.986z" />
          </svg>
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Actualiza tu información personal</p>
            <p className="text-blue-800">Puedes modificar tu nombre, especialidad, teléfono y código profesional. La cédula no es editable por seguridad.</p>
          </div>
        </div>
        {/* Grid layout for better space utilization */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre */}
          <div className="flex flex-col gap-2">
            <label htmlFor="nombre" className="text-sm font-medium text-slate-900">Nombre</label>
            <input
              id="nombre"
              type="text"
              {...register("nombre")}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
            {errors.nombre && (
              <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{errors.nombre.message}</span>
              </p>
            )}
          </div>

          {/* Apellido */}
          <div className="flex flex-col gap-2">
            <label htmlFor="apellido" className="text-sm font-medium text-slate-900">Apellido</label>
            <input
              id="apellido"
              type="text"
              {...register("apellido")}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
            {errors.apellido && (
              <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{errors.apellido.message}</span>
              </p>
            )}
          </div>

          {/* Cédula */}
          <div className="flex flex-col gap-2">
            <label htmlFor="cedula" className="text-sm font-medium text-slate-900">
              Cédula
              <span className="ml-2 text-xs text-slate-500 font-normal">(No editable)</span>
            </label>
            <input
              id="cedula"
              type="text"
              value={employeeData.cedula}
              disabled
              className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg cursor-not-allowed"
            />
          </div>

          {/* Especialidad */}
          <div className="flex flex-col gap-2">
            <label htmlFor="especialidad" className="text-sm font-medium text-slate-900">Especialidad</label>
            <input
              id="especialidad"
              type="text"
              {...register("especialidad")}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
            {errors.especialidad && (
              <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{errors.especialidad.message}</span>
              </p>
            )}
          </div>

          {/* Teléfono */}
          <div className="flex flex-col gap-2">
            <label htmlFor="telefono" className="text-sm font-medium text-slate-900">Teléfono</label>
            <input
              id="telefono"
              type="text"
              {...register("telefono")}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
            {errors.telefono && (
              <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{errors.telefono.message}</span>
              </p>
            )}
          </div>

          {/* Código Profesional */}
          <div className="flex flex-col gap-2">
            <label htmlFor="codigoProfesional" className="text-sm font-medium text-slate-900">Código Profesional</label>
            <input
              id="codigoProfesional"
              type="text"
              {...register("codigoProfesional")}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
            {errors.codigoProfesional && (
              <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{errors.codigoProfesional.message}</span>
              </p>
            )}
          </div>
        </div>

        {/* Submit button */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
          >
            {isSubmitting ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </>
  );
};

export default UpdateProfileForm;
