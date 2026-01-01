import { useState, useEffect, useRef } from 'react';
import ConfirmationModal from '../ConfirmationModal';

interface Role {
  id: string;
  nombre: string;
}

interface Props {
  availableRoles: Role[];
  selectedRoles: string[];
  onChange: (selected: string[]) => void;
}

export default function RoleSelector({ availableRoles, selectedRoles, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // States for confirmation modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);

  const filteredRoles = availableRoles.filter(
    (role) =>
      !selectedRoles.includes(role.nombre) &&
      role.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (roleName: string) => {
    onChange([...selectedRoles, roleName]);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleRemoveClick = (roleName: string) => {
    setRoleToDelete(roleName);
    setDeleteModalOpen(true);
  };

  const confirmRemove = () => {
    if (roleToDelete) {
      onChange(selectedRoles.filter((r) => r !== roleToDelete));
      setDeleteModalOpen(false);
      setRoleToDelete(null);
    }
  };

  // Cerrar dropdown si se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

  return (
    <>
      <div className="relative w-full" ref={wrapperRef}>
        <div className="relative">
          <div className="flex items-center w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all bg-slate-50 focus-within:bg-white">
            <svg className="w-4 h-4 text-slate-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input
              type="text"
              className="flex-1 bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400"
              placeholder="Buscar y agregar rol..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
            />
          </div>

          {isOpen && filteredRoles.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-auto">
              {filteredRoles.map((role) => (
                <li
                  key={role.id}
                  onClick={() => handleSelect(role.nombre)}
                  className="px-4 py-2 text-sm cursor-pointer hover:bg-slate-50 text-slate-700 transition-colors flex items-center justify-between group"
                >
                  <span>{role.nombre}</span>
                  <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold">+ Agregar</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedRoles.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedRoles.map((role) => (
              <div key={role} className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 text-xs font-semibold text-primary-700 bg-primary-50 border border-primary-200 rounded-lg shadow-sm">
                {role}
                <button
                  type="button"
                  onClick={() => handleRemoveClick(role)}
                  className="p-0.5 text-primary-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors focus:outline-none"
                  title="Eliminar rol"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Eliminar Rol"
        message={`¿Está seguro que desea eliminar el rol "${ roleToDelete }"? Esta acción podría afectar los permisos del usuario.`}
        onConfirm={confirmRemove}
        onCancel={() => setDeleteModalOpen(false)}
        confirmButtonText="Sí, eliminar"
      />
    </>
  );
}
