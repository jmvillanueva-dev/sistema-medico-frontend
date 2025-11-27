import { useState, useEffect } from "react";
import { getRoles, deleteRole } from "../services/api";
import RoleFormModal from "./RoleFormModal";
import ConfirmationModal from "./ConfirmationModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-3">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
      <span>Cargando roles...</span>
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
      <h3 className="text-lg font-semibold text-slate-900 mb-2">No se encontraron roles</h3>
      <p className="text-sm text-slate-500 max-w-xs">
        Aún no hay roles registrados. Crea uno nuevo para comenzar.
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
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Área</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Descripción</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {roles.map((role) => (
            <tr key={role.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 text-sm">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {role.nombre}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-slate-600">{role.area}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{role.descripcion}</td>
              <td className="px-4 py-3 text-sm">
                <div className="flex gap-2">
                  <button
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                    onClick={() => handleEdit(role)}
                    title="Editar rol"
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
                    onClick={() => handleDelete(role)}
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
        {roles.map((role) => (
          <div key={role.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">{role.nombre}</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {role.area}
                </span>
              </div>
            </div>
            
            <p className="text-xs text-slate-600 mb-4">{role.descripcion}</p>

            <div className="flex gap-2 pt-3 border-t border-slate-100">
               <button
                    className="flex-1 inline-flex justify-center items-center gap-1 px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                    onClick={() => handleEdit(role)}
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
                    onClick={() => handleDelete(role)}
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
        <h1 className="text-2xl font-bold text-slate-900 m-0">Gestión de Roles</h1>
        <button className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-600 transition-colors shadow-sm w-full sm:w-auto" onClick={handleCreate}>
          + Crear Nuevo Rol
        </button>
      </div>

      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
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
