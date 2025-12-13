import * as z from "zod";

/**
 * Esquema de validación para actualizar datos del perfil.
 * Todos los campos editables son requeridos para prevenir datos vacíos.
 */
export const updateProfileSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, { message: "El nombre es requerido" })
    .regex(/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/, {
      message: "El nombre solo puede contener letras y espacios",
    }),

  apellido: z
    .string()
    .trim()
    .min(1, { message: "El apellido es requerido" })
    .regex(/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/, {
      message: "El apellido solo puede contener letras y espacios",
    }),

  cedula: z
    .string()
    .trim()
    .regex(/^\d+$/, { message: "La cédula solo puede contener números" })
    .optional()
    .or(z.literal("").transform(() => undefined)),

  especialidad: z
    .string()
    .trim()
    .min(1, { message: "La especialidad es requerida" })
    .regex(/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/, {
      message: "La especialidad solo puede contener letras y espacios",
    }),

  telefono: z
    .string()
    .trim()
    .min(1, { message: "El teléfono es requerido" })
    .regex(/^\d+$/, { message: "El teléfono solo puede contener números" })
    .min(7, { message: "El teléfono debe tener al menos 7 dígitos" })
    .max(15, { message: "El teléfono no puede tener más de 15 dígitos" }),

  codigoProfesional: z
    .string()
    .trim()
    .min(1, { message: "El código profesional es requerido" })
    .regex(/^[a-zA-Z0-9\s]+$/, {
      message: "El código profesional solo puede contener letras, números y espacios",
    }),
});
type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

/**
 * Esquema de validación para actualizar el email.
 */
export const updateEmailSchema = z.object({
  nuevoEmail: z
    .string()
    .email({ message: "Formato de correo electrónico inválido." })
    .min(1, { message: "El correo electrónico es requerido." }),
});

type UpdateEmailFormData = z.infer<typeof updateEmailSchema>;

/**
 * Esquema de validación para actualizar la contraseña.
 */
export const updatePasswordSchema = z.object({
    contrasenaActual: z
      .string()
      .min(6, { message: "La contraseña actual debe tener al menos 6 caracteres." })
      .min(1, { message: "La contraseña actual es requerida." }),
    nuevaContrasena: z
      .string()
      .min(6, { message: "La nueva contraseña debe tener al menos 6 caracteres." })
      .min(1, { message: "La nueva contraseña es requerida." }),
  })
  .refine((data) => data.contrasenaActual !== data.nuevaContrasena, {
    message: "La nueva contraseña no puede ser igual a la contraseña actual.",
    path: ["nuevaContrasena"], // El error se mostrará en el campo de la nueva contraseña
  });

type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

export type { UpdateProfileFormData, UpdateEmailFormData, UpdatePasswordFormData };
