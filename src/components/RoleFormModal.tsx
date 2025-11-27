import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createRole, updateRole } from "@/services/api";
import type { Role } from "./RolesManager";
import { toast } from "react-toastify";

import CloseIcon from "@/icons/system/close.svg";

const roleSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  area: z.string().min(1, "El área es requerida"),
  descripcion: z.string().optional(),
});

type RoleFormData = z.infer<typeof roleSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  role: Role | null;
}

export default function RoleFormModal({
  isOpen,
  onClose,
  onSave,
  role,
}: Props) {
  if (!isOpen) return null;

  const isEditing = role !== null;
  const title = isEditing ? "Editar Rol" : "Crear Nuevo Rol";

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
  });

  useEffect(() => {
    if (isEditing && role) {
      reset(role);
    } else {
      reset({ nombre: "", area: "", descripcion: "" });
    }
  }, [role, isEditing, reset]);

  const onSubmit = async (data: RoleFormData) => {
    setIsSubmitting(true);

    try {
      if (isEditing) {
        await updateRole(role.id, data);
        toast.success("Rol actualizado con éxito.");
      } else {
        await createRole(data);
        toast.success("Rol creado con éxito.");
      }
      setTimeout(() => onSave(), 1000);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Ocurrió un error.";
      toast.error(errorMsg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[1100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <button 
            onClick={onClose} 
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <img
              src={CloseIcon.src}
              alt="Icon Cerrar"
              className="w-4 h-4"
            />
            Cancelar
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="nombre" className="text-sm font-medium text-slate-900">Nombre del Rol</label>
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
            <label htmlFor="area" className="text-sm font-medium text-slate-900">Área</label>
            <input 
              id="area" 
              type="text" 
              {...register("area")} 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
            {errors.area && (
              <p className="text-xs text-red-600 font-medium">{errors.area.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="descripcion" className="text-sm font-medium text-slate-900">Descripción (Opcional)</label>
            <textarea 
              id="descripcion" 
              {...register("descripcion")} 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
              rows={3}
            />
          </div>
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
              disabled={isSubmitting || (isEditing && !isDirty)}
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
