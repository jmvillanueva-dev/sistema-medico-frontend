import React, { useState, useEffect } from "react";
import Modal from "./common/Modal";
import { Button } from "./common/Button";
import { Input } from "./common/Input";
import { createPatient, updatePatient } from "../services/patientService";
import { useCatalogStore } from "../store/catalogStore";
import type {
  Patient,
  PatientRequest,
  EmergencyContact,
  ClinicalHistory,
} from "../types/patient";
import type { CatalogItem } from "../types/catalog";
import { toast } from "react-toastify";
import {
  patientSchema,
  emergencyContactSchema,
  clinicalHistorySchema,
} from "../lib/validations/patient";
import ConfirmationModal from "./ConfirmationModal";

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  patient: Patient | null;
}

type Tab = "personal" | "contact" | "occupation" | "emergency" | "clinical";

export default function PatientFormModal({
  isOpen,
  onClose,
  onSave,
  patient,
}: PatientFormModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("personal");
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size for responsive layout
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Obtener catálogos del store (ya cacheados)
  const { getCatalog, loadCatalogs, isLoaded } = useCatalogStore();

  // Catálogos mapeados desde el store
  const bloodGroups = getCatalog("GRUPO_SANGUINEO");
  const genders = getCatalog("GENERO");
  const culturalGroups = getCatalog("GRUPO_CULTURAL");
  const civilStatuses = getCatalog("ESTADO_CIVIL");
  const instructionLevels = getCatalog("NIVEL_INSTRUCCION");
  const provinces = getCatalog("PROVINCIAS");
  const occupations = getCatalog("OCUPACIONES");
  const infoSources = getCatalog("FUENTE_INFORMACION");
  const relationships = getCatalog("PARENTESCO");
  const antecedentTypes = getCatalog("TIPO_ANTECEDENTE");
  const pathologies = getCatalog("LISTADO_PATOLOGIAS");

  // Form State
  const [formData, setFormData] = useState<PatientRequest>({
    cedula: "",
    primerNombre: "",
    segundoNombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    email: "",
    telefono: "",
    grupoSanguineoId: "",
    fechaNacimiento: "",
    lugarNacimiento: "",
    generoId: "",
    nacionalidad: "Ecuatoriana",
    grupoCulturalId: "",
    estadoCivilId: "",
    nivelInstruccionId: "",
    direccion: "",
    provinciaId: "",
    canton: "",
    parroquia: "",
    ocupacionId: "",
    nombreEmpresa: "",
    cargo: "",
    telefonoEmpresa: "",
    direccionEmpresa: "",
    fechaInicio: "",
    fechaFin: "",
    actual: false,
    fuenteInformacionId: "",
    nombreFuenteInfo: "",
    telefonoFuenteInfo: "",
    observacionesFuente: "",
    contactosEmergencia: [],
    antecedentesClinicos: [],
  });

  useEffect(() => {
    if (isOpen) {
      // Cargar catálogos si no están cargados (solo hace petición si es necesario)
      if (!isLoaded) {
        loadCatalogs();
      }

      if (patient) {
        // Populate form with patient data
        setFormData({
          cedula: patient.cedula,
          primerNombre: patient.primerNombre,
          segundoNombre: patient.segundoNombre || "",
          apellidoPaterno: patient.apellidoPaterno,
          apellidoMaterno: patient.apellidoMaterno || "",
          email: patient.email || "",
          telefono: patient.telefono || "",
          grupoSanguineoId: patient.grupoSanguineo?.id || "",
          fechaNacimiento: patient.fechaNacimiento,
          lugarNacimiento: patient.lugarNacimiento,
          generoId: patient.genero?.id || "",
          nacionalidad: patient.nacionalidad,
          grupoCulturalId: patient.grupoCultural?.id || "",
          estadoCivilId: patient.estadoCivil?.id || "",
          nivelInstruccionId: patient.nivelInstruccion?.id || "",
          direccion: patient.direccion,
          provinciaId: patient.provincia?.id || "",
          canton: patient.canton,
          parroquia: patient.parroquia,
          ocupacionId: patient.ocupacion?.ocupacion?.id || "",
          nombreEmpresa: patient.ocupacion?.nombreEmpresa || "",
          cargo: patient.ocupacion?.cargo || "",
          telefonoEmpresa: patient.ocupacion?.telefonoEmpresa || "",
          direccionEmpresa: patient.ocupacion?.direccionEmpresa || "",
          fechaInicio: patient.ocupacion?.fechaInicio || "",
          fechaFin: patient.ocupacion?.fechaFin || "",
          actual: patient.ocupacion?.actual || false,
          fuenteInformacionId:
            patient.fuenteInformacion?.fuenteInformacion?.id || "",
          nombreFuenteInfo: patient.fuenteInformacion?.nombreFuenteInfo || "",
          telefonoFuenteInfo: patient.fuenteInformacion?.telefono || "",
          observacionesFuente: patient.fuenteInformacion?.observaciones || "",
          contactosEmergencia: patient.contactosEmergencia || [],
          antecedentesClinicos: patient.antecedentesClinicos || [],
        });
      } else {
        // Reset form for new patient
        setFormData({
          cedula: "",
          primerNombre: "",
          segundoNombre: "",
          apellidoPaterno: "",
          apellidoMaterno: "",
          email: "",
          telefono: "",
          grupoSanguineoId: "",
          fechaNacimiento: "",
          lugarNacimiento: "",
          generoId: "",
          nacionalidad: "Ecuatoriana",
          grupoCulturalId: "",
          estadoCivilId: "",
          nivelInstruccionId: "",
          direccion: "",
          provinciaId: "",
          canton: "",
          parroquia: "",
          ocupacionId: "",
          nombreEmpresa: "",
          cargo: "",
          telefonoEmpresa: "",
          direccionEmpresa: "",
          fechaInicio: "",
          fechaFin: "",
          actual: false,
          fuenteInformacionId: "",
          nombreFuenteInfo: "",
          telefonoFuenteInfo: "",
          observacionesFuente: "",
          contactosEmergencia: [],
          antecedentesClinicos: [],
        });
      }
      setIsDirty(false);
      setActiveTab("personal");
    }
  }, [isOpen, patient, isLoaded, loadCatalogs]);

  const validateField = (name: string, value: any) => {
    // 1. Array Fields (Contactos Emergencia)
    if (name.startsWith("contactosEmergencia.")) {
      const parts = name.split(".");
      if (parts.length === 3) {
        const fieldName = parts[2];
        if (fieldName in emergencyContactSchema.shape) {
          const fieldSchema =
            emergencyContactSchema.shape[
            fieldName as keyof typeof emergencyContactSchema.shape
            ];
          const result = fieldSchema.safeParse(value);
          setErrors((prev) => {
            const newErrors = { ...prev };
            if (!result.success) {
              newErrors[name] = result.error.errors[0].message;
            } else {
              delete newErrors[name];
            }
            return newErrors;
          });
        }
      }
      return;
    }

    // 2. Array Fields (Antecedentes Clínicos)
    if (name.startsWith("antecedentesClinicos.")) {
      const parts = name.split(".");
      if (parts.length === 3) {
        const fieldName = parts[2];
        if (fieldName in clinicalHistorySchema.shape) {
          const fieldSchema =
            clinicalHistorySchema.shape[
            fieldName as keyof typeof clinicalHistorySchema.shape
            ];
          const result = fieldSchema.safeParse(value);
          setErrors((prev) => {
            const newErrors = { ...prev };
            if (!result.success) {
              newErrors[name] = result.error.errors[0].message;
            } else {
              delete newErrors[name];
            }
            return newErrors;
          });
        }
      }
      return;
    }

    // 3. Regular Fields
    if (name in patientSchema.shape) {
      const fieldSchema =
        patientSchema.shape[name as keyof typeof patientSchema.shape];
      const result = fieldSchema.safeParse(value);
      setErrors((prev) => {
        const newErrors = { ...prev };
        if (!result.success) {
          newErrors[name] = result.error.errors[0].message;
        } else {
          delete newErrors[name];
        }
        return newErrors;
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const newValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    setIsDirty(true);
    validateField(name, newValue);
  };

  const handleClose = () => {
    if (isDirty) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowConfirmClose(false);
    onClose();
  };

  const validateForm = () => {
    const result = patientSchema.safeParse(formData);

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path.length > 0) {
          // Handle simple fields
          if (typeof err.path[0] === "string" && err.path.length === 1) {
            newErrors[err.path[0]] = err.message;
          }
          // Handle array fields: contactosEmergencia.0.nombre
          if (
            err.path.length === 3 &&
            (err.path[0] === "contactosEmergencia" ||
              err.path[0] === "antecedentesClinicos")
          ) {
            const key = `${ err.path[0] }.${ err.path[1] }.${ err.path[2] }`;
            newErrors[key] = err.message;
          }
        }
      });
      setErrors(newErrors);
      // Return first error message for toast
      return result.error.errors[0].message;
    }

    setErrors({});
    return null;
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    try {
      setIsLoading(true);

      // Limpiar contactos de emergencia para enviar solo los campos necesarios
      const cleanedContactos = formData.contactosEmergencia.map((contact) => ({
        ...(contact.id ? { id: contact.id } : {}),
        ...(patient ? { pacienteId: patient.id } : {}),
        nombre: contact.nombre,
        parentescoId: contact.parentescoId,
        telefono: contact.telefono,
        direccion: contact.direccion,
      }));

      // Limpiar antecedentes clínicos para enviar solo los campos necesarios
      const cleanedAntecedentes = formData.antecedentesClinicos.map(
        (history) => ({
          ...(history.id ? { id: history.id } : {}),
          ...(patient ? { pacienteId: patient.id } : {}),
          tipoAntecedenteId: history.tipoAntecedenteId,
          patologiaId: history.patologiaId,
          descripcion: history.descripcion,
          fechaDiagnostico: history.fechaDiagnostico,
          tratamiento: history.tratamiento,
          estaActivo: history.estaActivo,
        })
      );

      // Crear el request limpio
      const cleanedFormData: PatientRequest = {
        ...formData,
        contactosEmergencia: cleanedContactos,
        antecedentesClinicos: cleanedAntecedentes,
      };

      if (patient) {
        await updatePatient(patient.id, cleanedFormData);
        toast.success("Paciente actualizado exitosamente");
      } else {
        await createPatient(cleanedFormData);
        toast.success("Paciente creado exitosamente");
      }
      onSave();
    } catch (error: any) {
      console.error("Error saving patient", error);
      toast.error(error.response?.data?.message || "Error al guardar paciente");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Emergency Contacts Helpers ---
  const addEmergencyContact = () => {
    setFormData((prev) => ({
      ...prev,
      contactosEmergencia: [
        { nombre: "", parentescoId: "", telefono: "", direccion: "" },
        ...prev.contactosEmergencia,
      ],
    }));
    setIsDirty(true);
  };

  const updateEmergencyContact = (
    index: number,
    field: keyof EmergencyContact,
    value: string
  ) => {
    const newContacts = [...formData.contactosEmergencia];
    newContacts[index] = { ...newContacts[index], [field]: value };
    setFormData((prev) => ({ ...prev, contactosEmergencia: newContacts }));
    setIsDirty(true);
    validateField(`contactosEmergencia.${ index }.${ field }`, value);
  };

  const removeEmergencyContact = (index: number) => {
    const newContacts = formData.contactosEmergencia.filter(
      (_, i) => i !== index
    );
    setFormData((prev) => ({ ...prev, contactosEmergencia: newContacts }));
    setIsDirty(true);
  };

  // --- Clinical History Helpers ---
  const addClinicalHistory = () => {
    setFormData((prev) => ({
      ...prev,
      antecedentesClinicos: [
        {
          tipoAntecedenteId: "",
          patologiaId: "",
          descripcion: "",
          fechaDiagnostico: "",
          tratamiento: "",
          estaActivo: true,
        },
        ...prev.antecedentesClinicos,
      ],
    }));
    setIsDirty(true);
  };

  const updateClinicalHistory = (
    index: number,
    field: keyof ClinicalHistory,
    value: any
  ) => {
    const newHistory = [...formData.antecedentesClinicos];
    newHistory[index] = { ...newHistory[index], [field]: value };
    setFormData((prev) => ({ ...prev, antecedentesClinicos: newHistory }));
    setIsDirty(true);
    validateField(`antecedentesClinicos.${ index }.${ field }`, value);
  };

  const removeClinicalHistory = (index: number) => {
    const newHistory = formData.antecedentesClinicos.filter(
      (_, i) => i !== index
    );
    setFormData((prev) => ({ ...prev, antecedentesClinicos: newHistory }));
    setIsDirty(true);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={patient ? "Editar Paciente" : "Nuevo Paciente"}
      size="5xl"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} isLoading={isLoading}>
            Guardar
          </Button>
        </>
      }
    >
      <div className={`flex ${ isMobile ? 'flex-col' : 'flex-row' } ${ isMobile ? 'h-[80vh]' : 'h-[70vh]' } -m-6`}>

        {/* Mobile/Tablet: Horizontal Tabs */}
        {isMobile && (
          <div className="border-b border-slate-200 bg-white sticky top-0 z-10">
            <div className="flex overflow-x-auto gap-1 px-3 py-2.5 no-scrollbar">
              {[
                { id: "personal", label: "Personales", shortLabel: "Datos", icon: "user" },
                { id: "contact", label: "Contacto", shortLabel: "Ubicación", icon: "map-pin" },
                { id: "occupation", label: "Ocupación", shortLabel: "Trabajo", icon: "briefcase" },
                { id: "emergency", label: "Emergencia", shortLabel: "Contactos", icon: "phone" },
                { id: "clinical", label: "Clínicos", shortLabel: "Antecedentes", icon: "activity" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${ activeTab === tab.id
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  onClick={() => setActiveTab(tab.id as Tab)}
                >
                  {/* Icons */}
                  {tab.id === "personal" && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  )}
                  {tab.id === "contact" && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  )}
                  {tab.id === "occupation" && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                  )}
                  {tab.id === "emergency" && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  )}
                  {tab.id === "clinical" && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                    </svg>
                  )}
                  <span className="leading-tight">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Desktop: Sidebar Tabs */}
        {!isMobile && (
          <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col overflow-y-auto shrink-0">
            <div className="p-4 space-y-1">
              {[
                { id: "personal", label: "Datos Personales", icon: "user" },
                { id: "contact", label: "Contacto y Ubicación", icon: "map-pin" },
                { id: "occupation", label: "Ocupación", icon: "briefcase" },
                { id: "emergency", label: "Contactos Emergencia", icon: "phone" },
                {
                  id: "clinical",
                  label: "Antecedentes Clínicos",
                  icon: "activity",
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all text-left ${ activeTab === tab.id
                    ? "bg-white text-primary shadow-sm ring-1 ring-slate-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  onClick={() => setActiveTab(tab.id as Tab)}
                >
                  {/* Simple icons based on tab content */}
                  {tab.id === "personal" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  )}
                  {tab.id === "contact" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  )}
                  {tab.id === "occupation" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="2"
                        y="7"
                        width="20"
                        height="14"
                        rx="2"
                        ry="2"
                      ></rect>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                  )}
                  {tab.id === "emergency" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  )}
                  {tab.id === "clinical" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                    </svg>
                  )}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className={`flex-1 overflow-y-auto ${ isMobile ? 'p-4' : 'p-6' } bg-white`}>
          <div className="max-w-3xl mx-auto">
            <h3 className={`text-lg font-bold text-slate-900 mb-6 pb-2 border-b border-slate-100 ${isMobile ? 'mt-3' : ''}`}>
              {activeTab === "personal" && "Información Personal"}
              {activeTab === "contact" && "Información de Contacto y Ubicación"}
              {activeTab === "occupation" && "Información Laboral y Ocupación"}
              {activeTab === "emergency" && "Contactos de Emergencia"}
              {activeTab === "clinical" && "Antecedentes Clínicos"}
            </h3>

            {activeTab === "personal" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Cédula *"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleChange}
                  placeholder="ej: 1712345678"
                  error={errors.cedula}
                  required
                />
                <Input
                  label="Primer Nombre *"
                  name="primerNombre"
                  value={formData.primerNombre}
                  onChange={handleChange}
                  placeholder="ej: Juan"
                  error={errors.primerNombre}
                  required
                />
                <Input
                  label="Segundo Nombre"
                  name="segundoNombre"
                  value={formData.segundoNombre || ""}
                  onChange={handleChange}
                  placeholder="ej: Andrés"
                  error={errors.segundoNombre}
                />
                <Input
                  label="Apellido Paterno *"
                  name="apellidoPaterno"
                  value={formData.apellidoPaterno}
                  onChange={handleChange}
                  placeholder="ej: Pérez"
                  error={errors.apellidoPaterno}
                  required
                />
                <Input
                  label="Apellido Materno"
                  name="apellidoMaterno"
                  value={formData.apellidoMaterno || ""}
                  onChange={handleChange}
                  placeholder="ej: López"
                  error={errors.apellidoMaterno}
                />
                <Input
                  type="date"
                  label="Fecha de Nacimiento *"
                  name="fechaNacimiento"
                  value={formData.fechaNacimiento}
                  onChange={handleChange}
                  error={errors.fechaNacimiento}
                  required
                />
                <Input
                  label="Lugar de Nacimiento"
                  name="lugarNacimiento"
                  value={formData.lugarNacimiento}
                  onChange={handleChange}
                  placeholder="ej: Quito"
                  error={errors.lugarNacimiento}
                />

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">
                    Género *
                  </label>
                  <select
                    name="generoId"
                    value={formData.generoId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                  >
                    <option value="">Seleccione...</option>
                    {genders.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">
                    Grupo Sanguíneo
                  </label>
                  <select
                    name="grupoSanguineoId"
                    value={formData.grupoSanguineoId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                  >
                    <option value="">Seleccione...</option>
                    {bloodGroups.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">
                    Grupo Cultural
                  </label>
                  <select
                    name="grupoCulturalId"
                    value={formData.grupoCulturalId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                  >
                    <option value="">Seleccione...</option>
                    {culturalGroups.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">
                    Estado Civil
                  </label>
                  <select
                    name="estadoCivilId"
                    value={formData.estadoCivilId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                  >
                    <option value="">Seleccione...</option>
                    {civilStatuses.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">
                    Nivel de Instrucción
                  </label>
                  <select
                    name="nivelInstruccionId"
                    value={formData.nivelInstruccionId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                  >
                    <option value="">Seleccione...</option>
                    {instructionLevels.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Nacionalidad"
                  name="nacionalidad"
                  value={formData.nacionalidad}
                  onChange={handleChange}
                  placeholder="ej: Ecuatoriana"
                  error={errors.nacionalidad}
                />
              </div>
            )}

            {activeTab === "contact" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  type="email"
                  label="Email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  placeholder="ej: juan.perez@email.com"
                  error={errors.email}
                />
                <Input
                  label="Teléfono"
                  name="telefono"
                  value={formData.telefono || ""}
                  onChange={handleChange}
                  placeholder="ej: 0995910820 / 0999158964"
                  error={errors.telefono}
                />
                <Input
                  label="Dirección"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  className="md:col-span-2"
                  placeholder="ej: Av. Amazonas y Naciones Unidas"
                  error={errors.direccion}
                />

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">
                    Provincia
                  </label>
                  <select
                    name="provinciaId"
                    value={formData.provinciaId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                  >
                    <option value="">Seleccione...</option>
                    {provinces.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Cantón"
                  name="canton"
                  value={formData.canton}
                  onChange={handleChange}
                  placeholder="ej: Quito"
                  error={errors.canton}
                />
                <Input
                  label="Parroquia"
                  name="parroquia"
                  value={formData.parroquia}
                  onChange={handleChange}
                  placeholder="ej: Iñaquito"
                  error={errors.parroquia}
                />

                <div className="md:col-span-2 border-t border-slate-200 pt-6 mt-2">
                  <h4 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    Fuente de Información
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-slate-700">
                        Tipo de Fuente
                      </label>
                      <select
                        name="fuenteInformacionId"
                        value={formData.fuenteInformacionId}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                      >
                        <option value="">Seleccione...</option>
                        {infoSources.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Input
                      label="Nombre Fuente"
                      name="nombreFuenteInfo"
                      value={formData.nombreFuenteInfo || ""}
                      onChange={handleChange}
                      placeholder="ej: María Pérez"
                      error={errors.nombreFuenteInfo}
                    />
                    <Input
                      label="Teléfono Fuente"
                      name="telefonoFuenteInfo"
                      value={formData.telefonoFuenteInfo || ""}
                      onChange={handleChange}
                      placeholder="ej: 0995910820"
                      error={errors.telefonoFuenteInfo}
                    />
                    <Input
                      label="Observaciones"
                      name="observacionesFuente"
                      value={formData.observacionesFuente || ""}
                      onChange={handleChange}
                      placeholder="ej: Familiar cercano"
                      error={errors.observacionesFuente}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "occupation" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">
                    Ocupación
                  </label>
                  <select
                    name="ocupacionId"
                    value={formData.ocupacionId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                  >
                    <option value="">Seleccione...</option>
                    {occupations.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Nombre Empresa"
                  name="nombreEmpresa"
                  value={formData.nombreEmpresa || ""}
                  onChange={handleChange}
                  placeholder="ej: Empresa S.A."
                  error={errors.nombreEmpresa}
                />
                <Input
                  label="Cargo"
                  name="cargo"
                  value={formData.cargo || ""}
                  onChange={handleChange}
                  placeholder="ej: Gerente"
                  error={errors.cargo}
                />
                <Input
                  label="Teléfono Empresa"
                  name="telefonoEmpresa"
                  value={formData.telefonoEmpresa || ""}
                  onChange={handleChange}
                  placeholder="ej: 022999999"
                  error={errors.telefonoEmpresa}
                />
                <Input
                  label="Dirección Empresa"
                  name="direccionEmpresa"
                  value={formData.direccionEmpresa || ""}
                  onChange={handleChange}
                  placeholder="ej: Av. 10 de Agosto"
                  error={errors.direccionEmpresa}
                />
                <Input
                  type="date"
                  label="Fecha Inicio"
                  name="fechaInicio"
                  value={formData.fechaInicio || ""}
                  onChange={handleChange}
                  error={errors.fechaInicio}
                />
                <Input
                  type="date"
                  label="Fecha Fin"
                  name="fechaFin"
                  value={formData.fechaFin || ""}
                  onChange={handleChange}
                  error={errors.fechaFin}
                />

                <div className="flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    id="actual"
                    name="actual"
                    checked={formData.actual}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="actual" className="text-sm text-slate-700">
                    Trabajo Actual
                  </label>
                </div>
              </div>
            )}

            {activeTab === "emergency" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-slate-600 text-sm">
                    Registre los contactos a notificar en caso de emergencia.
                  </p>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={addEmergencyContact}
                  >
                    + Agregar Contacto
                  </Button>
                </div>

                {formData.contactosEmergencia.length === 0 && (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="8.5" cy="7" r="4"></circle>
                        <line x1="20" y1="8" x2="20" y2="14"></line>
                        <line x1="23" y1="11" x2="17" y2="11"></line>
                      </svg>
                    </div>
                    <p className="text-slate-500 font-medium">
                      No hay contactos registrados
                    </p>
                    <p className="text-slate-400 text-sm mt-1">
                      Haga clic en "Agregar Contacto" para comenzar
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  {formData.contactosEmergencia.map((contact, index) => (
                    <div
                      key={index}
                      className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative group hover:border-primary/30 transition-all"
                    >
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button
                          onClick={() => removeEmergencyContact(index)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar contacto"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>

                      <h4 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-50 text-primary rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        Contacto de Emergencia
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Nombre"
                          value={contact.nombre}
                          onChange={(e) =>
                            updateEmergencyContact(
                              index,
                              "nombre",
                              e.target.value
                            )
                          }
                          placeholder="ej: Juan Pérez"
                          error={errors[`contactosEmergencia.${ index }.nombre`]}
                        />
                        <div className="flex flex-col gap-1">
                          <label className="text-sm font-medium text-slate-700">
                            Parentesco
                          </label>
                          <select
                            value={contact.parentescoId}
                            onChange={(e) =>
                              updateEmergencyContact(
                                index,
                                "parentescoId",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                          >
                            <option value="">Seleccione...</option>
                            {relationships.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.nombre}
                              </option>
                            ))}
                          </select>
                          {errors[`contactosEmergencia.${ index }.parentescoId`] && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors[`contactosEmergencia.${ index }.parentescoId`]}
                            </p>
                          )}
                        </div>
                        <Input
                          label="Teléfono"
                          value={contact.telefono}
                          onChange={(e) =>
                            updateEmergencyContact(
                              index,
                              "telefono",
                              e.target.value
                            )
                          }
                          placeholder="ej: 0995910820"
                          error={errors[`contactosEmergencia.${ index }.telefono`]}
                        />
                        <Input
                          label="Dirección"
                          value={contact.direccion}
                          onChange={(e) =>
                            updateEmergencyContact(
                              index,
                              "direccion",
                              e.target.value
                            )
                          }
                          placeholder="ej: Av. Amazonas"
                          error={errors[`contactosEmergencia.${ index }.direccion`]}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "clinical" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-slate-600 text-sm">
                    Registre los antecedentes médicos relevantes del paciente.
                  </p>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={addClinicalHistory}
                  >
                    + Agregar Antecedente
                  </Button>
                </div>

                {formData.antecedentesClinicos.length === 0 && (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                      </svg>
                    </div>
                    <p className="text-slate-500 font-medium">
                      No hay antecedentes clínicos registrados
                    </p>
                    <p className="text-slate-400 text-sm mt-1">
                      Haga clic en "Agregar Antecedente" para comenzar
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  {formData.antecedentesClinicos.map((history, index) => (
                    <div
                      key={index}
                      className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative group hover:border-primary/30 transition-all"
                    >
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button
                          onClick={() => removeClinicalHistory(index)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar antecedente"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>

                      <h4 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-50 text-primary rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        Antecedente Clínico
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-sm font-medium text-slate-700">
                            Tipo Antecedente
                          </label>
                          <select
                            value={history.tipoAntecedenteId}
                            onChange={(e) =>
                              updateClinicalHistory(
                                index,
                                "tipoAntecedenteId",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                          >
                            <option value="">Seleccione...</option>
                            {antecedentTypes.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.nombre}
                              </option>
                            ))}
                          </select>
                          {errors[`antecedentesClinicos.${ index }.tipoAntecedenteId`] && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors[`antecedentesClinicos.${ index }.tipoAntecedenteId`]}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-sm font-medium text-slate-700">
                            Patología
                          </label>
                          <select
                            value={history.patologiaId}
                            onChange={(e) =>
                              updateClinicalHistory(
                                index,
                                "patologiaId",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                          >
                            <option value="">Seleccione...</option>
                            {pathologies.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.nombre}
                              </option>
                            ))}
                          </select>
                          {errors[`antecedentesClinicos.${ index }.patologiaId`] && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors[`antecedentesClinicos.${ index }.patologiaId`]}
                            </p>
                          )}
                        </div>
                        <Input
                          label="Descripción"
                          value={history.descripcion}
                          onChange={(e) =>
                            updateClinicalHistory(
                              index,
                              "descripcion",
                              e.target.value
                            )
                          }
                          placeholder="ej: Detalles adicionales..."
                          error={errors[`antecedentesClinicos.${ index }.descripcion`]}
                        />
                        <Input
                          type="date"
                          label="Fecha Diagnóstico"
                          value={history.fechaDiagnostico}
                          onChange={(e) =>
                            updateClinicalHistory(
                              index,
                              "fechaDiagnostico",
                              e.target.value
                            )
                          }
                          error={errors[`antecedentesClinicos.${ index }.fechaDiagnostico`]}
                        />
                        <Input
                          label="Tratamiento"
                          value={history.tratamiento}
                          onChange={(e) =>
                            updateClinicalHistory(
                              index,
                              "tratamiento",
                              e.target.value
                            )
                          }
                          placeholder="ej: Paracetamol 500mg"
                          error={errors[`antecedentesClinicos.${ index }.tratamiento`]}
                        />
                        <div className="flex items-center gap-2 mt-8">
                          <input
                            type="checkbox"
                            checked={history.estaActivo}
                            onChange={(e) =>
                              updateClinicalHistory(
                                index,
                                "estaActivo",
                                e.target.checked
                              )
                            }
                            className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                          />
                          <label className="text-sm text-slate-700">
                            Activo
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


      <ConfirmationModal
        isOpen={showConfirmClose}
        title="Cancelar Operación"
        message="Tienes cambios sin guardar. ¿Estás seguro de que deseas cerrar?"
        onConfirm={handleConfirmClose}
        onCancel={() => setShowConfirmClose(false)}
        confirmButtonText="Sí, cerrar"
        cancelButtonText="No, continuar"
      />
    </Modal >
  );
}
