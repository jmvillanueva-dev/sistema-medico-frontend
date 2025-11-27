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
  const { employeeData, fetchEmployeeData, setEmployeeData, loading } =
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

  if (loading && !employeeData) {
    return <div className="p-8 text-center text-slate-500">Cargando perfil...</div>;
  }

  if (!employeeData) {
    return <div className="p-8 text-center text-red-500">No se pudo cargar la información del perfil.</div>;
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 w-full">
        <div className="flex flex-col gap-2">
          <label htmlFor="nombre" className="text-sm font-medium text-slate-900">Nombre</label>
          <input 
            id="nombre" 
            type="text" 
            {...register("nombre")} 
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
          {errors.nombre && (
            <p className="text-xs text-red-600 font-medium">{errors.nombre.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="apellido" className="text-sm font-medium text-slate-900">Apellido</label>
          <input 
            id="apellido" 
            type="text" 
            {...register("apellido")} 
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
          {errors.apellido && (
            <p className="text-xs text-red-600 font-medium">{errors.apellido.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="cedula" className="text-sm font-medium text-slate-900">Cédula</label>
          <input 
            id="cedula" 
            type="text" 
            value={employeeData.cedula} 
            disabled 
            className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg cursor-not-allowed"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="especialidad" className="text-sm font-medium text-slate-900">Especialidad</label>
          <input 
            id="especialidad" 
            type="text" 
            {...register("especialidad")} 
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
          {errors.especialidad && (
            <p className="text-xs text-red-600 font-medium">{errors.especialidad.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="telefono" className="text-sm font-medium text-slate-900">Teléfono</label>
          <input 
            id="telefono" 
            type="text" 
            {...register("telefono")} 
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
          {errors.telefono && (
            <p className="text-xs text-red-600 font-medium">{errors.telefono.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="codigoProfesional" className="text-sm font-medium text-slate-900">Código Profesional</label>
          <input
            id="codigoProfesional"
            type="text"
            {...register("codigoProfesional")}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
          {errors.codigoProfesional && (
            <p className="text-xs text-red-600 font-medium">{errors.codigoProfesional.message}</p>
          )}
        </div>
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
