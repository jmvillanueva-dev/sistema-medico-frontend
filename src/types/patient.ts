export interface CatalogItem {
  id: string;
  catalogoId: string;
  catalogoNombre: string;
  nombre: string;
  descripcion: string | null;
  codigo: string | null;
  valor: string | null;
  estaActivo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string | null;
}

export interface EmergencyContact {
  id?: string;
  pacienteId?: string;
  nombre: string;
  parentescoId: string;
  parentescoNombre?: string;
  telefono: string;
  direccion: string;
}

export interface ClinicalHistory {
  id?: string;
  pacienteId?: string;
  tipoAntecedenteId: string;
  tipoAntecedenteNombre?: string;
  patologiaId: string;
  patologiaNombre?: string;
  descripcion: string;
  fechaDiagnostico: string;
  tratamiento: string;
  estaActivo: boolean;
  fechaCreacion?: string;
}

export interface Occupation {
  id?: string;
  ocupacion: CatalogItem; // Nested object in response
  ocupacionId?: string; // For request
  nombreEmpresa: string;
  cargo: string;
  telefonoEmpresa: string;
  direccionEmpresa: string;
  fechaInicio: string;
  fechaFin: string | null;
  actual: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface InformationSource {
  id?: string;
  fuenteInformacion: CatalogItem; // Nested in response
  fuenteInformacionId?: string; // For request
  nombreFuenteInfo: string;
  telefono: string;
  observaciones: string;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface Patient {
  id: string;
  cedula: string;
  primerNombre: string;
  segundoNombre: string | null;
  apellidoPaterno: string;
  apellidoMaterno: string | null;
  email: string | null;
  telefono: string | null;
  grupoSanguineo: CatalogItem;
  fechaNacimiento: string;
  lugarNacimiento: string;
  genero: CatalogItem;
  nacionalidad: string;
  grupoCultural: CatalogItem;
  estadoCivil: CatalogItem;
  nivelInstruccion: CatalogItem;
  direccion: string;
  provincia: CatalogItem;
  canton: string;
  parroquia: string;
  ocupacion: Occupation | null;
  fuenteInformacion: InformationSource | null;
  contactosEmergencia: EmergencyContact[];
  antecedentesClinicos: ClinicalHistory[];
  fechaCreacion: string;
  fechaActualizacion: string | null;
  estaActivo: boolean;
}

export interface PatientRequest {
  cedula: string;
  primerNombre: string;
  segundoNombre?: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  email?: string;
  telefono?: string;
  grupoSanguineoId: string;
  fechaNacimiento: string;
  lugarNacimiento: string;
  generoId: string;
  nacionalidad: string;
  grupoCulturalId: string;
  estadoCivilId: string;
  nivelInstruccionId: string;
  direccion: string;
  provinciaId: string;
  canton: string;
  parroquia: string;
  
  // Occupation
  ocupacionId?: string;
  nombreEmpresa?: string;
  cargo?: string;
  telefonoEmpresa?: string;
  direccionEmpresa?: string;
  fechaInicio?: string;
  fechaFin?: string;
  actual?: boolean;

  // Information Source
  fuenteInformacionId?: string;
  nombreFuenteInfo?: string;
  telefonoFuenteInfo?: string;
  observacionesFuente?: string;

  contactosEmergencia: EmergencyContact[];
  antecedentesClinicos: ClinicalHistory[];
}
