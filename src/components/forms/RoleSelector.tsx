import { useState, useEffect, useRef } from 'react';

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
    <div className="relative w-full" ref={wrapperRef}>
      <div className="flex flex-wrap items-center gap-2 p-2 min-h-[44px] border border-slate-200 rounded-xl bg-white focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:border-primary transition-all">
        {selectedRoles.map((role) => (
          <div key={role} className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-primary bg-primary-100 rounded-full">
            {role}
            <button 
              type="button" 
              onClick={() => handleRemove(role)}
              className="ml-1 text-primary hover:text-primary-600 focus:outline-none"
            >
              &times;
            </button>
          </div>
        ))}
        <input
          type="text"
          className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm placeholder:text-slate-400"
          placeholder={selectedRoles.length === 0 ? "Buscar y agregar rol..." : ""}
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
              className="px-4 py-2 text-sm cursor-pointer hover:bg-slate-50 text-slate-700 transition-colors"
            >
              {role.nombre}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
