import { useState, useEffect, useRef } from 'react';
import './RoleSelector.css';

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

  const handleRemove = (roleName: string) => {
    onChange(selectedRoles.filter((r) => r !== roleName));
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
    <div className="role-selector-wrapper" ref={wrapperRef}>
      <div className="role-tags-container">
        {selectedRoles.map((role) => (
          <div key={role} className="role-tag">
            {role}
            <button type="button" onClick={() => handleRemove(role)}>&times;</button>
          </div>
        ))}
        <input
          type="text"
          className="role-search-input"
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
        <ul className="role-dropdown">
          {filteredRoles.map((role) => (
            <li key={role.id} onClick={() => handleSelect(role.nombre)}>
              {role.nombre}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
