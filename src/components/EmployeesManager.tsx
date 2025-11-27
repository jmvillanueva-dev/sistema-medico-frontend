import { useState, useEffect } from "react";
import { getEmployees, deleteEmployee, getEmployeeById } from "../services/api";
import ConfirmationModal from "./ConfirmationModal";
import EmployeeFormModal from "./EmployeeFormModal";
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
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <span className="text-5xl mb-4 opacity-50">📭</span>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">No se encontraron empleados</h3>
      <p className="text-sm text-slate-500 max-w-xs">
        Aún no hay empleados registrados. Crea uno nuevo para comenzar.
      </p>
    </div>
  );

  // Render Table
  const renderTable = () => (
    <div className="w-full">
      {/* Desktop Table */}
      <table className="w-full border-collapse bg-white hidden md:table">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cédula</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Especialidad</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Teléfono</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {employees.map((employee) => (
            <tr key={employee.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 text-sm text-slate-900">{`${employee.nombre} ${employee.apellido}`}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{employee.cedula}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{employee.especialidad}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{employee.telefono}</td>
              <td className="px-4 py-3 text-sm">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    employee.estaActivo 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {employee.estaActivo ? "Activo" : "Inactivo"}
                </span>
              </td>
              <td className="px-4 py-3 text-sm">
                <div className="flex gap-2">
                  <button
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                    onClick={() => handleEdit(employee)}
                    title="Editar empleado"
                  >
                    <img
                      src={EditIcon.src}
                      alt="Editar"
                      className="w-4 h-4"
                    />
                    <span>Editar</span>
                  </button>
                  <button
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                    onClick={() => handleDelete(employee)}
                    title="Eliminar permanentemente este registro"
                  >
                    <img
                      src={DeleteIcon.src}
                      alt="Eliminar"
                      className="w-4 h-4"
                    />
                    <span>Eliminar</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-4">
        {employees.map((employee) => (
          <div key={employee.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{`${employee.nombre} ${employee.apellido}`}</h3>
                <p className="text-xs text-slate-500">{employee.especialidad}</p>
              </div>
              <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    employee.estaActivo 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {employee.estaActivo ? "Activo" : "Inactivo"}
                </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-4">
              <div>
                <span className="font-medium text-slate-500 block">Cédula:</span>
                {employee.cedula}
              </div>
              <div>
                <span className="font-medium text-slate-500 block">Teléfono:</span>
                {employee.telefono}
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-100">
               <button
                    className="flex-1 inline-flex justify-center items-center gap-1 px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
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
                    className="flex-1 inline-flex justify-center items-center gap-1 px-3 py-2 text-xs font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
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
    </div>
  );

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
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-900 m-0">Gestión de Empleados</h1>
        <button className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-600 transition-colors shadow-sm w-full sm:w-auto" onClick={handleCreate}>
          + Crear Nuevo Empleado
        </button>
      </div>

      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
        {loading && renderLoading()}
        {error && !loading && renderError()}
        {!loading && !error && employees.length === 0 && renderEmptyState()}
        {!loading && !error && employees.length > 0 && renderTable()}
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
