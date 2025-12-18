export interface SignosVitales {
  presionArterialSistolica?: number;
  presionArterialDiastolica?: number;
  frecuenciaCardiaca?: number;
  frecuenciaRespiratoria?: number;
  temperatura?: number;
  saturacionOxigeno?: number;
  peso?: number;
  talla?: number;
  glucosa?: number;
  imc?: number; // Calculated in backend usually, but good to have
}

export interface MotivoAtencion {
  motivoConsulta: string;
  enfermedadActual?: string;
}

export interface AntecedentesIncidente {
  antecedentesPersonales?: string;
  antecedentesFamiliares?: string;
  habitosToxicos?: string;
  alergias?: string;
  medicamentosActuales?: string;
}

export interface ValoracionClinica {
  inspeccionGeneral?: string;
  cabezaCuello?: string;
  torax?: string;
  abdomen?: string;
  extremidades?: string;
  neurologico?: string;
  pielTegumentos?: string;
  otrosHallazgos?: string;
}

export interface Diagnostico {
  id?: string; // Optional for new items
  codigoCie?: string;
  diagnostico: string;
  tipo: 'PRESUNTIVO' | 'DEFINITIVO';
  observaciones?: string;
}

export interface IndicacionMedica {
  medicamento: string;
  dosis: string;
  frecuencia: string;
  viaAdministracion: string;
  duracion: string;
  indicacionesEspeciales?: string;
}

export interface PlanTratamiento {
  id?: string;
  nombreTratamiento: string;
  descripcion?: string;
  tipoTratamiento?: string; // e.g., 'MEDICAMENTOSO'
  duracion?: string;
  indicacionesMedicas?: IndicacionMedica[];
}

export interface ExamenSolicitado {
  id?: string;
  tipoExamen?: string; // e.g., 'LABORATORIO', 'IMAGENOLOGIA'
  nombreExamen: string;
  urgencia?: 'RUTINA' | 'URGENTE'; // Fixed from 'URGENCIA' to match API
  indicaciones?: string;
  estado?: string; // e.g., 'SOLICITADO'
}

export interface LocalizacionLesion {
  id?: string;
  localizacion: string;
  tipoLesion?: string;
  gravedad?: 'LEVE' | 'MODERADA' | 'GRAVE';
}

export interface EmergenciaObstetrica {
  gestasPrevias?: number;
  partosPrevios?: number;
  abortosPrevios?: number; // Added from API response
  semanasGestacion?: number;
  fum?: string; // YYYY-MM-DD
  fpp?: string; // YYYY-MM-DD
  presentacion?: string; // e.g., 'CEFALICA' - Added from API response
  dinamicaUterina?: string; // Added from API response
  latidosFetales?: string;
  observaciones?: string; // Added from API response
}

export interface AltaMedica {
  tipoAlta?: string; // e.g., 'DOMICILIO'
  condicionAlta?: string;
  recomendaciones?: string;
  controlProgramado?: string; // YYYY-MM-DD
  especialidadControl?: string;
}

export interface EvolucionMedica {
  id: string;
  historiaClinicaId: string;
  numeroHistoriaClinica?: string; // Added from API response
  empleadoId: string;
  empleadoNombreCompleto?: string; // Added from API response
  empleadoEspecialidad?: string; // Added from API response
  tipoConsulta: string;
  fechaConsulta: string; // ISO 8601
  estado?: string; // Added from API response (e.g., 'ACTIVA')
  observacionesGenerales?: string;
  fechaCreacion?: string; // Added from API response
  fechaActualizacion?: string; // Added from API response
  
  motivoAtencion?: MotivoAtencion;
  signosVitales?: SignosVitales;
  antecedentesIncidente?: AntecedentesIncidente;
  valoracionClinica?: ValoracionClinica;
  diagnosticos?: Diagnostico[];
  planesTratamiento?: PlanTratamiento[];
  examenesSolicitados?: ExamenSolicitado[];
  localizacionLesiones?: LocalizacionLesion[];
  emergenciaObstetrica?: EmergenciaObstetrica;
  altaMedica?: AltaMedica;
}

export interface EvolucionMedicaRequest extends Omit<EvolucionMedica, 'id' | 'fechaConsulta'> {
  fechaConsulta?: string; // Optional in request, defaults to now in backend
}

export interface EvolucionMedicaUpdateRequest extends Partial<EvolucionMedicaRequest> {}

export interface EvolucionMedicaResumen {
  id: string;
  historiaClinicaId: string;
  numeroHistoriaClinica: string;
  empleadoId: string;
  empleadoNombreCompleto: string;
  fechaConsulta: string;
  tipoConsulta: string;
  estado: string;
  fechaCreacion?: string;
  // Section completion indicators
  tieneMotivoAtencion: boolean;
  tieneSignosVitales: boolean;
  tieneAntecedentesIncidente: boolean;
  tieneValoracionClinica: boolean;
  tieneDiagnosticos: boolean;
  tienePlanesTratamiento: boolean;
  tieneExamenesSolicitados: boolean;
  tieneLocalizacionLesiones: boolean;
  tieneEmergenciaObstetrica: boolean; // Optional section, not required
  tieneAltaMedica: boolean;
}

export interface EvolucionMedicaFilter {
  historiaClinicaId?: string;
  empleadoId?: string;
  fechaInicio?: string;
  fechaFin?: string;
  estado?: string;
}

/**
 * Interface for daily report of medical evolutions
 * Lightweight version with essential information only
 */
export interface EvolucionReporteDiario {
  evolucionId: string;
  fechaConsulta: string; // ISO 8601 Instant
  historiaClinicaId: string;
  numeroHistoriaClinica: string;
  pacienteId: string;
  pacienteNombreCompleto: string;
  empleadoNombreCompleto: string;
}
