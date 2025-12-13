import { useState, useEffect } from "react";
import { getEmployees, deleteEmployee, getEmployeeById } from "../services/api";
import ConfirmationModal from "./ConfirmationModal";
import EmployeeFormModal from "./EmployeeFormModal";
import ViewToggle from "./common/ViewToggle";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import EditIcon from "@/icons/system/edit.svg";
import DeleteIcon from "@/icons/system/delete.svg";

// Interfaz extendida para incluir el email opcional
export interface Employee {
  id: string;
  nombre: string;
  apellido: string;
  cedula: string;
  especialidad: string;
  codigoProfesional: string;
  telefono: string;
  estaActivo: boolean;
  fechaCreacion: string | null;
  email?: string; // Añadido para el formulario de email
}

export default function EmployeesManager() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Estados para modales
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(
    null
  );
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await getEmployees();
      setEmployees(response.data.data);
      setError(null);
    } catch (err) {
      const errorMsg =
        "Error al cargar los empleados. Por favor, intente más tarde.";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    
    // Determinar vista inicial basada en el ancho de pantalla
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode("grid");
      } else {
        setViewMode("list");
      }
    };

    // Set initial
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Lógica para CRUD ---

  const handleCreate = () => {
    setEditingEmployee(null); // Modo creación
    setFormModalOpen(true);
  };

  const handleEdit = async (employee: Employee) => {
    try {
      // Obtenemos los datos completos para tener el email
      const response = await getEmployeeById(employee.id);
      setEditingEmployee(response.data.data); // Modo edición con datos completos
      setFormModalOpen(true);
    } catch (err) {
      const errorMsg = "Error al obtener los datos del empleado.";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error(err);
    }
  };

  const handleDelete = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!employeeToDelete) return;
    try {
      await deleteEmployee(employeeToDelete.id);
      setEmployees(employees.filter((emp) => emp.id !== employeeToDelete.id));
      toast.success(
        `✅ Empleado ${employeeToDelete.nombre} ${employeeToDelete.apellido} eliminado correctamente.`
      );
      setDeleteModalOpen(false);
      setEmployeeToDelete(null);
    } catch (err) {
      const errorMsg = "Error al eliminar el empleado.";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error(err);
    }
  };

  const handleSave = () => {
    setFormModalOpen(false);
    fetchEmployees(); // Recarga la lista de empleados
  };

  // Render Loading State
  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-3">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
      <span>Cargando empleados...</span>
    </div>
  );

  // Render Error State
  const renderError = () => (
    <div className="flex items-center justify-center gap-2 p-6 text-red-600 bg-red-50 rounded-lg m-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" x2="12" y1="8" y2="12" />
        <line x1="12" x2="12.01" y1="16" y2="16" />
      </svg>
      <span>{error}</span>
    </div>
  );

  // Render Empty State
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-white rounded-xl border border-slate-200 border-dashed">
      <span className="text-5xl mb-4 opacity-50">📭</span>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">No se encontraron empleados</h3>
      <p className="text-sm text-slate-500 max-w-xs mx-auto">
        Aún no hay empleados registrados. Crea uno nuevo para comenzar.
      </p>
    </div>
  );

  // Render Content based on ViewMode
  const renderContent = () => {
    if (viewMode === "list") {
      return (
        <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Cédula</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Especialidad</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Teléfono</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-50 text-primary flex items-center justify-center text-xs font-bold">
                          {employee.nombre.charAt(0)}{employee.apellido.charAt(0)}
                        </div>
                        {employee.nombre} {employee.apellido}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{employee.cedula}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {employee.especialidad}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{employee.telefono}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          employee.estaActivo 
                            ? "bg-green-50 text-green-700 border-green-200" 
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${employee.estaActivo ? "bg-green-600" : "bg-red-600"}`}></span>
                        {employee.estaActivo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          onClick={() => handleEdit(employee)}
                          title="Editar empleado"
                        >
                          <img src={EditIcon.src} alt="Editar" className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          onClick={() => handleDelete(employee)}
                          title="Eliminar"
                        >
                          <img src={DeleteIcon.src} alt="Eliminar" className="w-4 h-4" />
                        </button>
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
          {employees.map((employee) => (
            <div key={employee.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative">
              <div className="absolute top-4 right-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    employee.estaActivo 
                      ? "bg-green-50 text-green-700 border-green-200" 
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {employee.estaActivo ? "Activo" : "Inactivo"}
                </span>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 text-primary flex items-center justify-center text-lg font-bold">
                  {employee.nombre.charAt(0)}{employee.apellido.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{employee.nombre} {employee.apellido}</h3>
                  <p className="text-sm text-slate-500">{employee.especialidad}</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Cédula:</span>
                  <span className="text-slate-900 font-medium">{employee.cedula}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Teléfono:</span>
                  <span className="text-slate-900 font-medium">{employee.telefono}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100">
                 <button
                      className="flex-1 inline-flex justify-center items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-primary transition-colors"
                      onClick={() => handleEdit(employee)}
                    >
                      <img
                        src={EditIcon.src}
                        alt="Editar"
                        className="w-4 h-4"
                      />
                      <span>Editar</span>
                    </button>
                    <button
                      className="flex-1 inline-flex justify-center items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                      onClick={() => handleDelete(employee)}
                    >
                      <img
                        src={DeleteIcon.src}
                        alt="Eliminar"
                        className="w-4 h-4"
                      />
                      <span>Eliminar</span>
                    </button>
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
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Empleados</h1>
          <p className="text-slate-500 text-sm mt-1">Administra el personal médico y administrativo</p>
        </div>
        
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
            Nuevo Empleado
          </button>
        </div>
      </div>

      <div className="min-h-[400px]">
        {loading && renderLoading()}
        {error && !loading && renderError()}
        {!loading && !error && employees.length === 0 && renderEmptyState()}
        {!loading && !error && employees.length > 0 && renderContent()}
      </div>

      {/* --- Modales --- */}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que deseas eliminar a ${employeeToDelete?.nombre} ${employeeToDelete?.apellido}? Esta acción no se puede deshacer.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
        confirmButtonText="Sí, eliminar"
      />

      <EmployeeFormModal
        isOpen={isFormModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSave={handleSave}
        employee={editingEmployee}
      />
    </div>
  );
}
