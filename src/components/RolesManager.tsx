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
      toast.success("Rol eliminado exitosamente");
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

  return (
    <div className="employees-manager">
      <ToastContainer />
      <div className="toolbar">
        <h1>Gestión de Roles</h1>
        <button className="btn btn-primary" onClick={handleCreate}>
          Crear Nuevo Rol
        </button>
      </div>

      <div className="table-container">
        {loading && <p>Cargando roles...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && !error && (
          <table>
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
                  <td>{role.nombre}</td>
                  <td>{role.area}</td>
                  <td>{role.descripcion}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-blue-system"
                        onClick={() => handleEdit(role)}
                      >
                        <img
                          src={EditIcon.src}
                          alt="Icon Editar"
                          className="icon icon-scale"
                        />
                        Editar
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(role)}
                      >
                        <img
                          src={DeleteIcon.src}
                          alt="Icon Eliminar"
                          className="icon icon-scale"
                        />
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
        message={`¿Estás seguro de que deseas eliminar el rol \"${roleToDelete?.nombre}\"?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
        confirmButtonText="Sí, eliminar"
      />
    </div>
  );
}
