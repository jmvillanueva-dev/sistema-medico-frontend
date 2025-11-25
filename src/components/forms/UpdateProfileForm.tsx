import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema } from "@/lib/validation/profile";
import type { UpdateProfileFormData } from "@/lib/validation/profile";
import { useAuthStore } from "@/store/authStore";
import { useUserProfileStore } from "@/store/userProfileStore";
import { updateEmployee } from "@/services/api";
import NotificationToast from "@/components/common/NotificationToast.tsx";

import "./UpdateForm.css";

const UpdateProfileForm: React.FC = () => {
  const { user, initializeAuth } = useAuthStore((state) => state);
  const { employeeData, fetchEmployeeData, setEmployeeData, loading } =
    useUserProfileStore((state) => state);

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
      setNotification({
        message: "No hay cambios para guardar.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);
    setNotification(null);

    try {
      const response = await updateEmployee(user.employeeId, changedData);
      setEmployeeData(response.data);
      setNotification({
        message: "Perfil actualizado con éxito.",
        type: "success",
      });
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Error al actualizar el perfil.";
      setNotification({ message: errorMsg, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !employeeData) {
    return <div>Cargando perfil...</div>;
  }

  if (!employeeData) {
    return <div>No se pudo cargar la información del perfil.</div>;
  }

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
          <label htmlFor="nombre">Nombre</label>
          <input id="nombre" type="text" {...register("nombre")} />
          {errors.nombre && <p className="error-message">{errors.nombre.message}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="apellido">Apellido</label>
          <input id="apellido" type="text" {...register("apellido")} />
          {errors.apellido && (
            <p className="error-message">{errors.apellido.message}</p>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="cedula">Cédula</label>
          <input id="cedula" type="text" value={employeeData.cedula} disabled />
        </div>
        <div className="form-group">
          <label htmlFor="especialidad">Especialidad</label>
          <input id="especialidad" type="text" {...register("especialidad")} />
          {errors.especialidad && (
            <p className="error-message">{errors.especialidad.message}</p>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="telefono">Teléfono</label>
          <input id="telefono" type="text" {...register("telefono")} />
          {errors.telefono && (
            <p className="error-message">{errors.telefono.message}</p>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="codigoProfesional">Código Profesional</label>
          <input
            id="codigoProfesional"
            type="text"
            {...register("codigoProfesional")}
          />
          {errors.codigoProfesional && (
            <p className="error-message">{errors.codigoProfesional.message}</p>
          )}
        </div>
        <button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? "Guardando..." : "Guardar Cambios"}
        </button>
      </form>
    </>
  );
};

export default UpdateProfileForm;
