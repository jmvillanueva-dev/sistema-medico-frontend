import { useState, useEffect } from "react";
import { createClinicalRecord, updateClinicalRecord, getClinicalRecordById, getClinicalRecordByPatientId } from "../services/clinicalRecordService";
import { searchPatients, getPatientById } from "../services/patientService";
import type { ClinicalRecord, ClinicalRecordRequest } from "../types/clinicalRecord";
import type { Patient } from "../types/patient";
import Modal from "./common/Modal";
import { Input } from "./common/Input";
import Button from "./common/Button";
import { toast } from "react-toastify";
import SearchIcon from "@/icons/system/search.svg";
import UserIcon from "@/icons/system/user-single.svg";

interface ClinicalRecordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  record?: ClinicalRecord | null;
}

export default function ClinicalRecordFormModal({
  isOpen,
  onClose,
  onSave,
  record,
}: ClinicalRecordFormModalProps) {
  const [step, setStep] = useState(record ? 2 : 1); // Step 1: Search Patient, Step 2: Confirm/Edit Details
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(record?.paciente || null);
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  const [foundPatients, setFoundPatients] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form fields
  const [institucion, setInstitucion] = useState(record?.institucionSistema || "Red Pública Integral de Salud");
  const [unidadOperativa, setUnidadOperativa] = useState(record?.unidadOperativa || "Centro Médico Urdiales Espinoza");
  const [codUnidad, setCodUnidad] = useState(record?.codUnidad || "59890");

  useEffect(() => {
    if (isOpen) {
      if (record) {
        setStep(2);
        // Fetch fresh record data
        getClinicalRecordById(record.id).then(response => {
            if (response.data.success) {
                const freshRecord = response.data.data;
                setInstitucion(freshRecord.institucionSistema || "");
                setUnidadOperativa(freshRecord.unidadOperativa || "");
                setCodUnidad(freshRecord.codUnidad || "");
                
                // If patient is included, use it. 
                if (freshRecord.paciente) {
                    setSelectedPatient(freshRecord.paciente);
                } else if (freshRecord.pacienteId) {
                    // Try to fetch full patient details, but fallback to basic info from record if it fails
                    // This avoids the MultipleBagFetchException from backend
                    getPatientById(freshRecord.pacienteId).then(pResponse => {
                        if (pResponse.data.success) {
                            setSelectedPatient(pResponse.data.data);
                        }
                    }).catch(err => {
                        console.warn("Could not fetch full patient details, using fallback data:", err);
                        // Construct minimal patient object for display
                        const fallbackPatient: any = {
                            id: freshRecord.pacienteId,
                            cedula: freshRecord.pacienteCedula,
                            primerNombre: freshRecord.pacienteNombreCompleto, // Use full name as first name for display
                            apellidoPaterno: "", 
                            // Add other required fields with dummy data if needed by TS, though 'any' bypasses strict checks for display
                        };
                        setSelectedPatient(fallbackPatient);
                    });
                }
            }
        }).catch(err => {
            console.error("Error fetching clinical record details:", err);
            // Fallback to prop data if fetch fails
            setInstitucion(record.institucionSistema || "");
            setUnidadOperativa(record.unidadOperativa || "");
            setCodUnidad(record.codUnidad || "");
            
            // Also try to set patient from record prop if available
             if (!selectedPatient && record.pacienteId) {
                 const fallbackPatient: any = {
                    id: record.pacienteId,
                    cedula: record.pacienteCedula,
                    primerNombre: record.pacienteNombreCompleto,
                    apellidoPaterno: "",
                };
                setSelectedPatient(fallbackPatient);
            }
        });

        if (!selectedPatient && record.paciente) {
             setSelectedPatient(record.paciente);
        }
      } else {
        setStep(1);
        setSelectedPatient(null);
        setPatientSearchTerm("");
        setFoundPatients([]);
        setInstitucion("Red Pública Integral de Salud");
        setUnidadOperativa("Centro Médico Urdiales Espinoza");
        setCodUnidad("59890");
      }
    }
  }, [isOpen, record]);

  const handleSearchPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientSearchTerm.trim()) return;

    setIsSearching(true);
    try {
      const response = await searchPatients(patientSearchTerm);
      if (response.data.success) {
        setFoundPatients(response.data.data);
      }
    } catch (error) {
      console.error("Error searching patients:", error);
      toast.error("Error al buscar pacientes");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPatient = async (patient: Patient) => {
    // Check if patient already has a clinical record
    try {
        const response = await getClinicalRecordByPatientId(patient.id);
        if (response.data.success && response.data.data) {
            toast.warning(`El paciente ${patient.primerNombre} ${patient.apellidoPaterno} ya tiene una historia clínica activa.`);
            return;
        }
    } catch (error: any) {
        // If 404, it means no record exists, so we can proceed.
        // If other error, we might want to warn but let's assume it's safe to proceed or the create will fail.
        if (error.response && error.response.status !== 404) {
             console.error("Error checking existing record:", error);
        }
    }

    setSelectedPatient(patient);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
        toast.error("Debe seleccionar un paciente");
        return;
    }

    setLoading(true);
    try {
      const data: ClinicalRecordRequest = {
        pacienteId: selectedPatient.id,
        institucionSistema: institucion,
        unidadOperativa: unidadOperativa,
        codUnidad: codUnidad,
      };

      if (record) {
        await updateClinicalRecord(record.id, data);
        toast.success("Historia clínica actualizada correctamente");
      } else {
        await createClinicalRecord(data);
        toast.success("Historia clínica creada correctamente");
      }
      onSave();
    } catch (error: any) {
      console.error("Error saving clinical record:", error);
      const msg = error.response?.data?.message || "Error al guardar la historia clínica";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={record ? "Editar Historia Clínica" : "Nueva Historia Clínica"}
      size="2xl"
    >
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Busque y seleccione el paciente para crear su historia clínica.
          </p>
          
          <form onSubmit={handleSearchPatient} className="flex gap-2">
            <div className="relative flex-1">
                <input
                    type="text"
                    placeholder="Buscar por nombre, apellido o cédula..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                    value={patientSearchTerm}
                    onChange={(e) => setPatientSearchTerm(e.target.value)}
                    autoFocus
                />
                <img 
                    src={SearchIcon.src} 
                    alt="Buscar" 
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" 
                />
            </div>
            <Button type="submit" disabled={isSearching} isLoading={isSearching}>
              Buscar
            </Button>
          </form>

          <div className="mt-4 max-h-60 overflow-y-auto border border-slate-100 rounded-lg">
            {foundPatients.length === 0 && !isSearching && patientSearchTerm && (
                <div className="p-4 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
                    <p>No se encontraron pacientes.</p>
                    <a 
                        href={window.location.pathname.includes("/medical") ? "/medical/patients" : "/admin/patients"}
                        className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                    >
                        <img src={UserIcon.src} alt="" className="w-4 h-4" />
                        Crear nuevo paciente
                    </a>
                </div>
            )}
            
            {/* Always show option to create patient if list is empty or just as a helper */}
            {foundPatients.length === 0 && !patientSearchTerm && (
                 <div className="p-8 text-center text-slate-500 text-sm">
                    <p className="mb-2">Busque un paciente para comenzar.</p>
                    <p>¿No encuentra al paciente?</p>
                    <a 
                        href={window.location.pathname.includes("/medical") ? "/medical/patients" : "/admin/patients"}
                        className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                    >
                        <img src={UserIcon.src} alt="" className="w-4 h-4" />
                        Registrar nuevo paciente
                    </a>
                </div>
            )}
            
            {foundPatients.map((patient) => (
              <div
                key={patient.id}
                className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 flex justify-between items-center"
                onClick={() => handleSelectPatient(patient)}
              >
                <div>
                  <div className="font-medium text-slate-900">
                    {patient.primerNombre} {patient.apellidoPaterno}
                  </div>
                  <div className="text-xs text-slate-500">
                    Cédula: {patient.cedula}
                  </div>
                </div>
                <div className="text-primary text-sm font-medium">
                    Seleccionar
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 2 && selectedPatient && (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
                    {selectedPatient.primerNombre.charAt(0)}{selectedPatient.apellidoPaterno.charAt(0)}
                </div>
                <div>
                    <h4 className="font-bold text-slate-900">
                        {selectedPatient.primerNombre} {selectedPatient.apellidoPaterno}
                    </h4>
                    <p className="text-sm text-slate-600">
                        Cédula: {selectedPatient.cedula}
                    </p>
                    {!record && (
                         <button 
                            type="button" 
                            onClick={() => setStep(1)}
                            className="text-xs text-blue-600 hover:underline mt-1"
                        >
                            Cambiar paciente
                        </button>
                    )}
                </div>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Institución del Sistema"
              value={institucion}
              onChange={(e) => setInstitucion(e.target.value)}
              placeholder="Ej: Red Pública Integral de Salud"
            />
            <Input
              label="Unidad Operativa"
              value={unidadOperativa}
              onChange={(e) => setUnidadOperativa(e.target.value)}
              placeholder="Ej: Centro de Salud A"
            />
            <Input
              label="Código de Unidad"
              value={codUnidad}
              onChange={(e) => setCodUnidad(e.target.value)}
              placeholder="Ej: 59890"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button type="submit" isLoading={loading}>
              {record ? "Guardar Cambios" : "Crear Historia Clínica"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
