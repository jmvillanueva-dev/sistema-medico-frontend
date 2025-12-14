import { useState, useEffect } from "react";
import { getClinicalRecords, deleteClinicalRecord, getClinicalRecordByNumber, getClinicalRecordByPatientId, searchClinicalRecordsByDate } from "../services/clinicalRecordService";
import { searchPatients } from "../services/patientService";
import type { ClinicalRecord } from "../types/clinicalRecord";
import type { Patient } from "../types/patient";
import ConfirmationModal from "./ConfirmationModal";
import ClinicalRecordFormModal from "./ClinicalRecordFormModal";
import ClinicalRecordDetailsModal from "./ClinicalRecordDetailsModal";
import ViewToggle from "./common/ViewToggle";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import EditIcon from "@/icons/system/edit.svg";
import DeleteIcon from "@/icons/system/delete.svg";
import SearchIcon from "@/icons/system/search.svg";
import FileIcon from "@/icons/system/file-text.svg";
import EyeIcon from "@/icons/system/eye.svg";

interface ClinicalRecordsManagerProps {
  canDelete?: boolean;
}

export default function ClinicalRecordsManager({ canDelete = false }: ClinicalRecordsManagerProps) {
  const [records, setRecords] = useState<ClinicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = useState(0);
  // const [hasMore, setHasMore] = useState(true); // Backend pagination support needed

  // Modal states
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<ClinicalRecord | null>(null);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ClinicalRecord | null>(null);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsRecord, setDetailsRecord] = useState<ClinicalRecord | null>(null);

  // Advanced search states
  const [searchType, setSearchType] = useState<'all' | 'numero' | 'paciente' | 'fecha'>('all');
  const [advancedSearchTerm, setAdvancedSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<ClinicalRecord | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Patient search states (for 'paciente' search type)
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [foundPatients, setFoundPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isSearchingPatients, setIsSearchingPatients] = useState(false);

  // Date search states
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const handleViewDetails = (record: ClinicalRecord) => {
    setDetailsRecord(record);
    setDetailsModalOpen(true);
  };

  const fetchRecords = async () => {
    try {
      setLoading(true);
      // Note: Search functionality for records might need backend support (e.g., search by patient name)
      // For now, we fetch all and filter client-side or assume backend search if implemented
      const response = await getClinicalRecords(page, 10);

      if (response.data.success) {
        setRecords(response.data.data);
      }
      setError(null);
    } catch (err) {
      const errorMsg = "Error al cargar las historias clínicas.";
      setError(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();

    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode("grid");
      } else {
        setViewMode("list");
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [page]);

  const filteredRecords = records.filter((record) => {
    if (!searchTerm) return true;
    const lowerSearch = searchTerm.toLowerCase();
    return (
      record.numeroHistoriaClinica.toLowerCase().includes(lowerSearch) ||
      (record.pacienteNombreCompleto && record.pacienteNombreCompleto.toLowerCase().includes(lowerSearch)) ||
      (record.pacienteCedula && record.pacienteCedula.toLowerCase().includes(lowerSearch))
    );
  });

  // Search patients by name/surname/cedula
  const handleSearchPatients = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientSearchTerm.trim()) {
      toast.warning('Ingrese un término de búsqueda');
      return;
    }

    setIsSearchingPatients(true);
    try {
      const response = await searchPatients(patientSearchTerm);
      if (response.data.success) {
        setFoundPatients(response.data.data);
        if (response.data.data.length === 0) {
          toast.info('No se encontraron pacientes');
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
  const handleSelectPatientForSearch = async (patient: Patient) => {
    setSelectedPatient(patient);
    setIsSearching(true);
    setHasSearched(true);
    setSearchResult(null);

    try {
      const response = await getClinicalRecordByPatientId(patient.id);
      if (response.data.success && response.data.data) {
        setSearchResult(response.data.data);
        toast.success('Historia clínica encontrada');
      } else {
        toast.info(`${ patient.primerNombre } ${ patient.apellidoPaterno } no tiene historia clínica registrada`);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        toast.info(`${ patient.primerNombre } ${ patient.apellidoPaterno } no tiene historia clínica registrada`);
      } else {
        toast.error('Error al buscar la historia clínica');
        console.error(err);
      }
    } finally {
      setIsSearching(false);
    }
  };

  // Advanced search handler (for numero search)
  const handleAdvancedSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (searchType === 'numero') {
      if (!advancedSearchTerm.trim()) {
        toast.warning('Ingrese el número de historia clínica');
        return;
      }

      setIsSearching(true);
      setHasSearched(true);
      setSearchResult(null);

      try {
        const response = await getClinicalRecordByNumber(advancedSearchTerm.trim());
        if (response.data.success && response.data.data) {
          setSearchResult(response.data.data);
          toast.success('Historia clínica encontrada');
        } else {
          toast.info('No se encontró ninguna historia clínica');
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          toast.info('No se encontró ninguna historia clínica con ese número');
        } else {
          toast.error('Error al buscar la historia clínica');
          console.error(err);
        }
      } finally {
        setIsSearching(false);
      }
    }
  };

  // Date search handler
  const handleDateSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateRange.start || !dateRange.end) {
      toast.warning('Seleccione ambas fechas');
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    setSearchResult(null);
    // Clear list to show only results if needed, but here we might want to replace the main list or show a separate result list
    // The current UI pattern shows a single result in "searchResult" for patient/number search, but date search returns a list.
    // We should probably update the main 'records' list or handle it similarly.
    // For consistency with current pattern which seems to handle single results specially, let's see.
    // Actually, the requirement implies filtering the main list.

    try {
      const response = await searchClinicalRecordsByDate(dateRange.start, dateRange.end);
      if (response.data.success) {
        setRecords(response.data.data);
        if (response.data.data.length === 0) {
          toast.info('No se encontraron historias en ese rango de fechas');
        } else {
          toast.success(`Se encontraron ${ response.data.data.length } historias clínicas`);
        }
      }
    } catch (err) {
      toast.error('Error al buscar por fechas');
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  // Clear search and show all records
  const handleClearSearch = () => {
    setAdvancedSearchTerm('');
    setSearchResult(null);
    setHasSearched(false);
    setSearchType('all');
    setPatientSearchTerm('');
    setFoundPatients([]);
    setSelectedPatient(null);
    setDateRange({ start: '', end: '' });
    fetchRecords(); // Reload initial data
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleCreate = () => {
    setEditingRecord(null);
    setFormModalOpen(true);
  };

  const handleEdit = (record: ClinicalRecord) => {
    setEditingRecord(record);
    setFormModalOpen(true);
  };

  const handleDelete = (record: ClinicalRecord) => {
    setRecordToDelete(record);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;
    try {
      await deleteClinicalRecord(recordToDelete.id);
      setRecords(records.filter((r) => r.id !== recordToDelete.id));
      toast.success(`✅ Historia clínica eliminada correctamente.`);
      setDeleteModalOpen(false);
      setRecordToDelete(null);
    } catch (err) {
      toast.error("Error al eliminar la historia clínica.");
      console.error(err);
    }
  };

  const handleSave = () => {
    setFormModalOpen(false);
    fetchRecords();
  };

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-3">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
      <span>Cargando historias clínicas...</span>
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
      <h3 className="text-lg font-semibold text-slate-900 mb-2">No se encontraron historias clínicas</h3>
      <p className="text-sm text-slate-500 max-w-xs mx-auto">
        No hay historias clínicas registradas.
      </p>
    </div>
  );

  const renderContent = () => {
    if (viewMode === "list") {
      return (
        <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">N° Historia</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Paciente</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Cédula</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha Creación</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Evoluciones</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {record.numeroHistoriaClinica}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {record.pacienteNombreCompleto || "Sin Datos"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {record.pacienteCedula || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {record.fechaCreacion ? new Date(record.fechaCreacion).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <button
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors border ${ record.totalEvoluciones > 0
                          ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 cursor-pointer"
                          : "bg-slate-50 text-slate-500 border-slate-200 cursor-default"
                          }`}
                        onClick={() => {
                          if (record.totalEvoluciones > 0) {
                            window.location.href = `/medical/evolutions?historiaClinicaId=${ record.id }`;
                          }
                        }}
                      >
                        <span className="font-semibold">Total: {record.totalEvoluciones}</span>
                        {record.totalEvoluciones > 0 && (
                          <>
                            <span className="w-px h-3 bg-current opacity-30 mx-0.5"></span>
                            <span className="font-bold hover:underline">Ver</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          onClick={() => handleViewDetails(record)}
                          title="Ver Detalles"
                        >
                          <img src={EyeIcon.src} alt="Ver" className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          onClick={() => handleEdit(record)}
                          title="Editar"
                        >
                          <img src={EditIcon.src} alt="Editar" className="w-4 h-4" />
                        </button>
                        {canDelete && (
                          <button
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            onClick={() => handleDelete(record)}
                            title="Eliminar"
                          >
                            <img src={DeleteIcon.src} alt="Eliminar" className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    } else {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map((record) => (
            <div key={record.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative flex flex-col">

              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg font-bold shrink-0">
                  <img src={FileIcon.src} alt="Historia" className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 truncate">Historia #{record.numeroHistoriaClinica}</h3>
                  <p className="text-sm text-slate-500 truncate" title={record.pacienteNombreCompleto}>
                    {record.pacienteNombreCompleto}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-5 flex-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Cédula:</span>
                  <span className="text-slate-900 font-medium">{record.pacienteCedula || "-"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Fecha Creación:</span>
                  <span className="text-slate-900 font-medium">{record.fechaCreacion ? new Date(record.fechaCreacion).toLocaleDateString() : "-"}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-slate-500">Evoluciones:</span>
                  <button
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors border ${ record.totalEvoluciones > 0
                      ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 cursor-pointer"
                      : "bg-slate-50 text-slate-500 border-slate-200 cursor-default"
                      }`}
                    onClick={() => {
                      if (record.totalEvoluciones > 0) {
                        toast.info(`Ver ${ record.totalEvoluciones } evoluciones de ${ record.pacienteNombreCompleto }`);
                      }
                    }}
                  >
                    <span className="font-semibold">Total: {record.totalEvoluciones}</span>
                    {record.totalEvoluciones > 0 && (
                      <>
                        <span className="w-px h-3 bg-current opacity-30 mx-0.5"></span>
                        <span className="font-bold hover:underline">Ver</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100 mt-auto">
                <button
                  className="flex-1 inline-flex justify-center items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-primary transition-colors"
                  onClick={() => handleViewDetails(record)}
                >
                  <img src={EyeIcon.src} alt="Ver" className="w-4 h-4" />
                  <span>Ver</span>
                </button>
                <button
                  className="flex-1 inline-flex justify-center items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-primary transition-colors"
                  onClick={() => handleEdit(record)}
                >
                  <img src={EditIcon.src} alt="Editar" className="w-4 h-4" />
                  <span>Editar</span>
                </button>
                {canDelete && (
                  <button
                    className="flex-1 inline-flex justify-center items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                    onClick={() => handleDelete(record)}
                  >
                    <img src={DeleteIcon.src} alt="Eliminar" className="w-4 h-4" />
                    <span>Eliminar</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="w-full">
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 99999 }}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Historias Clínicas</h1>
          <p className="text-slate-500 text-sm mt-1">Gestión de historias clínicas de pacientes</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <form onSubmit={handleSearch} className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Buscar en los resultados..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <img
              src={SearchIcon.src}
              alt="Buscar"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            />
          </form>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <ViewToggle viewMode={viewMode} onToggle={setViewMode} />
            <button
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-600 transition-colors shadow-sm shadow-primary/30 flex-1 sm:flex-none"
              onClick={handleCreate}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Nueva Historia
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Search Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-shrink-0 relative group">
            <label className="block text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1">
              Buscar por
              {/* General Info Tooltip */}
              <span className="text-slate-400 hover:text-blue-500 cursor-help transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </span>
            </label>
            <select
              value={searchType}
              onChange={(e) => {
                const newType = e.target.value as 'all' | 'numero' | 'paciente' | 'fecha';
                setSearchType(newType);
                // Clear search values when changing type (but not the type itself)
                setAdvancedSearchTerm('');
                setSearchResult(null);
                setHasSearched(false);
                setPatientSearchTerm('');
                setFoundPatients([]);
                setSelectedPatient(null);
                setDateRange({ start: '', end: '' });
                if (newType === 'all') fetchRecords();
              }}
              className="w-full sm:w-48 h-10 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">Filtrar los resultados</option>
              <option value="numero">N° Historia Clínica</option>
              <option value="paciente">Buscar Paciente</option>
              <option value="fecha">Rango de Fechas</option>
            </select>

            {/* Contextual Tooltip based on selection */}
            <div className="absolute top-full left-0 mt-2 w-64 p-3 bg-white rounded-lg shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="text-xs text-slate-600">
                {searchType === 'all' && "Filtra los resultados visibles en la tabla por texto."}
                {searchType === 'numero' && "Busca una historia clínica específica por su número único."}
                {searchType === 'paciente' && "Busca una historia clínica asociada a un paciente."}
                {searchType === 'fecha' && "Muestra historias clínicas creadas dentro de un rango de fechas."}
              </div>
            </div>
          </div>

          {/* Filtro local */}
          {searchType === 'all' && (
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Término de búsqueda</label>
              <input
                type="text"
                placeholder="Buscar en la tabla por nombre, cédula o N° Historia Clínica..."
                className="w-full h-10 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}

          {/* Búsqueda por número de HC */}
          {searchType === 'numero' && (
            <form onSubmit={handleAdvancedSearch} className="flex-1 flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Número de Historia Clínica</label>
                <input
                  type="text"
                  placeholder="Ej: 1722965454"
                  className="w-full h-10 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={advancedSearchTerm}
                  onChange={(e) => setAdvancedSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2 self-end">
                <button
                  type="submit"
                  disabled={isSearching}
                  className="inline-flex items-center justify-center gap-2 px-4 h-10 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
                >
                  {isSearching ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                  Buscar
                </button>
                {hasSearched && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="inline-flex items-center justify-center gap-2 px-4 h-10 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Limpiar
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Búsqueda por Paciente */}
          {searchType === 'paciente' && (
            <form onSubmit={handleSearchPatients} className="flex-1 flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Buscar paciente por nombre, apellido o cédula</label>
                <input
                  type="text"
                  placeholder="Ej: Juan Pérez o 1712345678"
                  className="w-full h-10 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={patientSearchTerm}
                  onChange={(e) => setPatientSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2 self-end">
                <button
                  type="submit"
                  disabled={isSearchingPatients}
                  className="inline-flex items-center justify-center gap-2 px-4 h-10 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
                >
                  {isSearchingPatients ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                  Buscar
                </button>
                {(foundPatients.length > 0 || hasSearched) && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="inline-flex items-center justify-center gap-2 px-4 h-10 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Limpiar
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Búsqueda por rango de fechas */}
          {searchType === 'fecha' && (
            <form onSubmit={handleDateSearch} className="flex-1 flex gap-2">
              <div className="flex-1 flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Fecha Inicio</label>
                  <input
                    type="date"
                    className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Fecha Fin</label>
                  <input
                    type="date"
                    className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 self-end">
                <button
                  type="submit"
                  disabled={isSearching}
                  className="inline-flex items-center justify-center gap-2 px-4 h-10 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
                >
                  {isSearching ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                  Buscar
                </button>
                {hasSearched && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="inline-flex items-center justify-center gap-2 px-4 h-10 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Limpiar
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Patient Search Results List */}
        {searchType === 'paciente' && foundPatients.length > 0 && !hasSearched && (
          <div className="border border-slate-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
            {foundPatients.map((patient) => (
              <div
                key={patient.id}
                className="p-3 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-0 flex justify-between items-center transition-colors"
                onClick={() => handleSelectPatientForSearch(patient)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                    {patient.primerNombre.charAt(0)}{patient.apellidoPaterno.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">
                      {patient.primerNombre} {patient.segundoNombre || ''} {patient.apellidoPaterno} {patient.apellidoMaterno || ''}
                    </div>
                    <div className="text-xs text-slate-500">
                      Cédula: {patient.cedula}
                    </div>
                  </div>
                </div>
                <div className="text-primary text-sm font-medium hover:underline">
                  Buscar HC →
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search Result Display */}
        {hasSearched && searchType !== 'all' && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            {searchResult ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold">
                    {searchResult.pacienteNombreCompleto?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{searchResult.pacienteNombreCompleto}</p>
                    <p className="text-sm text-slate-500">HC: {searchResult.numeroHistoriaClinica} • Cédula: {searchResult.pacienteCedula}</p>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleViewDetails(searchResult)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <img src={EyeIcon.src} alt="Ver" className="w-4 h-4" />
                    Ver Detalles
                  </button>
                  <button
                    onClick={() => window.location.href = `/medical/evolutions?historiaClinicaId=${ searchResult.id }`}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    Ver Evoluciones
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-700">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-sm font-medium">
                  {selectedPatient
                    ? `${ selectedPatient.primerNombre } ${ selectedPatient.apellidoPaterno } no tiene historia clínica registrada.`
                    : 'No se encontró ninguna historia clínica con ese criterio.'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="min-h-[400px]">
        {loading && renderLoading()}
        {error && !loading && renderError()}
        {!loading && !error && records.length === 0 && renderEmptyState()}
        {!loading && !error && records.length > 0 && renderContent()}
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que deseas eliminar la historia clínica #${ recordToDelete?.numeroHistoriaClinica }? Esta acción no se puede deshacer.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
        confirmButtonText="Sí, eliminar"
      />

      {isFormModalOpen && (
        <ClinicalRecordFormModal
          isOpen={isFormModalOpen}
          onClose={() => setFormModalOpen(false)}
          onSave={handleSave}
          record={editingRecord}
        />
      )}

      <ClinicalRecordDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        record={detailsRecord}
        onEdit={(record) => {
          setDetailsModalOpen(false);
          handleEdit(record);
        }}
      />
    </div>
  );
}
