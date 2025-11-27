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
      size="xl"
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
      <div className="flex flex-col h-[70vh]">
        {/* Tabs Header */}
        <div className="flex border-b border-slate-200 mb-6 overflow-x-auto">
          {[
            { id: "personal", label: "Datos Personales" },
            { id: "contact", label: "Contacto y Ubicación" },
            { id: "occupation", label: "Ocupación" },
            { id: "emergency", label: "Contactos Emergencia" },
            { id: "clinical", label: "Antecedentes Clínicos" },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
              onClick={() => setActiveTab(tab.id as Tab)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tabs Content */}
        <div className="flex-1 overflow-y-auto pr-2">
          {activeTab === "personal" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Cédula *" name="cedula" value={formData.cedula} onChange={handleChange} required />
              <Input label="Primer Nombre *" name="primerNombre" value={formData.primerNombre} onChange={handleChange} required />
              <Input label="Segundo Nombre" name="segundoNombre" value={formData.segundoNombre || ""} onChange={handleChange} />
              <Input label="Apellido Paterno *" name="apellidoPaterno" value={formData.apellidoPaterno} onChange={handleChange} required />
              <Input label="Apellido Materno" name="apellidoMaterno" value={formData.apellidoMaterno || ""} onChange={handleChange} />
              <Input type="date" label="Fecha de Nacimiento *" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} required />
              <Input label="Lugar de Nacimiento" name="lugarNacimiento" value={formData.lugarNacimiento} onChange={handleChange} />
              
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Género *</label>
                <select name="generoId" value={formData.generoId} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="">Seleccione...</option>
                  {genders.map(item => <option key={item.id} value={item.id}>{item.nombre}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Grupo Sanguíneo</label>
                <select name="grupoSanguineoId" value={formData.grupoSanguineoId} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="">Seleccione...</option>
                  {bloodGroups.map(item => <option key={item.id} value={item.id}>{item.nombre}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Grupo Cultural</label>
                <select name="grupoCulturalId" value={formData.grupoCulturalId} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="">Seleccione...</option>
                  {culturalGroups.map(item => <option key={item.id} value={item.id}>{item.nombre}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Estado Civil</label>
                <select name="estadoCivilId" value={formData.estadoCivilId} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="">Seleccione...</option>
                  {civilStatuses.map(item => <option key={item.id} value={item.id}>{item.nombre}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Nivel de Instrucción</label>
                <select name="nivelInstruccionId" value={formData.nivelInstruccionId} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="">Seleccione...</option>
                  {instructionLevels.map(item => <option key={item.id} value={item.id}>{item.nombre}</option>)}
                </select>
              </div>

              <Input label="Nacionalidad" name="nacionalidad" value={formData.nacionalidad} onChange={handleChange} />
            </div>
          )}

          {activeTab === "contact" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input type="email" label="Email" name="email" value={formData.email || ""} onChange={handleChange} />
              <Input label="Teléfono" name="telefono" value={formData.telefono || ""} onChange={handleChange} />
              <Input label="Dirección" name="direccion" value={formData.direccion} onChange={handleChange} className="md:col-span-2" />
              
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Provincia</label>
                <select name="provinciaId" value={formData.provinciaId} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="">Seleccione...</option>
                  {provinces.map(item => <option key={item.id} value={item.id}>{item.nombre}</option>)}
                </select>
              </div>

              <Input label="Cantón" name="canton" value={formData.canton} onChange={handleChange} />
              <Input label="Parroquia" name="parroquia" value={formData.parroquia} onChange={handleChange} />

              <div className="md:col-span-2 border-t border-slate-200 pt-4 mt-2">
                <h4 className="font-medium text-slate-900 mb-3">Fuente de Información</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700">Tipo de Fuente</label>
                    <select name="fuenteInformacionId" value={formData.fuenteInformacionId} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Ocupación</label>
                <select name="ocupacionId" value={formData.ocupacionId} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
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
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-slate-900">Contactos de Emergencia</h4>
                <Button size="sm" variant="secondary" onClick={addEmergencyContact}>+ Agregar Contacto</Button>
              </div>
              
              {formData.contactosEmergencia.length === 0 && (
                <p className="text-slate-500 text-sm italic text-center py-4">No hay contactos de emergencia registrados.</p>
              )}

              {formData.contactosEmergencia.map((contact, index) => (
                <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-200 relative">
                  <button 
                    onClick={() => removeEmergencyContact(index)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                    title="Eliminar contacto"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-6">
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
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
          )}

          {activeTab === "clinical" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-slate-900">Antecedentes Clínicos</h4>
                <Button size="sm" variant="secondary" onClick={addClinicalHistory}>+ Agregar Antecedente</Button>
              </div>

              {formData.antecedentesClinicos.length === 0 && (
                <p className="text-slate-500 text-sm italic text-center py-4">No hay antecedentes clínicos registrados.</p>
              )}

              {formData.antecedentesClinicos.map((history, index) => (
                <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-200 relative">
                  <button 
                    onClick={() => removeClinicalHistory(index)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                    title="Eliminar antecedente"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-6">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-slate-700">Tipo Antecedente</label>
                      <select 
                        value={history.tipoAntecedenteId} 
                        onChange={(e) => updateClinicalHistory(index, "tipoAntecedenteId", e.target.value)} 
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
          )}
        </div>
      </div>
    </Modal>
  );
}
