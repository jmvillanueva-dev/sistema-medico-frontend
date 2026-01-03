import { z } from "zod";

// Helper regex patterns
const lettersOnlyRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
const cedulaRegex = /^\d{10}$/;
const phoneRegex = /^\d{10}(\s*\/\s*\d{10})*$/;

// Helper to check if a date string is not in the future
const isNotFuture = (dateStr: string) => {
  if (!dateStr) return true;
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date <= today;
};

// Helper to check if a date is not older than 120 years
const isNotTooOld = (dateStr: string) => {
  if (!dateStr) return true;
  const date = new Date(dateStr);
  const today = new Date();
  const minDate = new Date();
  minDate.setFullYear(today.getFullYear() - 120);
  return date >= minDate;
};

export const patientSchema = z.object({
  // Datos Personales
  cedula: z
    .string()
    .regex(cedulaRegex, "La cédula debe tener exactamente 10 dígitos"),
  primerNombre: z
    .string()
    .min(1, "El primer nombre es obligatorio")
    .max(20, "El primer nombre no puede exceder los 20 caracteres")
    .regex(lettersOnlyRegex, "El primer nombre de solo debe contener letras"),
  segundoNombre: z
    .string()
    .max(20, "El segundo nombre no puede exceder los 20 caracteres")
    .regex(lettersOnlyRegex, "El segundo nombre solo debe contener letras")
    .optional()
    .or(z.literal("")),
  apellidoPaterno: z
    .string()
    .min(1, "El apellido paterno es obligatorio")
    .max(20, "El apellido paterno no puede exceder los 20 caracteres")
    .regex(lettersOnlyRegex, "El apellido paterno solo debe contener letras"),
  apellidoMaterno: z
    .string()
    .max(20, "El apellido materno no puede exceder los 20 caracteres")
    .regex(lettersOnlyRegex, "El apellido materno solo debe contener letras")
    .optional()
    .or(z.literal("")),
  fechaNacimiento: z
    .string()
    .min(1, "La fecha de nacimiento es obligatoria")
    .refine(isNotFuture, "La fecha de nacimiento no puede ser futura")
    .refine(
      isNotTooOld,
      "La fecha de nacimiento no puede ser mayor a 120 años"
    ),
  lugarNacimiento: z
    .string()
    .max(20, "El lugar de nacimiento no puede exceder los 20 caracteres")
    .regex(lettersOnlyRegex, "El lugar de nacimiento solo debe contener letras")
    .optional()
    .or(z.literal("")),
  generoId: z.string().min(1, "El género es obligatorio"),
  nacionalidad: z.string().optional(),
  grupoSanguineoId: z.string().optional(),
  grupoCulturalId: z.string().optional(),
  estadoCivilId: z.string().optional(),
  nivelInstruccionId: z.string().optional(),

  // Contacto y Ubicación
  email: z
    .string()
    .email("El formato del correo electrónico no es válido")
    .optional()
    .or(z.literal("")),
  telefono: z
    .string()
    .max(50, "El teléfono no puede exceder los 50 caracteres")
    .regex(
      phoneRegex,
      "El teléfono debe contener números de 10 dígitos separados por ' / '"
    )
    .optional()
    .or(z.literal("")),
  direccion: z.string().optional(),
  provinciaId: z.string().optional(),
  canton: z.string().optional(),
  parroquia: z.string().optional(),
  fuenteInformacionId: z.string().optional(),
  nombreFuenteInfo: z.string().optional(),
  telefonoFuenteInfo: z.string().optional(),
  observacionesFuente: z.string().optional(),

  // Ocupación
  ocupacionId: z.string().optional(),
  nombreEmpresa: z.string().optional(),
  cargo: z.string().optional(),
  telefonoEmpresa: z.string().optional(),
  direccionEmpresa: z.string().optional(),
  fechaInicio: z
    .string()
    .refine(isNotFuture, "La fecha de inicio no puede ser futura")
    .optional()
    .or(z.literal("")),
  fechaFin: z
    .string()
    .refine(isNotFuture, "La fecha fin no puede ser futura")
    .optional()
    .or(z.literal("")),
  actual: z.boolean().optional(),

  // Arrays
  contactosEmergencia: z.array(z.lazy(() => emergencyContactSchema)).optional(),
  antecedentesClinicos: z.array(z.lazy(() => clinicalHistorySchema)).optional(),
});

export const emergencyContactSchema = z.object({
  nombre: z.string().min(1, "El nombre del contacto es obligatorio"),
  parentescoId: z.string().min(1, "El parentesco es obligatorio"),
  telefono: z.string().min(1, "El teléfono es obligatorio"),
  direccion: z.string().optional(),
});

export const clinicalHistorySchema = z.object({
  tipoAntecedenteId: z.string().min(1, "El tipo de antecedente es obligatorio"),
  patologiaId: z.string().min(1, "La patología es obligatoria"),
  descripcion: z.string().optional(),
  fechaDiagnostico: z
    .string()
    .refine(isNotFuture, "La fecha de diagnóstico no puede ser futura")
    .optional()
    .or(z.literal("")),
  tratamiento: z.string().optional(),
  estaActivo: z.boolean().optional(),
});

export type PatientSchema = z.infer<typeof patientSchema>;
