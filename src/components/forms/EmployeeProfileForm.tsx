import React, { useEffect, useState } from "react";
import { useForm, useController } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { registerEmployee, updateEmployee, getRoles } from "@/services/api";
import type { Employee } from "../EmployeesManager";
import { toast } from "react-toastify";
import RoleSelector from "./RoleSelector";

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
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 w-full">
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 pb-3 border-b-2 border-primary">Información Personal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="nombre" className="text-sm font-medium text-slate-900">Nombre</label>
              <input 
                id="nombre" 
                type="text" 
                {...register("nombre")} 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
              {errors.nombre && (
                <p className="text-xs text-red-600 font-medium">
                  {errors.nombre.message as string}
                </p>
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
                <p className="text-xs text-red-600 font-medium">
                  {errors.apellido.message as string}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="cedula" className="text-sm font-medium text-slate-900">Cédula</label>
              <input
                id="cedula"
                type="text"
                {...register("cedula")}
                disabled={isEditing}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${isEditing ? 'border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed' : 'border-slate-300'}`}
              />
              {errors.cedula && (
                <p className="text-xs text-red-600 font-medium">
                  {errors.cedula.message as string}
                </p>
              )}
            </div>

            {!isEditing && (
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-900">Email</label>
                <input 
                  id="email" 
                  type="email" 
                  {...register("email")} 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
                {errors.email && (
                  <p className="text-xs text-red-600 font-medium">
                    {errors.email.message as string}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 pb-3 border-b-2 border-primary">Información Profesional</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="especialidad" className="text-sm font-medium text-slate-900">Especialidad</label>
              <input
                id="especialidad"
                type="text"
                {...register("especialidad")}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
              {errors.especialidad && (
                <p className="text-xs text-red-600 font-medium">
                  {errors.especialidad.message as string}
                </p>
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
                <p className="text-xs text-red-600 font-medium">
                  {errors.telefono.message as string}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label htmlFor="codigoProfesional" className="text-sm font-medium text-slate-900">
                Código Profesional (Opcional)
              </label>
              <input
                id="codigoProfesional"
                type="text"
                {...register("codigoProfesional")}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>
          </div>
        </div>

        {!isEditing && (
          <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-6 pb-3 border-b-2 border-primary">Asignación de Roles</h3>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-900">Roles</label>
              <RoleSelector
                availableRoles={availableRoles}
                selectedRoles={rolesField.value}
                onChange={rolesField.onChange}
              />
              {errors.roles && (
                <p className="text-xs text-red-600 font-medium">
                  {errors.roles.message as string}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || (isEditing && !isDirty)}
            className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md min-w-[160px]"
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
