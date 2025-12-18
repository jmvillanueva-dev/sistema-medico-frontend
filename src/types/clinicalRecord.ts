import type { Patient } from "./patient";
import type { EvolucionMedica } from "./medicalEvolution";

export interface ClinicalRecord {
  id: string;
  pacienteId: string;
  pacienteCedula: string;
  pacienteNombreCompleto: string;
  numeroHistoriaClinica: string;
  institucionSistema: string | null;
  unidadOperativa: string | null;
  codUnidad: string | null;
  fechaCreacion: string;
  fechaActualizacion: string | null;
  totalEvoluciones: number;
  // Optional: We might still want to attach the full patient object if we fetch it separately, 
  // but the backend response is flat.
  paciente?: Patient; 
}

export interface ClinicalRecordRequest {
  pacienteId: string;
  institucionSistema?: string;
  unidadOperativa?: string;
  codUnidad?: string;
}

/**
 * Aggregated response from the complete clinical record endpoint
 * Includes patient data, clinical record metadata, and evolution details
 */
export interface FullClinicalRecordResponse {
  paciente: Patient;
  historiaClinica: ClinicalRecord;
  evolucion: EvolucionMedica;
}
