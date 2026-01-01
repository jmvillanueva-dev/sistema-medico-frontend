import { z } from "zod";

// Regex patterns
const LETTERS_ONLY_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
const NUMBERS_ONLY_REGEX = /^\d+$/;
const PROFESSIONAL_CODE_REGEX = /^[0-9-]+$/;

export const createEmployeeSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .max(20, "El nombre no puede tener más de 20 caracteres")
    .regex(LETTERS_ONLY_REGEX, "El nombre solo puede contener letras y espacios"),
  apellido: z
    .string()
    .min(1, "El apellido es requerido")
    .max(20, "El apellido no puede tener más de 20 caracteres")
    .regex(LETTERS_ONLY_REGEX, "El apellido solo puede contener letras y espacios"),
  cedula: z
    .string()
    .regex(NUMBERS_ONLY_REGEX, "La cédula solo puede contener números")
    .length(10, "La cédula debe tener exactamente 10 dígitos"),
  especialidad: z
    .string()
    .min(1, "La especialidad es requerida")
    .regex(LETTERS_ONLY_REGEX, "La especialidad solo puede contener letras y espacios"),
  telefono: z
    .string()
    .length(10, "El teléfono debe tener exactamente 10 dígitos")
    .regex(NUMBERS_ONLY_REGEX, "El teléfono solo puede contener números"),
  codigoProfesional: z
    .string()
    .max(20, "El registro profesional no puede tener más de 20 caracteres")
    .regex(PROFESSIONAL_CODE_REGEX, "El registro profesional solo puede contener números y guiones")
    .optional()
    .or(z.literal("")), // Permite string vacío o undefined
  email: z
    .string()
    .email("El correo no es válido")
    .max(100, "El correo no puede tener más de 100 caracteres"),
  roles: z
    .array(z.string())
    .min(1, "Debe seleccionar al menos un rol"),
});

// Update schema omits email (usually read-only or handled separately) but keeps regular fields
// The user requirement implies validations should be same for create/update.
// Usually updates might omit ID/Email if they aren't changeable here, but the requested validations apply to the fields present.
export const updateEmployeeSchema = createEmployeeSchema.omit({
    email: true, // Often email isn't editable in basic profile update or handled via specific endpoint, based on previous code
}).extend({
    roles: z.array(z.string()).min(1, "Debe seleccionar al menos un rol").optional(),
});
