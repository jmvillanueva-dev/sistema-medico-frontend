import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema } from "@/lib/validation/profile";
import type { UpdateProfileFormData } from "@/lib/validation/profile";
import { createEmployee, updateEmployee } from "@/services/api";
import type { Employee } from "../EmployeesManager";
import NotificationToast from "@/components/common/NotificationToast.tsx";

import "./UpdateForm.css";

interface Props {
  employee: Employee | null;
  onSave: () => void;
}

const EmployeeProfileForm: React.FC<Props> = ({ employee, onSave }) => {
  const isEditing = employee !== null;
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
  });

  useEffect(() => {
    if (isEditing) {
      reset({
        nombre: employee.nombre || "",
        apellido: employee.apellido || "",
        cedula: employee.cedula || "",
        especialidad: employee.especialidad || "",
        telefono: employee.telefono || "",
        codigoProfesional: employee.codigoProfesional || "",
      });
    } else {
      reset({
        nombre: "",
        apellido: "",
        cedula: "",
        especialidad: "",
        telefono: "",
        codigoProfesional: "",
      });
    }
  }, [employee, isEditing, reset]);

  const onSubmit = async (data: UpdateProfileFormData) => {
    setIsSubmitting(true);
    setNotification(null);

    try {
      if (isEditing) {
        // Lógica de Actualización
        const changedData: Partial<UpdateProfileFormData> = {};
        (Object.keys(data) as Array<keyof UpdateProfileFormData>).forEach((key) => {
          if (data[key] !== employee[key]) {
            changedData[key] = data[key];
          }
        });

        if (Object.keys(changedData).length === 0) {
          setNotification({ message: "No hay cambios para guardar.", type: "error" });
          setIsSubmitting(false);
          return;
        }
        await updateEmployee(employee.id, changedData);
        setNotification({ message: "Empleado actualizado con éxito.", type: "success" });
      } else {
        // Lógica de Creación
        // Aquí deberías incluir también campos como email y password si son necesarios para la creación
        await createEmployee(data);
        setNotification({ message: "Empleado creado con éxito.", type: "success" });
      }

      // Espera un momento para que el usuario vea la notificación y luego llama a onSave
      setTimeout(() => {
        onSave();
      }, 1000);

    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Ocurrió un error.";
      setNotification({ message: errorMsg, type: "error" });
    } finally {
      if (!isEditing) {
         // Solo si no estamos editando, para que el usuario vea el mensaje de éxito
      } else {
        setIsSubmitting(false);
      }
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
        {/* Campos del formulario */}
        <div className="form-group">
          <label htmlFor="nombre">Nombre</label>
          <input id="nombre" type="text" {...register("nombre")} />
          {errors.nombre && <p className="error-message">{errors.nombre.message}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="apellido">Apellido</label>
          <input id="apellido" type="text" {...register("apellido")} />
          {errors.apellido && <p className="error-message">{errors.apellido.message}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="cedula">Cédula</label>
          <input id="cedula" type="text" defaultValue={employee?.cedula}  {...register("cedula")} />
          {errors.cedula && <p className="error-message">{errors.cedula.message}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="especialidad">Especialidad</label>
          <input id="especialidad" type="text" {...register("especialidad")} />
          {errors.especialidad && <p className="error-message">{errors.especialidad.message}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="telefono">Teléfono</label>
          <input id="telefono" type="text" {...register("telefono")} />
          {errors.telefono && <p className="error-message">{errors.telefono.message}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="codigoProfesional">Código Profesional</label>
          <input id="codigoProfesional" type="text" {...register("codigoProfesional")} />
          {errors.codigoProfesional && <p className="error-message">{errors.codigoProfesional.message}</p>}
        </div>
        
        {/* En modo creación, podríamos necesitar campos de email/contraseña */}
        {!isEditing && (
            <p className="form-note">La contraseña y el email se gestionarán en los siguientes pasos.</p>
        )}

        <button type="submit" disabled={isSubmitting || (isEditing && !isDirty)}>
          {isSubmitting ? "Guardando..." : "Guardar Cambios"}
        </button>
      </form>
    </>
  );
};

export default EmployeeProfileForm;
