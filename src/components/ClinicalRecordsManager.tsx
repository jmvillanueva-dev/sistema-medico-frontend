import { useState, useEffect } from "react";
import { getClinicalRecords, deleteClinicalRecord } from "../services/clinicalRecordService";
import type { ClinicalRecord } from "../types/clinicalRecord";
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
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                                record.totalEvoluciones > 0 
                                ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 cursor-pointer" 
                                : "bg-slate-50 text-slate-500 border-slate-200 cursor-default"
                            }`}
                            onClick={() => {
                                if (record.totalEvoluciones > 0) {
                                    // Future navigation: /medical/evolutions?patientId=${record.pacienteId}
                                    toast.info(`Ver ${record.totalEvoluciones} evoluciones de ${record.pacienteNombreCompleto}`);
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
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                        record.totalEvoluciones > 0 
                        ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 cursor-pointer" 
                        : "bg-slate-50 text-slate-500 border-slate-200 cursor-default"
                    }`}
                    onClick={() => {
                        if (record.totalEvoluciones > 0) {
                            toast.info(`Ver ${record.totalEvoluciones} evoluciones de ${record.pacienteNombreCompleto}`);
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
              placeholder="Buscar historia..."
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

      <div className="min-h-[400px]">
        {loading && renderLoading()}
        {error && !loading && renderError()}
        {!loading && !error && records.length === 0 && renderEmptyState()}
        {!loading && !error && records.length > 0 && renderContent()}
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que deseas eliminar la historia clínica #${recordToDelete?.numeroHistoriaClinica}? Esta acción no se puede deshacer.`}
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
