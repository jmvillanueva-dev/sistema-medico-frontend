import { useState, useEffect } from "react";
import "./EmployeesManager.css";
import { getEmployees, deleteEmployee, getEmployeeById } from "../services/api";
import ConfirmationModal from "./ConfirmationModal";
import EmployeeFormModal from "./EmployeeFormModal";

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
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await getEmployees();
      setEmployees(response.data);
      setError(null);
    } catch (err) {
      setError("Error al cargar los empleados. Por favor, intente más tarde.");
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
      setEditingEmployee(response.data); // Modo edición con datos completos
      setFormModalOpen(true);
    } catch (err) {
      setError("Error al obtener los datos del empleado.");
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
      setDeleteModalOpen(false);
      setEmployeeToDelete(null);
    } catch (err) {
      setError("Error al eliminar el empleado.");
      console.error(err);
    }
  };

  const handleSave = () => {
    setFormModalOpen(false);
    fetchEmployees(); // Recarga la lista de empleados
  };

  return (
    <div className="employees-manager">
      <div className="toolbar">
        <h1>Gestión de Empleados</h1>
        <button className="btn btn-primary" onClick={handleCreate}>
          Crear Nuevo Empleado
        </button>
      </div>

      <div className="table-container">
        {loading && <p>Cargando empleados...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && !error && (
          <table>
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
                  <td>{`${employee.nombre} ${employee.apellido}`}</td>
                  <td>{employee.cedula}</td>
                  <td>{employee.especialidad}</td>
                  <td>{employee.telefono}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        employee.estaActivo ? "active" : "inactive"
                      }`}>
                      {employee.estaActivo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleEdit(employee)}>
                        Editar
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(employee)}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* --- Modales --- */}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que deseas eliminar a ${employeeToDelete?.nombre} ${employeeToDelete?.apellido}?`}
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
