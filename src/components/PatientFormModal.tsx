import React, { useState, useEffect } from "react";
import Modal from "./common/Modal";
import { Button } from "./common/Button";
import { Input } from "./common/Input";
import { createPatient, updatePatient } from "../services/patientService";
import { getCatalogItems } from "../services/catalogService";
import type { Patient, PatientRequest, CatalogItem, EmergencyContact, ClinicalHistory } from "../types/patient";
import { toast } from "react-toastify";

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  patient: Patient | null;
}

type Tab = "personal" | "contact" | "occupation" | "emergency" | "clinical";

export default function PatientFormModal({ isOpen, onClose, onSave, patient }: PatientFormModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("personal");
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Catalogs
  const [bloodGroups, setBloodGroups] = useState<CatalogItem[]>([]);
  const [genders, setGenders] = useState<CatalogItem[]>([]);
  const [culturalGroups, setCulturalGroups] = useState<CatalogItem[]>([]);
  const [civilStatuses, setCivilStatuses] = useState<CatalogItem[]>([]);
  const [instructionLevels, setInstructionLevels] = useState<CatalogItem[]>([]);
  const [provinces, setProvinces] = useState<CatalogItem[]>([]);
  const [occupations, setOccupations] = useState<CatalogItem[]>([]);
  const [infoSources, setInfoSources] = useState<CatalogItem[]>([]);
  const [relationships, setRelationships] = useState<CatalogItem[]>([]); // For emergency contacts
  const [antecedentTypes, setAntecedentTypes] = useState<CatalogItem[]>([]); // For clinical history
  const [pathologies, setPathologies] = useState<CatalogItem[]>([]); // For clinical history

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
    antecedentesClinicos: []
  });

  useEffect(() => {
    if (isOpen) {
      loadCatalogs();
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
          fuenteInformacionId: patient.fuenteInformacion?.fuenteInformacion?.id || "",
          nombreFuenteInfo: patient.fuenteInformacion?.nombreFuenteInfo || "",
          telefonoFuenteInfo: patient.fuenteInformacion?.telefono || "",
          observacionesFuente: patient.fuenteInformacion?.observaciones || "",
          contactosEmergencia: patient.contactosEmergencia || [],
          antecedentesClinicos: patient.antecedentesClinicos || []
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
            antecedentesClinicos: []
        });
      }
      setIsDirty(false);
      setActiveTab("personal");
    }
  }, [isOpen, patient]);

  const loadCatalogs = async () => {
    try {
      const [
        bloodRes, genderRes, culturalRes, civilRes, instructionRes, 
        provinceRes, occupationRes, infoSourceRes, relationshipRes,
        antecedentTypeRes, pathologyRes
      ] = await Promise.all([
        getCatalogItems("GRUPO_SANGUINEO"),
        getCatalogItems("GENERO"),
        getCatalogItems("GRUPO_CULTURAL"),
        getCatalogItems("ESTADO_CIVIL"),
        getCatalogItems("NIVEL_INSTRUCCION"),
        getCatalogItems("PROVINCIAS"),
        getCatalogItems("OCUPACIONES"),
        getCatalogItems("FUENTE_INFORMACION"),
        getCatalogItems("PARENTESCO"), // Assumed catalog name
        getCatalogItems("TIPO_ANTECEDENTE"), // Assumed catalog name
        getCatalogItems("PATOLOGIA") // Assumed catalog name
      ]);

      if (bloodRes.data.success) setBloodGroups(bloodRes.data.data);
      if (genderRes.data.success) setGenders(genderRes.data.data);
      if (culturalRes.data.success) setCulturalGroups(culturalRes.data.data);
      if (civilRes.data.success) setCivilStatuses(civilRes.data.data);
      if (instructionRes.data.success) setInstructionLevels(instructionRes.data.data);
      if (provinceRes.data.success) setProvinces(provinceRes.data.data);
      if (occupationRes.data.success) setOccupations(occupationRes.data.data);
      if (infoSourceRes.data.success) setInfoSources(infoSourceRes.data.data);
      if (relationshipRes.data.success) setRelationships(relationshipRes.data.data);
      if (antecedentTypeRes.data.success) setAntecedentTypes(antecedentTypeRes.data.data);
      if (pathologyRes.data.success) setPathologies(pathologyRes.data.data);

    } catch (error) {
      console.error("Error loading catalogs", error);
      toast.error("Error al cargar catálogos");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    setIsDirty(true);
  };

  const handleClose = () => {
    if (isDirty) {
      if (window.confirm("Tienes cambios sin guardar. ¿Estás seguro de que deseas cerrar?")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.cedula || !formData.primerNombre || !formData.apellidoPaterno) {
      toast.error("Por favor complete los campos obligatorios (Cédula, Nombres, Apellidos)");
      return;
    }

    try {
      setIsLoading(true);
      if (patient) {
        await updatePatient(patient.id, formData);
        toast.success("Paciente actualizado exitosamente");
      } else {
        await createPatient(formData);
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
    setFormData(prev => ({
      ...prev,
      contactosEmergencia: [...prev.contactosEmergencia, { nombre: "", parentescoId: "", telefono: "", direccion: "" }]
    }));
    setIsDirty(true);
  };

  const updateEmergencyContact = (index: number, field: keyof EmergencyContact, value: string) => {
    const newContacts = [...formData.contactosEmergencia];
    newContacts[index] = { ...newContacts[index], [field]: value };
    setFormData(prev => ({ ...prev, contactosEmergencia: newContacts }));
    setIsDirty(true);
  };

  const removeEmergencyContact = (index: number) => {
    const newContacts = formData.contactosEmergencia.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, contactosEmergencia: newContacts }));
    setIsDirty(true);
  };

  // --- Clinical History Helpers ---
  const addClinicalHistory = () => {
    setFormData(prev => ({
      ...prev,
      antecedentesClinicos: [...prev.antecedentesClinicos, { 
        tipoAntecedenteId: "", 
        patologiaId: "", 
        descripcion: "", 
        fechaDiagnostico: "", 
        tratamiento: "", 
        estaActivo: true 
      }]
    }));
    setIsDirty(true);
  };

  const updateClinicalHistory = (index: number, field: keyof ClinicalHistory, value: any) => {
    const newHistory = [...formData.antecedentesClinicos];
    newHistory[index] = { ...newHistory[index], [field]: value };
    setFormData(prev => ({ ...prev, antecedentesClinicos: newHistory }));
    setIsDirty(true);
  };

  const removeClinicalHistory = (index: number) => {
    const newHistory = formData.antecedentesClinicos.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, antecedentesClinicos: newHistory }));
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
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} isLoading={isLoading}>
            Guardar
          </Button>
        </>
      }
    >
      <div className="flex h-[70vh] -m-6">
        {/* Sidebar Tabs */}
        <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col overflow-y-auto shrink-0">
          <div className="p-4 space-y-1">
            {[
              { id: "personal", label: "Datos Personales", icon: "user" },
              { id: "contact", label: "Contacto y Ubicación", icon: "map-pin" },
              { id: "occupation", label: "Ocupación", icon: "briefcase" },
              { id: "emergency", label: "Contactos Emergencia", icon: "phone" },
              { id: "clinical", label: "Antecedentes Clínicos", icon: "activity" },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all text-left ${
                  activeTab === tab.id
                    ? "bg-white text-primary shadow-sm ring-1 ring-slate-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
                onClick={() => setActiveTab(tab.id as Tab)}
              >
                {/* Simple icons based on tab content */}
                {tab.id === "personal" && (
                   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                )}
                {tab.id === "contact" && (
                   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                )}
                {tab.id === "occupation" && (
                   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                )}
                {tab.id === "emergency" && (
                   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                )}
                {tab.id === "clinical" && (
                   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                )}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-6 pb-2 border-b border-slate-100">
              {activeTab === "personal" && "Información Personal"}
              {activeTab === "contact" && "Información de Contacto y Ubicación"}
              {activeTab === "occupation" && "Información Laboral y Ocupación"}
              {activeTab === "emergency" && "Contactos de Emergencia"}
              {activeTab === "clinical" && "Antecedentes Clínicos"}
            </h3>

            {activeTab === "personal" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Cédula *" name="cedula" value={formData.cedula} onChange={handleChange} required />
                <Input label="Primer Nombre *" name="primerNombre" value={formData.primerNombre} onChange={handleChange} required />
                <Input label="Segundo Nombre" name="segundoNombre" value={formData.segundoNombre || ""} onChange={handleChange} />
                <Input label="Apellido Paterno *" name="apellidoPaterno" value={formData.apellidoPaterno} onChange={handleChange} required />
                <Input label="Apellido Materno" name="apellidoMaterno" value={formData.apellidoMaterno || ""} onChange={handleChange} />
                <Input type="date" label="Fecha de Nacimiento *" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} required />
                <Input label="Lugar de Nacimiento" name="lugarNacimiento" value={formData.lugarNacimiento} onChange={handleChange} />
                
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">Género *</label>
                  <select name="generoId" value={formData.generoId} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white">
                    <option value="">Seleccione...</option>
                    {genders.map(item => <option key={item.id} value={item.id}>{item.nombre}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">Grupo Sanguíneo</label>
                  <select name="grupoSanguineoId" value={formData.grupoSanguineoId} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white">
                    <option value="">Seleccione...</option>
                    {bloodGroups.map(item => <option key={item.id} value={item.id}>{item.nombre}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">Grupo Cultural</label>
                  <select name="grupoCulturalId" value={formData.grupoCulturalId} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white">
                    <option value="">Seleccione...</option>
                    {culturalGroups.map(item => <option key={item.id} value={item.id}>{item.nombre}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">Estado Civil</label>
                  <select name="estadoCivilId" value={formData.estadoCivilId} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white">
                    <option value="">Seleccione...</option>
                    {civilStatuses.map(item => <option key={item.id} value={item.id}>{item.nombre}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">Nivel de Instrucción</label>
                  <select name="nivelInstruccionId" value={formData.nivelInstruccionId} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white">
                    <option value="">Seleccione...</option>
                    {instructionLevels.map(item => <option key={item.id} value={item.id}>{item.nombre}</option>)}
                  </select>
                </div>

                <Input label="Nacionalidad" name="nacionalidad" value={formData.nacionalidad} onChange={handleChange} />
              </div>
            )}

            {activeTab === "contact" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input type="email" label="Email" name="email" value={formData.email || ""} onChange={handleChange} />
                <Input label="Teléfono" name="telefono" value={formData.telefono || ""} onChange={handleChange} />
                <Input label="Dirección" name="direccion" value={formData.direccion} onChange={handleChange} className="md:col-span-2" />
                
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">Provincia</label>
                  <select name="provinciaId" value={formData.provinciaId} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white">
                    <option value="">Seleccione...</option>
                    {provinces.map(item => <option key={item.id} value={item.id}>{item.nombre}</option>)}
                  </select>
                </div>

                <Input label="Cantón" name="canton" value={formData.canton} onChange={handleChange} />
                <Input label="Parroquia" name="parroquia" value={formData.parroquia} onChange={handleChange} />

                <div className="md:col-span-2 border-t border-slate-200 pt-6 mt-2">
                  <h4 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    Fuente de Información
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-slate-700">Tipo de Fuente</label>
                      <select name="fuenteInformacionId" value={formData.fuenteInformacionId} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white">
                        <option value="">Seleccione...</option>
                        {infoSources.map(item => <option key={item.id} value={item.id}>{item.nombre}</option>)}
                      </select>
                    </div>
                    <Input label="Nombre Fuente" name="nombreFuenteInfo" value={formData.nombreFuenteInfo || ""} onChange={handleChange} />
                    <Input label="Teléfono Fuente" name="telefonoFuenteInfo" value={formData.telefonoFuenteInfo || ""} onChange={handleChange} />
                    <Input label="Observaciones" name="observacionesFuente" value={formData.observacionesFuente || ""} onChange={handleChange} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "occupation" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">Ocupación</label>
                  <select name="ocupacionId" value={formData.ocupacionId} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white">
                    <option value="">Seleccione...</option>
                    {occupations.map(item => <option key={item.id} value={item.id}>{item.nombre}</option>)}
                  </select>
                </div>
                <Input label="Nombre Empresa" name="nombreEmpresa" value={formData.nombreEmpresa || ""} onChange={handleChange} />
                <Input label="Cargo" name="cargo" value={formData.cargo || ""} onChange={handleChange} />
                <Input label="Teléfono Empresa" name="telefonoEmpresa" value={formData.telefonoEmpresa || ""} onChange={handleChange} />
                <Input label="Dirección Empresa" name="direccionEmpresa" value={formData.direccionEmpresa || ""} onChange={handleChange} />
                <Input type="date" label="Fecha Inicio" name="fechaInicio" value={formData.fechaInicio || ""} onChange={handleChange} />
                <Input type="date" label="Fecha Fin" name="fechaFin" value={formData.fechaFin || ""} onChange={handleChange} />
                
                <div className="flex items-center gap-2 mt-6">
                  <input 
                    type="checkbox" 
                    id="actual" 
                    name="actual" 
                    checked={formData.actual} 
                    onChange={handleChange} 
                    className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="actual" className="text-sm text-slate-700">Trabajo Actual</label>
                </div>
              </div>
            )}

            {activeTab === "emergency" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-slate-600 text-sm">Registre los contactos a notificar en caso de emergencia.</p>
                  <Button size="sm" variant="secondary" onClick={addEmergencyContact}>+ Agregar Contacto</Button>
                </div>
                
                {formData.contactosEmergencia.length === 0 && (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                    </div>
                    <p className="text-slate-500 font-medium">No hay contactos registrados</p>
                    <p className="text-slate-400 text-sm mt-1">Haga clic en "Agregar Contacto" para comenzar</p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  {formData.contactosEmergencia.map((contact, index) => (
                    <div key={index} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative group hover:border-primary/30 transition-all">
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button 
                          onClick={() => removeEmergencyContact(index)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar contacto"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                      </div>
                      
                      <h4 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-50 text-primary rounded-full flex items-center justify-center text-xs font-bold">{index + 1}</span>
                        Contacto de Emergencia
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input 
                          label="Nombre" 
                          value={contact.nombre} 
                          onChange={(e) => updateEmergencyContact(index, "nombre", e.target.value)} 
                        />
                        <div className="flex flex-col gap-1">
                          <label className="text-sm font-medium text-slate-700">Parentesco</label>
                          <select 
                            value={contact.parentescoId} 
                            onChange={(e) => updateEmergencyContact(index, "parentescoId", e.target.value)} 
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                          >
                            <option value="">Seleccione...</option>
                            {relationships.map(item => <option key={item.id} value={item.id}>{item.nombre}</option>)}
                          </select>
                        </div>
                        <Input 
                          label="Teléfono" 
                          value={contact.telefono} 
                          onChange={(e) => updateEmergencyContact(index, "telefono", e.target.value)} 
                        />
                        <Input 
                          label="Dirección" 
                          value={contact.direccion} 
                          onChange={(e) => updateEmergencyContact(index, "direccion", e.target.value)} 
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
                  <p className="text-slate-600 text-sm">Registre los antecedentes médicos relevantes del paciente.</p>
                  <Button size="sm" variant="secondary" onClick={addClinicalHistory}>+ Agregar Antecedente</Button>
                </div>

                {formData.antecedentesClinicos.length === 0 && (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                    </div>
                    <p className="text-slate-500 font-medium">No hay antecedentes clínicos registrados</p>
                    <p className="text-slate-400 text-sm mt-1">Haga clic en "Agregar Antecedente" para comenzar</p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  {formData.antecedentesClinicos.map((history, index) => (
                    <div key={index} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative group hover:border-primary/30 transition-all">
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button 
                          onClick={() => removeClinicalHistory(index)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar antecedente"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                      </div>

                      <h4 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-50 text-primary rounded-full flex items-center justify-center text-xs font-bold">{index + 1}</span>
                        Antecedente Clínico
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-sm font-medium text-slate-700">Tipo Antecedente</label>
                          <select 
                            value={history.tipoAntecedenteId} 
                            onChange={(e) => updateClinicalHistory(index, "tipoAntecedenteId", e.target.value)} 
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                          >
                            <option value="">Seleccione...</option>
                            {antecedentTypes.map(item => <option key={item.id} value={item.id}>{item.nombre}</option>)}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-sm font-medium text-slate-700">Patología</label>
                          <select 
                            value={history.patologiaId} 
                            onChange={(e) => updateClinicalHistory(index, "patologiaId", e.target.value)} 
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                          >
                            <option value="">Seleccione...</option>
                            {pathologies.map(item => <option key={item.id} value={item.id}>{item.nombre}</option>)}
                          </select>
                        </div>
                        <Input 
                          label="Descripción" 
                          value={history.descripcion} 
                          onChange={(e) => updateClinicalHistory(index, "descripcion", e.target.value)} 
                        />
                        <Input 
                          type="date"
                          label="Fecha Diagnóstico" 
                          value={history.fechaDiagnostico} 
                          onChange={(e) => updateClinicalHistory(index, "fechaDiagnostico", e.target.value)} 
                        />
                        <Input 
                          label="Tratamiento" 
                          value={history.tratamiento} 
                          onChange={(e) => updateClinicalHistory(index, "tratamiento", e.target.value)} 
                        />
                        <div className="flex items-center gap-2 mt-8">
                          <input 
                            type="checkbox" 
                            checked={history.estaActivo} 
                            onChange={(e) => updateClinicalHistory(index, "estaActivo", e.target.checked)} 
                            className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                          />
                          <label className="text-sm text-slate-700">Activo</label>
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
    </Modal>
  );
}
