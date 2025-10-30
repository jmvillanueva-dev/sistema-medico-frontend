import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createRole, updateRole } from "@/services/api";
import type { Role } from "./RolesManager";
import NotificationToast from "./common/NotificationToast";
import "./forms/UpdateForm.css";

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

export default function RoleFormModal({ isOpen, onClose, onSave, role }: Props) {
  if (!isOpen) return null;

  const isEditing = role !== null;
  const title = isEditing ? "Editar Rol" : "Crear Nuevo Rol";

  const [notification, setNotification] = useState<{ message: string; type: "success" | "error"; } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<RoleFormData>({
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
    setNotification(null);

    try {
      if (isEditing) {
        await updateRole(role.id, data);
        setNotification({ message: "Rol actualizado con éxito.", type: "success" });
      } else {
        await createRole(data);
        setNotification({ message: "Rol creado con éxito.", type: "success" });
      }
      setTimeout(() => onSave(), 1000);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Ocurrió un error.";
      setNotification({ message: errorMsg, type: "error" });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content form-modal">
        {notification && (
          <NotificationToast
            isVisible
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
        <button onClick={onClose} className="btn close-button">
          <img src={CloseIcon.src} alt="Icon Cerrar" className="icon icon-scale" />
          Cancelar
        </button>
        <div className="form-modal-header">
          <h2>{title}</h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="update-form">
          <div className="form-group">
            <label htmlFor="nombre">Nombre del Rol</label>
            <input id="nombre" type="text" {...register("nombre")} />
            {errors.nombre && (
              <p className="error-message">{errors.nombre.message}</p>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="area">Área</label>
            <input id="area" type="text" {...register("area")} />
            {errors.area && (
              <p className="error-message">{errors.area.message}</p>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="descripcion">Descripción (Opcional)</label>
            <textarea id="descripcion" {...register("descripcion")} />
          </div>
          <button
            type="submit"
            disabled={isSubmitting || (isEditing && !isDirty)}
          >
            {isSubmitting ? "Guardando..." : "Guardar"}
          </button>
        </form>
      </div>
    </div>
  );
}
