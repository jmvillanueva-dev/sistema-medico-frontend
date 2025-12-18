import api from "./api";
import type { ClinicalRecord, ClinicalRecordRequest, FullClinicalRecordResponse } from "../types/clinicalRecord";
import type { ApiResponse } from "../types/api";

export const getClinicalRecords = (page: number = 0, size: number = 10) => {
  return api.get<ApiResponse<ClinicalRecord[]>>(`/historias-clinicas?page=${page}&size=${size}`);
};

export const getClinicalRecordById = (id: string) => {
  return api.get<ApiResponse<ClinicalRecord>>(`/historias-clinicas/${id}`);
};

export const getClinicalRecordByPatientId = (patientId: string) => {
  return api.get<ApiResponse<ClinicalRecord>>(`/historias-clinicas/paciente/${patientId}`);
};

export const getClinicalRecordByNumber = (numeroHistoriaClinica: string) => {
  return api.get<ApiResponse<ClinicalRecord>>(`/historias-clinicas/numero/${numeroHistoriaClinica}`);
};

export const createClinicalRecord = (data: ClinicalRecordRequest) => {
  return api.post<ApiResponse<ClinicalRecord>>("/historias-clinicas", data);
};

// Note: The backend requirements didn't explicitly mention a general update endpoint for Clinical Records metadata, 
// but usually there is one or we might need to add it later. 
// Based on the prompt, we can "editarla" (edit it). 
// Assuming a standard PUT endpoint exists or will exist.
export const updateClinicalRecord = (id: string, data: Partial<ClinicalRecordRequest>) => {
  return api.put<ApiResponse<ClinicalRecord>>(`/historias-clinicas/${id}`, data);
};

export const deleteClinicalRecord = (id: string) => {
  return api.delete<ApiResponse<void>>(`/historias-clinicas/${id}`);
};

export const searchClinicalRecordsByDate = (fechaInicio: string, fechaFin: string) => {
  return api.get<ApiResponse<ClinicalRecord[]>>(`/historias-clinicas/buscar-por-fecha?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
};

/**
 * Get complete clinical record information for a specific evolution
 * Returns aggregated data including patient, clinical record, and evolution details
 */
export const getFullClinicalRecordByEvolutionId = (evolutionId: string) => {
  return api.get<ApiResponse<FullClinicalRecordResponse>>(`/historias-clinicas/evolucion/${evolutionId}/completa`);
};
