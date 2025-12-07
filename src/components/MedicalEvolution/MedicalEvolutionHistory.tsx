import { useState, useEffect } from "react";
import { getEvolucionesByHistoriaClinica, getEvolucionesByEmpleado, getEvolucionesByFilter } from "../../services/medicalEvolutionService";
import { getClinicalRecordById } from "../../services/clinicalRecordService";
import { getPatientById } from "../../services/patientService";
import type { EvolucionMedicaResumen } from "../../types/medicalEvolution";
import type { ClinicalRecord } from "../../types/clinicalRecord";
import type { Patient } from "../../types/patient";
import PatientFormModal from "../PatientFormModal";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import EditIcon from "@/icons/system/edit.svg";
import EyeIcon from "@/icons/system/eye.svg";
import FileIcon from "@/icons/system/file-text.svg";
import PlusIcon from "@/icons/system/add-circle.svg";
import UserIcon from "@/icons/system/user-single.svg";

// Storage key for persisting filters
const FILTER_STORAGE_KEY = "medical_evolutions_filter";

interface FilterState {
  fechaInicio: string;
  fechaFin: string;
  isActive: boolean;
}

const getStoredFilters = (): FilterState => {
  if (typeof window === "undefined") return { fechaInicio: "", fechaFin: "", isActive: false };
  const stored = sessionStorage.getItem(FILTER_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return { fechaInicio: "", fechaFin: "", isActive: false };
    }
  }
  return { fechaInicio: "", fechaFin: "", isActive: false };
};

const saveFiltersToStorage = (filters: FilterState) => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
};

const clearStoredFilters = () => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(FILTER_STORAGE_KEY);
};

interface MedicalEvolutionHistoryProps {
  historiaClinicaId?: string; // Optional for global view
  empleadoId?: string; // Optional for employee view
  onViewDetail?: (id: string) => void;
  onEdit?: (id: string) => void;
  onCreate?: () => void; // Optional for global view
}

export default function MedicalEvolutionHistory({ 
  historiaClinicaId, 
  empleadoId,
  onViewDetail, 
  onEdit, 
  onCreate 
}: MedicalEvolutionHistoryProps) {
  // Default navigation handlers
  const handleViewDetail = (id: string) => {
    if (onViewDetail) {
      onViewDetail(id);
    } else {
      window.location.href = `/medical/evolutions/${id}`;
    }
  };

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id);
    } else {
      window.location.href = `/medical/evolutions/edit/${id}`;
    }
  };

  const { user, initializeAuth } = useAuthStore();
  const [evolutions, setEvolutions] = useState<EvolucionMedicaResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAuthReady, setIsAuthReady] = useState(false);

  // View mode state - 'table' or 'cards'
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Detect mobile screen on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 768;
      setViewMode(isMobile ? 'cards' : 'table');
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Date filter state - initialize from storage
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [isFilterActive, setIsFilterActive] = useState(false);

  // Clinical Record context info (when viewing evolutions for a specific HC)
  const [clinicalRecordInfo, setClinicalRecordInfo] = useState<ClinicalRecord | null>(null);
  const [loadingHcInfo, setLoadingHcInfo] = useState(false);

  // Fetch clinical record info when historiaClinicaId is present
  useEffect(() => {
    if (historiaClinicaId) {
      setLoadingHcInfo(true);
      getClinicalRecordById(historiaClinicaId)
        .then((response) => {
          if (response.data.success && response.data.data) {
            setClinicalRecordInfo(response.data.data);
          }
        })
        .catch((err) => {
          console.error("Error fetching clinical record info:", err);
        })
        .finally(() => {
          setLoadingHcInfo(false);
        });
    } else {
      setClinicalRecordInfo(null);
    }
  }, [historiaClinicaId]);

  // Patient modal state
  const [isPatientModalOpen, setPatientModalOpen] = useState(false);
  const [patientData, setPatientData] = useState<Patient | null>(null);
  const [loadingPatient, setLoadingPatient] = useState(false);

  // Handle opening patient modal - fetch full patient data first
  const handleOpenPatientModal = async () => {
    if (!clinicalRecordInfo?.pacienteId) {
      toast.error("No se encontró el ID del paciente");
      return;
    }

    setLoadingPatient(true);
    try {
      const response = await getPatientById(clinicalRecordInfo.pacienteId);
      if (response.data.success && response.data.data) {
        setPatientData(response.data.data);
        setPatientModalOpen(true);
      } else {
        toast.error("No se pudo cargar los datos del paciente");
      }
    } catch (err) {
      console.error("Error fetching patient:", err);
      toast.error("Error al cargar los datos del paciente");
    } finally {
      setLoadingPatient(false);
    }
  };

  // Handle patient save (refresh HC info)
  const handlePatientSave = async () => {
    setPatientModalOpen(false);
    // Refresh clinical record info to update displayed name if it changed
    if (historiaClinicaId) {
      try {
        const response = await getClinicalRecordById(historiaClinicaId);
        if (response.data.success && response.data.data) {
          setClinicalRecordInfo(response.data.data);
        }
      } catch (err) {
        console.error("Error refreshing HC info:", err);
      }
    }
  };

  // Load stored filters on mount - but clear them when viewing a specific HC
  useEffect(() => {
    // If viewing evolutions for a specific Historia Clínica, clear any stored filters
    // to avoid confusion with mixed results
    if (historiaClinicaId) {
      clearStoredFilters();
      setFechaInicio("");
      setFechaFin("");
      setIsFilterActive(false);
      return;
    }
    
    // Only restore filters when viewing global evolutions (no historiaClinicaId)
    const storedFilters = getStoredFilters();
    if (storedFilters.isActive) {
      setFechaInicio(storedFilters.fechaInicio);
      setFechaFin(storedFilters.fechaFin);
      setIsFilterActive(true);
    }
  }, [historiaClinicaId]);

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
    setIsAuthReady(true);
  }, [initializeAuth]);

  const fetchEvolutions = async (useFilters = isFilterActive) => {
    // Determine the effective employee ID
    const effectiveEmpleadoId = empleadoId || user?.employeeId;

    try {
      setLoading(true);
      let response;

      // If filters are active, use the filter endpoint
      if (useFilters && (fechaInicio || fechaFin)) {
        response = await getEvolucionesByFilter({
          fechaInicio: fechaInicio || undefined,
          fechaFin: fechaFin || undefined,
        });
      } else if (historiaClinicaId) {
        response = await getEvolucionesByHistoriaClinica(historiaClinicaId);
      } else if (effectiveEmpleadoId) {
        // Use the dedicated employee endpoint
        response = await getEvolucionesByEmpleado(effectiveEmpleadoId);
      } else {
        // No ID available, don't fetch
        setLoading(false);
        return;
      }

      if (response && response.data.success) {
        setEvolutions(response.data.data);
      }
      setError(null);
    } catch (err) {
      const errorMsg = "Error al cargar las evoluciones médicas.";
      setError(errorMsg);
      console.error(err);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Apply date filters
  const handleApplyFilters = () => {
    if (!fechaInicio && !fechaFin) {
      toast.warning("Debe ingresar al menos una fecha para filtrar.");
      return;
    }
    setIsFilterActive(true);
    saveFiltersToStorage({ fechaInicio, fechaFin, isActive: true });
    fetchEvolutions(true);
  };

  // Clear filters
  const handleClearFilters = () => {
    setFechaInicio("");
    setFechaFin("");
    setIsFilterActive(false);
    clearStoredFilters();
    fetchEvolutions(false);
  };

  useEffect(() => {
    // Only fetch after auth is ready
    if (isAuthReady) {
      fetchEvolutions();
    }
  }, [historiaClinicaId, empleadoId, user?.employeeId, isAuthReady]);

  const filteredEvolutions = evolutions.filter((ev) => {
    if (!searchTerm) return true;
    const lowerSearch = searchTerm.toLowerCase();
    return (
      ev.fechaConsulta.includes(lowerSearch) ||
      ev.tipoConsulta.toLowerCase().includes(lowerSearch) ||
      ev.empleadoNombreCompleto.toLowerCase().includes(lowerSearch) ||
      ev.numeroHistoriaClinica.includes(lowerSearch)
    );
  });

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-3">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
      <span>Cargando evoluciones...</span>
    </div>
  );

  const renderError = () => (
    <div className="p-4 text-red-600 bg-red-50 rounded-lg text-center">
      {error}
    </div>
  );

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-white rounded-xl border border-slate-200 border-dashed">
      <span className="text-5xl mb-4 opacity-50">📋</span>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay evoluciones registradas</h3>
      <p className="text-sm text-slate-500 max-w-xs mx-auto mb-4">
        {historiaClinicaId ? "Esta historia clínica aún no tiene evoluciones médicas." : "No se encontraron evoluciones con los filtros actuales."}
      </p>
      {onCreate && (
        <button 
          onClick={onCreate}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-600 transition-colors"
        >
          <img src={PlusIcon.src} alt="Crear" className="w-5 h-5" />
          Nueva Evolución
        </button>
      )}
    </div>
  );

  return (
    <div className="w-full space-y-6">
      {/* Clinical Record Context Banner - shown when viewing evolutions for a specific HC */}
      {historiaClinicaId && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4">
          {loadingHcInfo ? (
            <div className="flex items-center gap-3 text-slate-500">
              <div className="w-5 h-5 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Cargando información de la Historia Clínica...</span>
            </div>
          ) : clinicalRecordInfo ? (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                  {clinicalRecordInfo.pacienteNombreCompleto?.charAt(0) || '?'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                      HC: {clinicalRecordInfo.numeroHistoriaClinica}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mt-1">
                    {clinicalRecordInfo.pacienteNombreCompleto}
                  </h3>
                  <p className="text-sm text-slate-500">
                    Cédula: {clinicalRecordInfo.pacienteCedula} • {evolutions.length} evolución{evolutions.length !== 1 ? 'es' : ''} registrada{evolutions.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={handleOpenPatientModal}
                  disabled={loadingPatient}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-70"
                >
                  {loadingPatient ? (
                    <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <img src={UserIcon.src} alt="Paciente" className="w-4 h-4" />
                  )}
                  Ver Paciente
                </button>
                <a
                  href="/medical/clinical-records"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Volver a HC
                </a>
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-sm">
              No se pudo cargar la información de la Historia Clínica
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <img src={FileIcon.src} alt="Historial" className="w-6 h-6 text-primary" />
            {historiaClinicaId ? "Historial de Evoluciones" : (isFilterActive ? "Búsqueda de Evoluciones" : "Mis Evoluciones Médicas")}
          </h2>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Buscar por fecha, tipo, médico o HC..."
              className="flex-1 sm:w-64 px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            {/* View Mode Toggle */}
            <div className="hidden md:flex items-center bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                title="Vista de tabla"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'cards' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                title="Vista de tarjetas"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>
            
            {onCreate && (
              <button 
                onClick={onCreate}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-600 transition-colors shadow-sm shadow-primary/30 whitespace-nowrap"
              >
                <img src={PlusIcon.src} alt="Crear" className="w-5 h-5" />
                <span className="hidden sm:inline">Nueva Evolución</span>
              </button>
            )}
          </div>
        </div>

        {/* Date Filters Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="flex-1 w-full sm:w-auto">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Fecha Inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              />
            </div>
            <div className="flex-1 w-full sm:w-auto">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Fecha Fin</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleApplyFilters}
                disabled={loading}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Buscar
              </button>
              {isFilterActive && (
                <button
                  onClick={handleClearFilters}
                  disabled={loading}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-70"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Limpiar
                </button>
              )}
            </div>
          </div>
          
          {/* Active Filter Indicator */}
          {isFilterActive && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                Filtro activo: {fechaInicio && `desde ${fechaInicio}`} {fechaFin && `hasta ${fechaFin}`}
              </span>
              <span className="text-slate-500">
                ({evolutions.length} resultado{evolutions.length !== 1 ? 's' : ''})
              </span>
            </div>
          )}
        </div>
      </div>

      {loading && renderLoading()}
      {error && !loading && renderError()}
      {!loading && !error && evolutions.length === 0 && renderEmptyState()}
      
      {!loading && !error && evolutions.length > 0 && (
        <>
          {/* TABLE VIEW */}
          {viewMode === 'table' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                  {!historiaClinicaId && (
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Historia Clínica</th>
                  )}
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Médico</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredEvolutions.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 whitespace-nowrap">
                      {new Date(ev.fechaConsulta).toLocaleDateString()} <span className="text-slate-400 text-xs ml-1">{new Date(ev.fechaConsulta).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </td>
                    {!historiaClinicaId && (
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                        {ev.numeroHistoriaClinica}
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {ev.tipoConsulta}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {ev.empleadoNombreCompleto}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {(() => {
                        // Calculate completion (7 sections, excluding Obstétrica)
                        const sections = [
                          ev.tieneMotivoAtencion,
                          ev.tieneSignosVitales,
                          ev.tieneValoracionClinica,
                          ev.tieneDiagnosticos,
                          ev.tienePlanesTratamiento,
                          ev.tieneExamenesSolicitados,
                          ev.tieneAltaMedica
                        ];
                        const completed = sections.filter(Boolean).length;
                        const total = sections.length;
                        const percentage = Math.round((completed / total) * 100);
                        
                        // Determine color based on progress
                        let barColor = 'bg-red-400'; // 0% - Pendiente
                        let statusText = 'Pendiente';
                        if (percentage === 100) {
                          barColor = 'bg-green-500';
                          statusText = 'Completada';
                        } else if (percentage > 0) {
                          barColor = 'bg-amber-400';
                          statusText = 'En progreso';
                        }

                        return (
                          <div className="flex flex-col gap-1.5 min-w-[120px]">
                            {/* Progress Bar */}
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${barColor} rounded-full transition-all duration-300`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-slate-500 w-8">{percentage}%</span>
                            </div>
                            {/* Circles - Double click to navigate to edit with specific tab */}
                            <div className="flex items-center gap-1">
                              <span 
                                className={`w-3 h-3 rounded-full border-2 cursor-pointer hover:scale-125 transition-transform ${ev.tieneMotivoAtencion ? 'bg-primary border-primary' : 'bg-transparent border-slate-300'}`}
                                title={`1. Motivo de Atención: ${ev.tieneMotivoAtencion ? '✓ Completado' : '○ Pendiente'} (doble clic para editar)`}
                                onDoubleClick={() => window.location.href = `/medical/evolutions/edit/${ev.id}?tab=motivo`}
                              />
                              <span 
                                className={`w-3 h-3 rounded-full border-2 cursor-pointer hover:scale-125 transition-transform ${ev.tieneSignosVitales ? 'bg-primary border-primary' : 'bg-transparent border-slate-300'}`}
                                title={`2. Signos Vitales: ${ev.tieneSignosVitales ? '✓ Completado' : '○ Pendiente'} (doble clic para editar)`}
                                onDoubleClick={() => window.location.href = `/medical/evolutions/edit/${ev.id}?tab=signos`}
                              />
                              <span 
                                className={`w-3 h-3 rounded-full border-2 cursor-pointer hover:scale-125 transition-transform ${ev.tieneValoracionClinica ? 'bg-primary border-primary' : 'bg-transparent border-slate-300'}`}
                                title={`3. Valoración Clínica: ${ev.tieneValoracionClinica ? '✓ Completado' : '○ Pendiente'} (doble clic para editar)`}
                                onDoubleClick={() => window.location.href = `/medical/evolutions/edit/${ev.id}?tab=valoracion`}
                              />
                              <span 
                                className={`w-3 h-3 rounded-full border-2 cursor-pointer hover:scale-125 transition-transform ${ev.tieneDiagnosticos ? 'bg-primary border-primary' : 'bg-transparent border-slate-300'}`}
                                title={`4. Diagnósticos: ${ev.tieneDiagnosticos ? '✓ Completado' : '○ Pendiente'} (doble clic para editar)`}
                                onDoubleClick={() => window.location.href = `/medical/evolutions/edit/${ev.id}?tab=diagnostico`}
                              />
                              <span 
                                className={`w-3 h-3 rounded-full border-2 cursor-pointer hover:scale-125 transition-transform ${ev.tienePlanesTratamiento ? 'bg-primary border-primary' : 'bg-transparent border-slate-300'}`}
                                title={`5. Tratamiento: ${ev.tienePlanesTratamiento ? '✓ Completado' : '○ Pendiente'} (doble clic para editar)`}
                                onDoubleClick={() => window.location.href = `/medical/evolutions/edit/${ev.id}?tab=tratamiento`}
                              />
                              <span 
                                className={`w-3 h-3 rounded-full border-2 cursor-pointer hover:scale-125 transition-transform ${ev.tieneExamenesSolicitados ? 'bg-primary border-primary' : 'bg-transparent border-slate-300'}`}
                                title={`6. Exámenes: ${ev.tieneExamenesSolicitados ? '✓ Completado' : '○ Pendiente'} (doble clic para editar)`}
                                onDoubleClick={() => window.location.href = `/medical/evolutions/edit/${ev.id}?tab=examenes`}
                              />
                              <span 
                                className={`w-3 h-3 rounded-full border-2 cursor-pointer hover:scale-125 transition-transform ${ev.tieneAltaMedica ? 'bg-green-500 border-green-500' : 'bg-transparent border-green-300'}`}
                                title={`7. Alta Médica: ${ev.tieneAltaMedica ? '✓ Completado' : '○ Pendiente'} (doble clic para editar)`}
                                onDoubleClick={() => window.location.href = `/medical/evolutions/edit/${ev.id}?tab=alta`}
                              />
                            </div>
                            {/* Status Label */}
                            <span className={`text-xs font-medium ${percentage === 100 ? 'text-green-600' : percentage > 0 ? 'text-amber-600' : 'text-red-500'}`}>
                              {statusText} ({completed}/{total})
                            </span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 text-sm text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <button
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          onClick={() => handleViewDetail(ev.id)}
                          title="Ver Detalles"
                        >
                          <img src={EyeIcon.src} alt="Ver" className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          onClick={() => handleEdit(ev.id)}
                          title="Editar"
                        >
                          <img src={EditIcon.src} alt="Editar" className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
          )}

          {/* CARDS VIEW */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvolutions.map((ev) => {
                // Calculate completion for this evolution
                const sections = [
                  ev.tieneMotivoAtencion,
                  ev.tieneSignosVitales,
                  ev.tieneValoracionClinica,
                  ev.tieneDiagnosticos,
                  ev.tienePlanesTratamiento,
                  ev.tieneExamenesSolicitados,
                  ev.tieneAltaMedica
                ];
                const completed = sections.filter(Boolean).length;
                const total = sections.length;
                const percentage = Math.round((completed / total) * 100);
                const statusText = percentage === 100 ? 'Completada' : percentage > 0 ? 'En progreso' : 'Pendiente';
                
                return (
                  <div 
                    key={ev.id} 
                    className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow flex flex-col"
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                          ev.tipoConsulta === 'EMERGENCIA' ? 'bg-red-50 text-red-700' : 
                          ev.tipoConsulta === 'CONTROL' ? 'bg-blue-50 text-blue-700' : 
                          'bg-green-50 text-green-700'
                        }`}>
                          {ev.tipoConsulta}
                        </span>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(ev.fechaConsulta).toLocaleDateString('es-EC', { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleViewDetail(ev.id)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Ver Detalles"
                        >
                          <img src={EyeIcon.src} alt="Ver" className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(ev.id)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Editar"
                        >
                          <img src={EditIcon.src} alt="Editar" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Historia Clínica (if not in patient context) */}
                    {!historiaClinicaId && (
                      <div className="text-sm font-medium text-slate-800 mb-2">
                        HC: {ev.numeroHistoriaClinica}
                      </div>
                    )}

                    {/* Médico */}
                    <div className="text-sm text-slate-600 mb-3 flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {ev.empleadoNombreCompleto}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-auto pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-medium ${
                          percentage === 100 ? 'text-green-600' : percentage > 0 ? 'text-amber-600' : 'text-red-500'
                        }`}>
                          {statusText} ({completed}/{total})
                        </span>
                        <span className="text-xs text-slate-500">{percentage}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${
                            percentage === 100 ? 'bg-green-500' : percentage > 0 ? 'bg-amber-400' : 'bg-red-400'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      {/* Completion Circles */}
                      <div className="flex items-center justify-center gap-1.5 mt-3">
                        <span 
                          className={`w-3 h-3 rounded-full border-2 cursor-pointer hover:scale-125 transition-transform ${ev.tieneMotivoAtencion ? 'bg-primary border-primary' : 'bg-transparent border-slate-300'}`}
                          title={`1. Motivo: ${ev.tieneMotivoAtencion ? '✓' : '○'}`}
                          onDoubleClick={() => window.location.href = `/medical/evolutions/edit/${ev.id}?tab=motivo`}
                        />
                        <span 
                          className={`w-3 h-3 rounded-full border-2 cursor-pointer hover:scale-125 transition-transform ${ev.tieneSignosVitales ? 'bg-primary border-primary' : 'bg-transparent border-slate-300'}`}
                          title={`2. Signos: ${ev.tieneSignosVitales ? '✓' : '○'}`}
                          onDoubleClick={() => window.location.href = `/medical/evolutions/edit/${ev.id}?tab=signos`}
                        />
                        <span 
                          className={`w-3 h-3 rounded-full border-2 cursor-pointer hover:scale-125 transition-transform ${ev.tieneValoracionClinica ? 'bg-primary border-primary' : 'bg-transparent border-slate-300'}`}
                          title={`3. Valoración: ${ev.tieneValoracionClinica ? '✓' : '○'}`}
                          onDoubleClick={() => window.location.href = `/medical/evolutions/edit/${ev.id}?tab=valoracion`}
                        />
                        <span 
                          className={`w-3 h-3 rounded-full border-2 cursor-pointer hover:scale-125 transition-transform ${ev.tieneDiagnosticos ? 'bg-primary border-primary' : 'bg-transparent border-slate-300'}`}
                          title={`4. Diagnósticos: ${ev.tieneDiagnosticos ? '✓' : '○'}`}
                          onDoubleClick={() => window.location.href = `/medical/evolutions/edit/${ev.id}?tab=diagnostico`}
                        />
                        <span 
                          className={`w-3 h-3 rounded-full border-2 cursor-pointer hover:scale-125 transition-transform ${ev.tienePlanesTratamiento ? 'bg-primary border-primary' : 'bg-transparent border-slate-300'}`}
                          title={`5. Tratamiento: ${ev.tienePlanesTratamiento ? '✓' : '○'}`}
                          onDoubleClick={() => window.location.href = `/medical/evolutions/edit/${ev.id}?tab=tratamiento`}
                        />
                        <span 
                          className={`w-3 h-3 rounded-full border-2 cursor-pointer hover:scale-125 transition-transform ${ev.tieneExamenesSolicitados ? 'bg-primary border-primary' : 'bg-transparent border-slate-300'}`}
                          title={`6. Exámenes: ${ev.tieneExamenesSolicitados ? '✓' : '○'}`}
                          onDoubleClick={() => window.location.href = `/medical/evolutions/edit/${ev.id}?tab=examenes`}
                        />
                        <span 
                          className={`w-3 h-3 rounded-full border-2 cursor-pointer hover:scale-125 transition-transform ${ev.tieneAltaMedica ? 'bg-green-500 border-green-500' : 'bg-transparent border-green-300'}`}
                          title={`7. Alta: ${ev.tieneAltaMedica ? '✓' : '○'}`}
                          onDoubleClick={() => window.location.href = `/medical/evolutions/edit/${ev.id}?tab=alta`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Patient Modal */}
      <PatientFormModal
        isOpen={isPatientModalOpen}
        onClose={() => setPatientModalOpen(false)}
        onSave={handlePatientSave}
        patient={patientData}
      />
    </div>
  );
}
