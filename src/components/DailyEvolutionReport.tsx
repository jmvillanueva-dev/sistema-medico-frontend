import React, { useState, useEffect } from "react";
import DateSelector from "./DateSelector";
import EvolutionCard from "./EvolutionCard";
import Modal from "./common/Modal";
import Button from "./common/Button";
import { getDailyReport } from "@/services/medicalEvolutionService";
import { getPatientById } from "@/services/patientService";
import { getClinicalRecordById } from "@/services/clinicalRecordService";
import type { EvolucionReporteDiario } from "@/types/medicalEvolution";
import type { Patient } from "@/types/patient";
import type { ClinicalRecord } from "@/types/clinicalRecord";

const STORAGE_KEY = "dashboard_selected_date";

const DailyEvolutionReport: React.FC = () => {
  // Initialize with stored date or today
  const getInitialDate = (): Date => {
    // Check if we're in the browser
    if (typeof window === 'undefined') {
      return new Date();
    }

    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return new Date(stored);
      } catch {
        return new Date();
      }
    }
    return new Date();
  };

  const [selectedDate, setSelectedDate] = useState<Date>(getInitialDate());
  const [evolutions, setEvolutions] = useState<EvolucionReporteDiario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedClinicalRecord, setSelectedClinicalRecord] = useState<ClinicalRecord | null>(null);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isClinicalRecordModalOpen, setIsClinicalRecordModalOpen] = useState(false);
  const [isLoadingModal, setIsLoadingModal] = useState(false);

  // Format date to YYYY-MM-DD for API
  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${ year }-${ month }-${ day }`;
  };

  // Fetch evolutions when date changes
  useEffect(() => {
    const fetchEvolutions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const dateStr = formatDateForAPI(selectedDate);
        const response = await getDailyReport(dateStr);
        setEvolutions(response.data.data || []);
      } catch (err: any) {
        console.error("Error fetching daily report:", err);
        setError(
          err.response?.data?.message ||
          "No se pudo cargar el reporte. Por favor, intenta de nuevo."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvolutions();
  }, [selectedDate]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    // Persist selected date (only in browser)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY, date.toISOString());
    }
  };

  const handleRetry = () => {
    setSelectedDate(new Date(selectedDate)); // Trigger re-fetch
  };

  // Handle view patient
  const handleViewPatient = async (pacienteId: string) => {
    setIsLoadingModal(true);
    setIsPatientModalOpen(true);
    try {
      const response = await getPatientById(pacienteId);
      setSelectedPatient(response.data.data);
    } catch (err: any) {
      console.error("Error fetching patient:", err);
      setSelectedPatient(null);
    } finally {
      setIsLoadingModal(false);
    }
  };

  // Handle view clinical record
  const handleViewClinicalRecord = async (historiaClinicaId: string) => {
    setIsLoadingModal(true);
    setIsClinicalRecordModalOpen(true);
    try {
      const response = await getClinicalRecordById(historiaClinicaId);
      setSelectedClinicalRecord(response.data.data);
    } catch (err: any) {
      console.error("Error fetching clinical record:", err);
      setSelectedClinicalRecord(null);
    } finally {
      setIsLoadingModal(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Date Selector */}
      <DateSelector selectedDate={selectedDate} onDateChange={handleDateChange} />

      {/* Content */}
      <div className="min-h-[400px]">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-600">Cargando evoluciones...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-red-600"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Error al cargar las evoluciones
            </h3>
            <p className="text-slate-600 mb-4 text-center max-w-md">{error}</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && evolutions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-slate-400"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No hay evoluciones registradas
            </h3>
            <p className="text-slate-600 text-center max-w-md">
              No se encontraron evoluciones médicas para la fecha seleccionada.
            </p>
          </div>
        )}

        {/* Evolution Cards Grid */}
        {!isLoading && !error && evolutions.length > 0 && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 pb-3 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">
                Evoluciones Médicas
              </h2>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="hidden sm:inline text-slate-400">|</span>
                <span className="text-sm text-slate-600">
                  Fecha: <span className="font-semibold">{selectedDate.toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}</span>
                </span>
                <span className="text-slate-400">|</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                  Total: {evolutions.length}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {evolutions.map((evolution) => (
                <EvolutionCard
                  key={evolution.evolucionId}
                  evolution={evolution}
                  onViewPatient={handleViewPatient}
                  onViewClinicalRecord={handleViewClinicalRecord}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Patient Details Modal */}
      <Modal
        isOpen={isPatientModalOpen}
        onClose={() => {
          setIsPatientModalOpen(false);
          setSelectedPatient(null);
        }}
        title="Datos del Paciente"
        size="lg"
      >
        {isLoadingModal ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : selectedPatient ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                  Primer Nombre
                </p>
                <p className="text-slate-900 font-medium">{selectedPatient.primerNombre}</p>
              </div>
              {selectedPatient.segundoNombre && (
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                    Segundo Nombre
                  </p>
                  <p className="text-slate-900 font-medium">{selectedPatient.segundoNombre}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                  Apellido Paterno
                </p>
                <p className="text-slate-900 font-medium">{selectedPatient.apellidoPaterno}</p>
              </div>
              {selectedPatient.apellidoMaterno && (
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                    Apellido Materno
                  </p>
                  <p className="text-slate-900 font-medium">{selectedPatient.apellidoMaterno}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                  Cédula
                </p>
                <p className="text-slate-900 font-medium">{selectedPatient.cedula}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                  Fecha de Nacimiento
                </p>
                <p className="text-slate-900 font-medium">
                  {new Date(selectedPatient.fechaNacimiento).toLocaleDateString("es-ES")}
                </p>
              </div>
              {selectedPatient.telefono && (
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                    Teléfono
                  </p>
                  <p className="text-slate-900 font-medium">{selectedPatient.telefono}</p>
                </div>
              )}
              {selectedPatient.email && (
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                    Email
                  </p>
                  <p className="text-slate-900 font-medium">{selectedPatient.email}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsPatientModalOpen(false);
                  setSelectedPatient(null);
                }}
              >
                Cerrar
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-600">
            No se pudo cargar la información del paciente
          </div>
        )}
      </Modal>

      {/* Clinical Record Details Modal */}
      <Modal
        isOpen={isClinicalRecordModalOpen}
        onClose={() => {
          setIsClinicalRecordModalOpen(false);
          setSelectedClinicalRecord(null);
        }}
        title={selectedClinicalRecord ? `Historia Clínica #${ selectedClinicalRecord.numeroHistoriaClinica }` : "Historia Clínica"}
        size="lg"
      >
        {isLoadingModal ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : selectedClinicalRecord ? (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h3 className="font-semibold text-slate-900 mb-2">
                {selectedClinicalRecord.pacienteNombreCompleto}
              </h3>
              <p className="text-sm text-slate-600">
                <span className="font-medium">Cédula:</span> {selectedClinicalRecord.pacienteCedula}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                  Institución del Sistema
                </p>
                <p className="text-slate-900 font-medium">
                  {selectedClinicalRecord.institucionSistema || "No registrado"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                  Unidad Operativa
                </p>
                <p className="text-slate-900 font-medium">
                  {selectedClinicalRecord.unidadOperativa || "No registrado"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                  Total de Evoluciones
                </p>
                <p className="text-slate-900 font-bold text-lg text-primary">
                  {selectedClinicalRecord.totalEvoluciones}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsClinicalRecordModalOpen(false);
                  setSelectedClinicalRecord(null);
                }}
              >
                Cerrar
              </Button>
              <Button
                onClick={() => {
                  window.location.href = `/medical/evolutions?historiaClinicaId=${ selectedClinicalRecord.id }`;
                }}
              >
                Ver Evoluciones
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-600">
            No se pudo cargar la información de la historia clínica
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DailyEvolutionReport;
