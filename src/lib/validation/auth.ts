import * as z from "zod";

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
