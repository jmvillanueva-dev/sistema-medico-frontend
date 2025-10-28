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
