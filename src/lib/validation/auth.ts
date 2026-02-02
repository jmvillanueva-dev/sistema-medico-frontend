import * as z from "zod";

/**
 * Regex para validación de contraseña segura.
 * Requiere: mínimo 8 caracteres, una minúscula, una mayúscula,
 * un número y un carácter especial (@$!%*?&#+_-)
 */
const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#+_\-])[A-Za-z\d@$!%*?&#+_\-]{8,}$/;

/**
 * Mensaje de error para contraseña que no cumple requisitos de seguridad.
 */
const strongPasswordMessage =
  "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&#+_-)";

/**
 * Esquema de validación para el formulario de inicio de sesión (Login).
 * Define las reglas para email y password.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "Formato de correo electrónico inválido." })
    .min(1, { message: "El correo electrónico es requerido." }),

  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres." })
    .min(1, { message: "La contraseña es requerida." }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Esquema de validación para el formulario de recuperación de contraseña.
 * Valida que el email tenga formato correcto y no esté vacío.
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "El correo electrónico es requerido." })
    .email({ message: "Formato de correo electrónico inválido." }),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Esquema de validación para el formulario de restablecimiento de contraseña.
 * Valida que ambas contraseñas cumplan los requisitos y coincidan.
 */
export const resetPasswordSchema = z
  .object({
    nuevaPassword: z
      .string()
      .min(1, { message: "La contraseña es requerida." })
      .min(8, { message: "La contraseña debe tener al menos 8 caracteres." }),
    confirmarPassword: z
      .string()
      .min(1, { message: "Debes confirmar la contraseña." }),
  })
  .refine((data) => data.nuevaPassword === data.confirmarPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmarPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * Esquema de validación para el cambio obligatorio de contraseña.
 * Requiere contraseña actual, nueva contraseña con requisitos de seguridad
 * y confirmación de la nueva contraseña.
 */
export const forcePasswordChangeSchema = z
  .object({
    contrasenaActual: z
      .string()
      .min(1, { message: "La contraseña actual es requerida." }),
    nuevaContrasena: z
      .string()
      .min(1, { message: "La nueva contraseña es requerida." })
      .regex(strongPasswordRegex, { message: strongPasswordMessage }),
    confirmarContrasena: z
      .string()
      .min(1, { message: "Debes confirmar la nueva contraseña." }),
  })
  .refine((data) => data.nuevaContrasena === data.confirmarContrasena, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmarContrasena"],
  })
  .refine((data) => data.contrasenaActual !== data.nuevaContrasena, {
    message: "La nueva contraseña debe ser diferente a la actual.",
    path: ["nuevaContrasena"],
  });

export type ForcePasswordChangeFormData = z.infer<
  typeof forcePasswordChangeSchema
>;
