import React, { useEffect, useState } from "react";
import { useForm, useController } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerEmployee, updateEmployee, getRoles } from "@/services/api";
import type { Employee } from "../EmployeesManager";
import { toast } from "react-toastify";
import RoleSelector from "./RoleSelector";
import { useAuthStore } from "@/store/authStore";

import { createEmployeeSchema, updateEmployeeSchema } from "@/lib/validation/employee";

interface Role {
  id: string;
  nombre: string;
}

interface Props {
  employee: Employee | null;
  onSave: () => void;
  onCancel: () => void;
}

const EmployeeProfileForm: React.FC<Props> = ({ employee, onSave, onCancel }) => {
  const isEditing = employee !== null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);

  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.roles?.includes("ADMINISTRADOR");

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
    setValue
  } = useForm<any>({
    resolver: zodResolver(
      isEditing ? updateEmployeeSchema : createEmployeeSchema
    ),
    defaultValues: { roles: [] },
    mode: "onTouched",
  });

  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    if (!user) {
      initializeAuth();
    }
  }, [user, initializeAuth]);

  const { field: rolesField } = useController({ name: "roles", control });

  useEffect(() => {
    // Cargar roles si estamos creando O si estamos editando y somos admin
    if (!isEditing || (isEditing && isAdmin)) {
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
  }, [isEditing, isAdmin]);

  useEffect(() => {
    if (isEditing && employee) {
      const formData = {
        ...employee,
        roles: employee.roles || []
      };
      reset(formData);
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
  }, [employee, isEditing, reset, isAdmin]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);

    try {
      if (isEditing) {
        const changedData: any = {};

        Object.keys(data).forEach((key) => {
          // Ignorar roles en la comparación simple
          if (key === 'roles') return;

          if (data[key] !== employee?.[key as keyof Employee]) {
            changedData[key] = data[key];
          }
        });

        // Lógica específica para roles (solo si es Admin y existen roles)
        if (isAdmin && data.roles) {
          const currentRoles = employee?.roles || [];
          const newRoles = data.roles;

          // Comparar arrays (orden no importa, pero contenido sí)
          const isRolesChanged =
            newRoles.length !== currentRoles.length ||
            !newRoles.every((r: string) => currentRoles.includes(r));

          if (isRolesChanged) {
            changedData.roles = newRoles;
          }
        }

        if (Object.keys(changedData).length === 0) {
          toast.info("No hay cambios para guardar.");
          setIsSubmitting(false);
          return;
        }
        await updateEmployee(employee!.id, changedData);
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
      <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        {/* Info Alert */}
        {!isEditing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-blue-800">Credenciales de Acceso</h4>
              <p className="text-sm text-blue-600 mt-1">
                Al registrar un nuevo empleado, el sistema enviará automáticamente las credenciales de acceso a su correo electrónico.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          {/* Columna Izquierda: Información Personal y Profesional */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            {/* Información Personal */}
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <h3 className="font-semibold text-slate-800">Información Personal</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="nombre" className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Nombre</label>
                  <input
                    id="nombre"
                    type="text"
                    placeholder="Ej. Juan Andrés"
                    {...register("nombre")}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 focus:bg-white"
                  />
                  {errors.nombre && (
                    <p className="text-xs text-red-500 font-medium mt-0.5 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                      {errors.nombre.message as string}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="apellido" className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Apellido</label>
                  <input
                    id="apellido"
                    type="text"
                    placeholder="Ej. Pérez López"
                    {...register("apellido")}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 focus:bg-white"
                  />
                  {errors.apellido && (
                    <p className="text-xs text-red-500 font-medium mt-0.5 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                      {errors.apellido.message as string}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="cedula" className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Cédula</label>
                  <input
                    id="cedula"
                    type="text"
                    placeholder="Ej. 1712345678"
                    {...register("cedula")}
                    disabled={isEditing}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${ isEditing ? 'border-dashed border-slate-300 bg-slate-100 text-slate-500 cursor-not-allowed' : 'border-slate-300 bg-slate-50 focus:bg-white' }`}
                  />
                  {errors.cedula && (
                    <p className="text-xs text-red-500 font-medium mt-0.5 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                      {errors.cedula.message as string}
                    </p>
                  )}
                </div>

                {!isEditing && (
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Email</label>
                    <input
                      id="email"
                      type="text"
                      placeholder="nombre@ejemplo.com"
                      {...register("email")}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 focus:bg-white"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 font-medium mt-0.5 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        {errors.email.message as string}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Información Profesional (Ahora debajo de Personal) */}
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                <h3 className="font-semibold text-slate-800">Datos Profesionales</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="especialidad" className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Especialidad</label>
                  <input
                    id="especialidad"
                    type="text"
                    placeholder="Ej. Cardiología"
                    {...register("especialidad")}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 focus:bg-white"
                  />
                  {errors.especialidad && (
                    <p className="text-xs text-red-500 font-medium mt-0.5 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                      {errors.especialidad.message as string}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="telefono" className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Teléfono</label>
                  <input
                    id="telefono"
                    type="text"
                    placeholder="Ej. 0991234567"
                    {...register("telefono")}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 focus:bg-white"
                  />
                  {errors.telefono && (
                    <p className="text-xs text-red-500 font-medium mt-0.5 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                      {errors.telefono.message as string}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label htmlFor="codigoProfesional" className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    Registro Profesional <span className="text-slate-400 font-normal normal-case">(Opcional)</span>
                  </label>
                  <input
                    id="codigoProfesional"
                    type="text"
                    placeholder="Ej. 1111-2222-3333-4444"
                    {...register("codigoProfesional")}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Roles y Permisos */}
          <div className="col-span-12 lg:col-span-5 space-y-6">
            {(!isEditing || isAdmin) && (
              <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200 h-full">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  <h3 className="font-semibold text-slate-700">Roles y Permisos</h3>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-slate-500 mb-2">
                    Seleccione los roles que tendrá este empleado en el sistema.
                  </p>
                  <RoleSelector
                    availableRoles={availableRoles}
                    selectedRoles={rolesField.value}
                    onChange={rolesField.onChange}
                  />
                  {errors.roles && (
                    <p className="text-xs text-red-500 font-medium mt-0.5 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                      {errors.roles.message as string}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Si NO es admin y es edición, no mostramos nada sobre roles */}
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            className="px-5 py-2.5 text-slate-600 bg-white border border-slate-300 font-medium rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
            onClick={() => {
              onCancel();
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || (isEditing && !isDirty)}
            className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/30 flex items-center gap-2"
          >
            {isSubmitting && (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
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
