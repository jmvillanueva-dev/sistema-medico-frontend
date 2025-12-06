import { useState, useEffect } from "react";
import { getEvolucionesByHistoriaClinica, getEvolucionesByEmpleado, getEvolucionesByFilter } from "../../services/medicalEvolutionService";
import type { EvolucionMedicaResumen } from "../../types/medicalEvolution";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import EditIcon from "@/icons/system/edit.svg";
import EyeIcon from "@/icons/system/eye.svg";
import FileIcon from "@/icons/system/file-text.svg";
import PlusIcon from "@/icons/system/add-circle.svg";

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

  // Date filter state - initialize from storage
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [isFilterActive, setIsFilterActive] = useState(false);

  // Load stored filters on mount
  useEffect(() => {
    const storedFilters = getStoredFilters();
    if (storedFilters.isActive) {
      setFechaInicio(storedFilters.fechaInicio);
      setFechaFin(storedFilters.fechaFin);
      setIsFilterActive(true);
    }
  }, []);

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
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Indicadores</th>
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
                      <div className="flex gap-2">
                        {ev.tieneSignosVitales && (
                          <span className="w-2 h-2 rounded-full bg-green-500" title="Signos Vitales"></span>
                        )}
                        {ev.tieneDiagnosticos && (
                          <span className="w-2 h-2 rounded-full bg-red-500" title="Diagnósticos"></span>
                        )}
                        {ev.tieneTratamientos && (
                          <span className="w-2 h-2 rounded-full bg-purple-500" title="Tratamientos"></span>
                        )}
                      </div>
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
    </div>
  );
}
