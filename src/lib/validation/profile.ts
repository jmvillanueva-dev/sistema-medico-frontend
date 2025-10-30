import * as z from "zod";

/**
 * Esquema de validación para actualizar datos del perfil.
 * Los campos son opcionales, ya que el usuario puede querer actualizar solo uno.
 */
export const updateProfileSchema = z.object({
  nombre: z
    .string()
    .trim()
    .regex(/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/, {
      message: "El nombre solo puede contener letras y espacios",
    })
    .optional()
    .or(z.literal("").transform(() => undefined)),

  apellido: z
    .string()
    .trim()
    .regex(/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/, {
      message: "El apellido solo puede contener letras y espacios",
    })
    .optional()
    .or(z.literal("").transform(() => undefined)),

  cedula: z
    .string()
    .trim()
    .regex(/^\d+$/, { message: "La cédula solo puede contener números" })
    .optional()
    .or(z.literal("").transform(() => undefined)),

  especialidad: z
    .string()
    .trim()
    .regex(/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/, {
      message: "La especialidad solo puede contener letras y espacios",
    })
    .optional()
    .or(z.literal("").transform(() => undefined)),

  telefono: z
    .string()
    .trim()
    .regex(/^\d+$/, { message: "El teléfono solo puede contener números" })
    .optional()
    .or(z.literal("").transform(() => undefined)),

  codigoProfesional: z
    .string()
    .trim()
    .regex(/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/, {
      message: "El código profesional solo puede contener letras y espacios",
    })
    .optional()
    .or(z.literal("").transform(() => undefined)),
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
