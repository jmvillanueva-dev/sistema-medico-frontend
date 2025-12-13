import { useState, useEffect } from "react";
import { getPatients, deletePatient, searchPatients } from "../services/patientService";
import type { Patient } from "../types/patient";
import ConfirmationModal from "./ConfirmationModal";
import ViewToggle from "./common/ViewToggle";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import EditIcon from "@/icons/system/edit.svg";
import DeleteIcon from "@/icons/system/delete.svg";
import SearchIcon from "@/icons/system/search.svg";

// Placeholder for PatientFormModal
import PatientFormModal from "./PatientFormModal"; 

interface PatientsManagerProps {
  canDelete?: boolean;
}

export default function PatientsManager({ canDelete = false }: PatientsManagerProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination state (simple for now, can be expanded if backend supports metadata)
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true); // Assuming true initially

  // Modal states
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      let response;
      if (searchTerm) {
        response = await searchPatients(searchTerm);
      } else {
        response = await getPatients(page, 10); // Page size 10
      }
      
      if (response.data.success) {
         setPatients(response.data.data);
         // Logic to determine if there are more pages would go here based on response metadata
      }
      setError(null);
    } catch (err) {
      const errorMsg = "Error al cargar los pacientes.";
      setError(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
    
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
  }, [page, searchTerm]); // Refetch when page or search changes

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0); // Reset to first page on search
    fetchPatients();
  };

  const handleCreate = () => {
    setEditingPatient(null);
    setFormModalOpen(true);
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setFormModalOpen(true);
  };

  const handleDelete = (patient: Patient) => {
    setPatientToDelete(patient);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!patientToDelete) return;
    try {
      await deletePatient(patientToDelete.id);
      setPatients(patients.filter((p) => p.id !== patientToDelete.id));
      toast.success(`✅ Paciente ${patientToDelete.primerNombre} ${patientToDelete.apellidoPaterno} eliminado correctamente.`);
      setDeleteModalOpen(false);
      setPatientToDelete(null);
    } catch (err) {
      toast.error("Error al eliminar el paciente.");
      console.error(err);
    }
  };

  const handleSave = () => {
    setFormModalOpen(false);
    fetchPatients();
  };

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-3">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
      <span>Cargando pacientes...</span>
    </div>
  );

  const renderError = () => (
    <div className="p-4 text-red-600 bg-red-50 rounded-lg text-center">
      {error}
    </div>
  );

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-white rounded-xl border border-slate-200 border-dashed">
      <span className="text-5xl mb-4 opacity-50">👥</span>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">No se encontraron pacientes</h3>
      <p className="text-sm text-slate-500 max-w-xs mx-auto">
        No hay pacientes registrados o que coincidan con la búsqueda.
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
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Paciente</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Cédula</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Contacto</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Ubicación</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">
                          {patient.primerNombre.charAt(0)}{patient.apellidoPaterno.charAt(0)}
                        </div>
                        <div>
                          {patient.primerNombre} {patient.apellidoPaterno}
                          <div className="text-xs text-slate-500 font-normal">{patient.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{patient.cedula}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{patient.telefono}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{patient.canton}, {patient.provincia?.nombre}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        patient.estaActivo 
                          ? "bg-green-50 text-green-700 border-green-200" 
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${patient.estaActivo ? "bg-green-600" : "bg-red-600"}`}></span>
                        {patient.estaActivo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          onClick={() => handleEdit(patient)}
                          title="Editar"
                        >
                          <img src={EditIcon.src} alt="Editar" className="w-4 h-4" />
                        </button>
                        {canDelete && (
                          <button
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            onClick={() => handleDelete(patient)}
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
          {patients.map((patient) => (
            <div key={patient.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative">
              <div className="absolute top-4 right-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  patient.estaActivo 
                    ? "bg-green-50 text-green-700 border-green-200" 
                    : "bg-red-50 text-red-700 border-red-200"
                }`}>
                  {patient.estaActivo ? "Activo" : "Inactivo"}
                </span>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg font-bold">
                  {patient.primerNombre.charAt(0)}{patient.apellidoPaterno.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{patient.primerNombre} {patient.apellidoPaterno}</h3>
                  <p className="text-sm text-slate-500">{patient.cedula}</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Email:</span>
                  <span className="text-slate-900 font-medium truncate max-w-[150px]" title={patient.email || ""}>{patient.email || "-"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Teléfono:</span>
                  <span className="text-slate-900 font-medium">{patient.telefono || "-"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Ubicación:</span>
                  <span className="text-slate-900 font-medium">{patient.canton}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100">
                 <button
                      className="flex-1 inline-flex justify-center items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-primary transition-colors"
                      onClick={() => handleEdit(patient)}
                    >
                      <img src={EditIcon.src} alt="Editar" className="w-4 h-4" />
                      <span>Editar</span>
                    </button>
                    {canDelete && (
                      <button
                        className="flex-1 inline-flex justify-center items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                        onClick={() => handleDelete(patient)}
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
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Pacientes</h1>
          <p className="text-slate-500 text-sm mt-1">Administra la información de los pacientes</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <form onSubmit={handleSearch} className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Buscar paciente..."
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
              Nuevo Paciente
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-[400px]">
        {loading && renderLoading()}
        {error && !loading && renderError()}
        {!loading && !error && patients.length === 0 && renderEmptyState()}
        {!loading && !error && patients.length > 0 && renderContent()}
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que deseas eliminar a ${patientToDelete?.primerNombre} ${patientToDelete?.apellidoPaterno}? Esta acción no se puede deshacer.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
        confirmButtonText="Sí, eliminar"
      />

      {isFormModalOpen && (
        <PatientFormModal
          isOpen={isFormModalOpen}
          onClose={() => setFormModalOpen(false)}
          onSave={handleSave}
          patient={editingPatient}
        />
      )}
    </div>
  );
}
