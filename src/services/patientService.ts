import api from "./api";
import type { Patient, PatientRequest } from "../types/patient";
import type { ApiResponse } from "../types/api";

export const getPatients = (page: number = 0, size: number = 10) => {
  return api.get<ApiResponse<Patient[]>>(`/pacientes?page=${page}&size=${size}`);
};

export const getPatientById = (id: string) => {
  return api.get<ApiResponse<Patient>>(`/pacientes/${id}`);
};

export const getPatientByCedula = (cedula: string) => {
  return api.get<ApiResponse<Patient>>(`/pacientes/cedula/${cedula}`);
};

export const createPatient = (data: PatientRequest) => {
  return api.post<ApiResponse<Patient>>("/pacientes", data);
};

export const updatePatient = (id: string, data: PatientRequest) => {
  return api.put<ApiResponse<Patient>>(`/pacientes/${id}`, data);
};

export const deletePatient = (id: string) => {
  return api.delete<ApiResponse<void>>(`/pacientes/${id}`);
};

export const searchPatients = (term: string) => {
  return api.get<ApiResponse<Patient[]>>(`/pacientes/buscar?search=${term}`);
};
