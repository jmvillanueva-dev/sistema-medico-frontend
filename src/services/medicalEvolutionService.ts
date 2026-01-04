import api from "./api";
import type { ApiResponse } from "../types/api";
import type {
  EvolucionMedica,
  EvolucionMedicaRequest,
  EvolucionMedicaUpdateRequest,
  EvolucionMedicaResumen,
  EvolucionMedicaFilter,
  EvolucionReporteDiario,
  Diagnostico,
  PlanTratamiento,
  SignosVitales
} from "../types/medicalEvolution";

const BASE_URL = "/evoluciones-medicas";

export const createEvolucion = (data: EvolucionMedicaRequest) => {
  return api.post<ApiResponse<EvolucionMedica>>(BASE_URL, data);
};

export const getEvolucionById = (id: string) => {
  return api.get<ApiResponse<EvolucionMedica>>(`${BASE_URL}/${id}`);
};

export const getEvolucionesByHistoriaClinica = (historiaClinicaId: string) => {
  return api.get<ApiResponse<EvolucionMedicaResumen[]>>(`${BASE_URL}/historia-clinica/${historiaClinicaId}`);
};

export const getEvolucionesByEmpleado = (empleadoId: string) => {
  return api.get<ApiResponse<EvolucionMedicaResumen[]>>(`${BASE_URL}/empleado/${empleadoId}`);
};

export const getEvolucionesByFilter = (filters: EvolucionMedicaFilter) => {
  const params = new URLSearchParams();
  if (filters.historiaClinicaId) params.append("historiaClinicaId", filters.historiaClinicaId);
  if (filters.empleadoId) params.append("empleadoId", filters.empleadoId);
  if (filters.fechaInicio) params.append("fechaInicio", filters.fechaInicio);
  if (filters.fechaFin) params.append("fechaFin", filters.fechaFin);
  if (filters.estado) params.append("estado", filters.estado);

  return api.get<ApiResponse<EvolucionMedicaResumen[]>>(`${BASE_URL}/filtros?${params.toString()}`);
};

export const updateEvolucion = (id: string, data: EvolucionMedicaUpdateRequest) => {
  return api.put<ApiResponse<EvolucionMedica>>(`${BASE_URL}/${id}`, data);
};

// Sub-resources

// Diagnosticos
export const addDiagnostico = (evolucionId: string, diagnostico: Diagnostico) => {
  return api.post<ApiResponse<Diagnostico>>(`${BASE_URL}/${evolucionId}/diagnosticos`, diagnostico);
};

export const deleteDiagnostico = (evolucionId: string, diagnosticoId: string) => {
  return api.delete<ApiResponse<void>>(`${BASE_URL}/${evolucionId}/diagnosticos/${diagnosticoId}`);
};

// Planes de Tratamiento
export const getPlanesTratamiento = (evolucionId: string) => {
  return api.get<ApiResponse<PlanTratamiento[]>>(`${BASE_URL}/${evolucionId}/planes-tratamiento`);
};

export const deletePlanTratamiento = (evolucionId: string, planId: string) => {
  return api.delete<ApiResponse<void>>(`${BASE_URL}/${evolucionId}/planes-tratamiento/${planId}`);
};

// Signos Vitales
export const getSignosVitales = (evolucionId: string) => {
  return api.get<ApiResponse<SignosVitales>>(`${BASE_URL}/${evolucionId}/signos-vitales`);
};

export const updateSignosVitales = (evolucionId: string, signos: SignosVitales) => {
  return api.put<ApiResponse<SignosVitales>>(`${BASE_URL}/${evolucionId}/signos-vitales`, signos);
};

// Daily Report
/**
 * Get daily report of medical evolutions
 * @param fecha - Optional date in format YYYY-MM-DD. If not provided, uses current date
 * @returns Promise with list of evolution summaries for the specified date
 */
export const getDailyReport = (fecha?: string) => {
  const params = fecha ? `?fecha=${fecha}` : '';
  return api.get<ApiResponse<EvolucionReporteDiario[]>>(`${BASE_URL}/reporte-diario${params}`);
};

// Delete Evolution (Admin only)
export const deleteEvolucion = (id: string) => {
  return api.delete<ApiResponse<void>>(`${BASE_URL}/${id}`);
};
