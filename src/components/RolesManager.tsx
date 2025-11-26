import { useState, useEffect } from "react";
import { getRoles, deleteRole } from "../services/api";
import RoleFormModal from "./RoleFormModal";
import ConfirmationModal from "./ConfirmationModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./EmployeesManager.css";

import EditIcon from "@/icons/system/edit.svg";
import DeleteIcon from "@/icons/system/delete.svg";

export interface Role {
  id: string;
  nombre: string;
  area: string;
  descripcion: string;
}

export default function RolesManager() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para los modales
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await getRoles();
      setRoles(response.data.data);
      setError(null);
    } catch (err) {
      const errorMsg = "Error al cargar los roles.";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // --- Handlers para CRUD ---
  const handleCreate = () => {
    setEditingRole(null);
    setFormModalOpen(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormModalOpen(true);
  };

  const handleDelete = (role: Role) => {
    setRoleToDelete(role);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;
    try {
      await deleteRole(roleToDelete.id);
      setRoles(roles.filter((r) => r.id !== roleToDelete.id));
      toast.success(`✅ Rol "${roleToDelete.nombre}" eliminado correctamente.`);
      setDeleteModalOpen(false);
      setRoleToDelete(null);
    } catch (err) {
      const errorMsg = "Error al eliminar el rol.";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error(err);
    }
  };

  const handleSave = () => {
    setFormModalOpen(false);
    fetchRoles();
  };

  // Render Loading State
  const renderLoading = () => (
    <div className="loading-message">
      <span>Cargando roles...</span>
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
      <h3 className="empty-state-title">No se encontraron roles</h3>
      <p className="empty-state-description">
        Aún no hay roles registrados. Crea uno nuevo para comenzar.
      </p>
    </div>
  );

  // Render Table
  const renderTable = () => (
    <table className="responsive-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Área</th>
          <th>Descripción</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {roles.map((role) => (
          <tr key={role.id}>
            <td data-label="Nombre">
              <span className="badge badge-info">{role.nombre}</span>
            </td>
            <td data-label="Área">{role.area}</td>
            <td data-label="Descripción">{role.descripcion}</td>
            <td data-label="Acciones">
              <div className="action-buttons">
                <button
                  className="btn btn-blue-system"
                  onClick={() => handleEdit(role)}
                  title="Editar rol"
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
                  onClick={() => handleDelete(role)}
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
        <h1>Gestión de Roles</h1>
        <button className="btn btn-primary" onClick={handleCreate}>
          + Crear Nuevo Rol
        </button>
      </div>

      <div className="table-container">
        {loading && renderLoading()}
        {error && !loading && renderError()}
        {!loading && !error && roles.length === 0 && renderEmptyState()}
        {!loading && !error && roles.length > 0 && renderTable()}
      </div>

      {/* Modales */}
      <RoleFormModal
        isOpen={isFormModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSave={handleSave}
        role={editingRole}
      />
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que deseas eliminar el rol "${roleToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
        confirmButtonText="Sí, eliminar"
      />
    </div>
  );
}
