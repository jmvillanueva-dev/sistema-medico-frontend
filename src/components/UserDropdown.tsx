import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";

import LogoutIcon from "@/icons/logout.svg";
import ArrowUpIcon from "@/icons/arrow-up.svg";
import ArrowDownIcon from "@/icons/arrow-down.svg";
import UserIcon from "@/icons/user-card.svg";
import ChangeModuleIcon from "@/icons/switch.svg";
import ProfileIcon from "@/icons/system/profile.svg";

interface UserDropdownProps {
  roles?: string[];
}

const UserDropdown: React.FC<UserDropdownProps> = ({ roles = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const logout = useAuthStore((state) => state.logout);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const canChangeModule = roles.includes("ADMINISTRADOR") && roles.length > 1;

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-2 cursor-pointer" onClick={toggleDropdown}>
        <button className="p-0 bg-transparent border-none cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex justify-center items-center overflow-hidden border border-slate-200">
            <img src={UserIcon.src} alt="" className="w-5 h-5 text-slate-500" />
          </div>
        </button>
        <img
          src={isOpen ? ArrowUpIcon.src : ArrowDownIcon.src}
          alt=""
          className="w-4 h-4 transition-transform"
        />
      </div>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-[1001] min-w-[200px] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <a href="/profile" className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors no-underline">
            <img src={ProfileIcon.src} alt="Mi Perfil" className="w-4 h-4" />
            Mi Perfil
          </a>
          {canChangeModule && (
            <a href="/select-module" className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors no-underline">
              <img src={ChangeModuleIcon.src} alt="" className="w-4 h-4" />
              Cambiar Módulo
            </a>
          )}
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left border-t border-slate-100">
            <img src={LogoutIcon.src} alt="Cerrar Sesión Icon" className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;