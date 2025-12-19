import { useState, type FormEvent } from "react";
import { getClinicalRecordByNumber, getClinicalRecordByPatientId } from "../services/clinicalRecordService";
import { searchPatients } from "../services/patientService";
import type { ClinicalRecord } from "../types/clinicalRecord";
import type { Patient } from "../types/patient";
import { toast } from "react-toastify";

// Icons
import SearchIcon from "@/icons/system/search.svg";
import PatientIcon from "@/icons/system/patient.svg";
import ClipboardIcon from "@/icons/system/clipboard.svg";
import CheckIcon from "@/icons/system/check.svg";
import CloseIcon from "@/icons/system/close.svg";

interface ClinicalRecordSelectorProps {
  onSelect: (clinicalRecord: ClinicalRecord) => void;
  onCancel?: () => void;
  selectedRecord?: ClinicalRecord;
}

type SearchType = "paciente" | "numero";

export default function ClinicalRecordSelector({
  onSelect,
  onCancel,
  selectedRecord: externalSelectedRecord,
}: ClinicalRecordSelectorProps) {
  const [searchType, setSearchType] = useState<SearchType>("paciente");
  const [selectedRecord, setSelectedRecord] = useState<ClinicalRecord | null>(
    externalSelectedRecord || null
  );

  // Patient search states
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  const [foundPatients, setFoundPatients] = useState<Patient[]>([]);
  const [isSearchingPatients, setIsSearchingPatients] = useState(false);

  // HC number search states
  const [hcNumber, setHcNumber] = useState("");
  const [isSearchingHC, setIsSearchingHC] = useState(false);

  // Search patients by name/surname/cedula
  const handleSearchPatients = async (e: FormEvent) => {
    e.preventDefault();
    if (!patientSearchTerm.trim()) {
      toast.warning("Ingrese un término de búsqueda");
      return;
    }

    setIsSearchingPatients(true);
    setFoundPatients([]);
    setSelectedRecord(null);

    try {
      const response = await searchPatients(patientSearchTerm);
      if (response.data.success) {
        setFoundPatients(response.data.data);
        if (response.data.data.length === 0) {
          toast.info("No se encontraron pacientes");
        } else {
          toast.success(`Se encontraron ${ response.data.data.length } paciente(s)`);
        }
      }
    } catch (error) {
      console.error("Error searching patients:", error);
      toast.error("Error al buscar pacientes");
    } finally {
      setIsSearchingPatients(false);
    }
  };

  // Select a patient and search for their clinical record
  const handleSelectPatient = async (patient: Patient) => {
    setIsSearchingPatients(true);
    try {
      const response = await getClinicalRecordByPatientId(patient.id);
      if (response.data.success && response.data.data) {
        setSelectedRecord(response.data.data);
        toast.success("Historia clínica encontrada");
      } else {
        toast.warning(`${ patient.primerNombre } ${ patient.apellidoPaterno } no tiene historia clínica registrada`);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        toast.warning(
          `${ patient.primerNombre } ${ patient.apellidoPaterno } no tiene historia clínica registrada. Por favor, créela primero.`
        );
      } else {
        toast.error("Error al buscar la historia clínica");
        console.error(err);
      }
    } finally {
      setIsSearchingPatients(false);
    }
  };

  // Search HC by number
  const handleSearchByNumber = async (e: FormEvent) => {
    e.preventDefault();
    if (!hcNumber.trim()) {
      toast.warning("Ingrese el número de historia clínica");
      return;
    }

    setIsSearchingHC(true);
    setSelectedRecord(null);

    try {
      const response = await getClinicalRecordByNumber(hcNumber.trim());
      if (response.data.success && response.data.data) {
        setSelectedRecord(response.data.data);
        toast.success("Historia clínica encontrada");
      } else {
        toast.info("No se encontró ninguna historia clínica con ese número");
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        toast.info("No se encontró ninguna historia clínica con ese número");
      } else {
        toast.error("Error al buscar la historia clínica");
        console.error(err);
      }
    } finally {
      setIsSearchingHC(false);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedRecord) {
      onSelect(selectedRecord);
    }
  };

  const handleChangeSelection = () => {
    setSelectedRecord(null);
    setFoundPatients([]);
    setPatientSearchTerm("");
    setHcNumber("");
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Seleccionar Historia Clínica
        </h2>
        <p className="text-sm text-slate-500">
          Busque y seleccione la historia clínica del paciente para crear una nueva evolución médica
        </p>
      </div>

      {/* Selected Record Display */}
      {selectedRecord && (
        <div className="mb-6 p-6 bg-green-50 border-2 border-green-200 rounded-xl">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-lg shrink-0">
                <img src={CheckIcon.src} alt="Seleccionado" className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                    HC: {selectedRecord.numeroHistoriaClinica}
                  </span>
                  <span className="text-xs text-green-600">✓ Seleccionada</span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg">
                  {selectedRecord.pacienteNombreCompleto}
                </h3>
                <p className="text-sm text-slate-600">
                  Cédula: {selectedRecord.pacienteCedula}
                </p>
                {selectedRecord.totalEvoluciones > 0 && (
                  <p className="text-xs text-slate-500 mt-1">
                    {selectedRecord.totalEvoluciones} evolución(es) registrada(s)
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleChangeSelection}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cambiar
              </button>
              <button
                onClick={handleConfirmSelection}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              >
                Continuar →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Interface */}
      {!selectedRecord && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          {/* Search Type Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Buscar por
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSearchType("paciente");
                  setHcNumber("");
                  setFoundPatients([]);
                }}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${ searchType === "paciente"
                  ? "border-primary bg-primary/5 text-primary font-medium"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <img src={PatientIcon.src} alt="Paciente" className="w-5 h-5" />
                  <span>Paciente</span>
                </div>
              </button>
              <button
                onClick={() => {
                  setSearchType("numero");
                  setPatientSearchTerm("");
                  setFoundPatients([]);
                }}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${ searchType === "numero"
                  ? "border-primary bg-primary/5 text-primary font-medium"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <img src={ClipboardIcon.src} alt="HC" className="w-5 h-5" />
                  <span>N° Historia Clínica</span>
                </div>
              </button>
            </div>
          </div>

          {/* Patient Search */}
          {searchType === "paciente" && (
            <div>
              <form onSubmit={handleSearchPatients} className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Buscar paciente por nombre, apellido o cédula
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Ej: Juan Pérez o 1712345678"
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      value={patientSearchTerm}
                      onChange={(e) => setPatientSearchTerm(e.target.value)}
                    />
                    <img
                      src={SearchIcon.src}
                      alt="Buscar"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSearchingPatients}
                    className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSearchingPatients ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Buscar"
                    )}
                  </button>
                </div>
              </form>

              {/* Patient Search Results */}
              {foundPatients.length > 0 && (
                <div className="border border-slate-200 rounded-lg overflow-hidden max-h-80 overflow-y-auto">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                    <span className="text-sm font-medium text-slate-700">
                      {foundPatients.length} paciente(s) encontrado(s)
                    </span>
                  </div>
                  {foundPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="p-4 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-0 flex justify-between items-center transition-colors"
                      onClick={() => handleSelectPatient(patient)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                          {patient.primerNombre.charAt(0)}
                          {patient.apellidoPaterno.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">
                            {patient.primerNombre} {patient.segundoNombre || ""}{" "}
                            {patient.apellidoPaterno} {patient.apellidoMaterno || ""}
                          </div>
                          <div className="text-sm text-slate-500">
                            Cédula: {patient.cedula}
                          </div>
                        </div>
                      </div>
                      <div className="text-primary text-sm font-medium hover:underline">
                        Seleccionar →
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* HC Number Search */}
          {searchType === "numero" && (
            <form onSubmit={handleSearchByNumber}>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Número de Historia Clínica
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Ej: 1722965454"
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={hcNumber}
                    onChange={(e) => setHcNumber(e.target.value)}
                  />
                  <img
                    src={SearchIcon.src}
                    alt="Buscar"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearchingHC}
                  className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSearchingHC ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Buscar"
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Ingrese el número exacto de la historia clínica que desea buscar
              </p>
            </form>
          )}
        </div>
      )}

      {/* Cancel Button */}
      {onCancel && !selectedRecord && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={onCancel}
            className="flex items-center justify-center px-6 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors"
          >
            <img src={CloseIcon.src} alt="Cancelar" className="w-5 h-5 mr-2" />
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
