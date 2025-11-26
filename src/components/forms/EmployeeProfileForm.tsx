import React, { useEffect, useState } from "react";
import { useForm, useController } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { registerEmployee, updateEmployee, getRoles } from "@/services/api";
import type { Employee } from "../EmployeesManager";
import { toast } from "react-toastify";
import RoleSelector from "./RoleSelector";

import "./UpdateForm.css";

// Esquema extendido para la creación
const createEmployeeSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  apellido: z.string().min(1, "El apellido es requerido"),
  cedula: z
    .string()
    .min(10, "La cédula debe tener 10 dígitos")
    .max(10, "La cédula debe tener 10 dígitos"),
  especialidad: z.string().min(1, "La especialidad es requerida"),
  telefono: z.string().min(10, "El teléfono debe tener 10 dígitos"),
  codigoProfesional: z.string().optional(),
  email: z.string().email("El correo no es válido"),
  roles: z.array(z.string()).min(1, "Debe seleccionar al menos un rol"),
});

// Esquema para actualización (sin email y roles)
const updateProfileSchema = createEmployeeSchema.omit({
  email: true,
  roles: true,
});

interface Role {
  id: string;
  nombre: string;
}

interface Props {
  employee: Employee | null;
  onSave: () => void;
}

const EmployeeProfileForm: React.FC<Props> = ({ employee, onSave }) => {
  const isEditing = employee !== null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<any>({
    resolver: zodResolver(
      isEditing ? updateProfileSchema : createEmployeeSchema
    ),
    defaultValues: { roles: [] },
  });

  const { field: rolesField } = useController({ name: "roles", control });

  useEffect(() => {
    if (!isEditing) {
      const fetchRoles = async () => {
        try {
          const response = await getRoles();
          setAvailableRoles(response.data.data);
        } catch (error) {
          console.error("Error al cargar roles", error);
          toast.error("Error al cargar los roles disponibles");
        }
      };
      fetchRoles();
    }
  }, [isEditing]);

  useEffect(() => {
    if (isEditing && employee) {
      reset(employee);
    } else {
      reset({
        nombre: "",
        apellido: "",
        cedula: "",
        especialidad: "",
        telefono: "",
        codigoProfesional: "",
        email: "",
        roles: [],
      });
    }
  }, [employee, isEditing, reset]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);

    try {
      if (isEditing) {
        const changedData: Partial<any> = {};
        Object.keys(data).forEach((key) => {
          if (data[key] !== employee?.[key as keyof Employee]) {
            changedData[key as keyof Employee] = data[key];
          }
        });

        if (Object.keys(changedData).length === 0) {
          toast.info("No hay cambios para guardar.");
          setIsSubmitting(false);
          return;
        }
        await updateEmployee(employee.id, changedData);
        toast.success("Empleado actualizado con éxito.");
      } else {
        await registerEmployee(data);
        toast.success(
          "Empleado creado con éxito. Se han enviado las credenciales por correo."
        );
      }

      setTimeout(() => onSave(), 1500);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Ocurrió un error.";
      toast.error(errorMsg);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="update-form">
        <div className="form-section">
          <h3 className="form-section-title">Información Personal</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="nombre">Nombre</label>
              <input id="nombre" type="text" {...register("nombre")} />
              {errors.nombre && (
                <p className="error-message">
                  {errors.nombre.message as string}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="apellido">Apellido</label>
              <input id="apellido" type="text" {...register("apellido")} />
              {errors.apellido && (
                <p className="error-message">
                  {errors.apellido.message as string}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="cedula">Cédula</label>
              <input
                id="cedula"
                type="text"
                {...register("cedula")}
                disabled={isEditing}
              />
              {errors.cedula && (
                <p className="error-message">
                  {errors.cedula.message as string}
                </p>
              )}
            </div>

            {!isEditing && (
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" {...register("email")} />
                {errors.email && (
                  <p className="error-message">
                    {errors.email.message as string}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Información Profesional</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="especialidad">Especialidad</label>
              <input
                id="especialidad"
                type="text"
                {...register("especialidad")}
              />
              {errors.especialidad && (
                <p className="error-message">
                  {errors.especialidad.message as string}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="telefono">Teléfono</label>
              <input id="telefono" type="text" {...register("telefono")} />
              {errors.telefono && (
                <p className="error-message">
                  {errors.telefono.message as string}
                </p>
              )}
            </div>

            <div className="form-group full-width">
              <label htmlFor="codigoProfesional">
                Código Profesional (Opcional)
              </label>
              <input
                id="codigoProfesional"
                type="text"
                {...register("codigoProfesional")}
              />
            </div>
          </div>
        </div>

        {!isEditing && (
          <div className="form-section">
            <h3 className="form-section-title">Asignación de Roles</h3>
            <div className="form-group">
              <label>Roles</label>
              <RoleSelector
                availableRoles={availableRoles}
                selectedRoles={rolesField.value}
                onChange={rolesField.onChange}
              />
              {errors.roles && (
                <p className="error-message">
                  {errors.roles.message as string}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            disabled={isSubmitting || (isEditing && !isDirty)}
            className="submit-button"
          >
            {isSubmitting
              ? "Guardando..."
              : isEditing
                ? "Actualizar Empleado"
                : "Crear Empleado"}
          </button>
        </div>
      </form>
    </>
  );
};

export default EmployeeProfileForm;
