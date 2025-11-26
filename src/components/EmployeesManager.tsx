import { useState, useEffect } from "react";
import { getEmployees, deleteEmployee, getEmployeeById } from "../services/api";
import ConfirmationModal from "./ConfirmationModal";
import EmployeeFormModal from "./EmployeeFormModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./EmployeesManager.css";

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
    <div className="loading-message">
      <span>Cargando empleados...</span>
    </div>
  );

  // Render Error State
  const renderError = () => (
    <div className="error-message">
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
    <div className="empty-state">
      <span className="empty-state-icon">📭</span>
      <h3 className="empty-state-title">No se encontraron empleados</h3>
      <p className="empty-state-description">
        Aún no hay empleados registrados. Crea uno nuevo para comenzar.
      </p>
    </div>
  );

  // Render Table
  const renderTable = () => (
    <table className="responsive-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Cédula</th>
          <th>Especialidad</th>
          <th>Teléfono</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {employees.map((employee) => (
          <tr key={employee.id}>
            <td data-label="Nombre">{`${employee.nombre} ${employee.apellido}`}</td>
            <td data-label="Cédula">{employee.cedula}</td>
            <td data-label="Especialidad">{employee.especialidad}</td>
            <td data-label="Teléfono">{employee.telefono}</td>
            <td data-label="Estado">
              <span
                className={`status-badge ${
                  employee.estaActivo ? "active" : "inactive"
                }`}
              >
                {employee.estaActivo ? "✅ Activo" : "❌ Inactivo"}
              </span>
            </td>
            <td data-label="Acciones">
              <div className="action-buttons">
                <button
                  className="btn btn-blue-system"
                  onClick={() => handleEdit(employee)}
                  title="Editar empleado"
                >
                  <img
                    src={EditIcon.src}
                    alt="Editar"
                    className="icon icon-scale"
                  />
                  <span>Editar</span>
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(employee)}
                  title="Eliminar permanentemente este registro"
                >
                  <img
                    src={DeleteIcon.src}
                    alt="Eliminar"
                    className="icon icon-scale"
                  />
                  <span>Eliminar</span>
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="employees-manager">
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
      <div className="toolbar">
        <h1>Gestión de Empleados</h1>
        <button className="btn btn-primary" onClick={handleCreate}>
          + Crear Nuevo Empleado
        </button>
      </div>

      <div className="table-container">
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
