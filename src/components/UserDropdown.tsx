import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import LogoutIcon from "@/icons/logout.svg";
import ArrowUpIcon from "@/icons/arrow-up.svg";
import ArrowDownIcon from "@/icons/arrow-down.svg";
import UserIcon from "@/icons/user-card.svg";
import ChangeModuleIcon from "@/icons/switch.svg";

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
    <div className="user-dropdown" ref={dropdownRef}>
      <button onClick={toggleDropdown} className="dropdown-toggle">
        <div className="user-avatar">
          <img src={UserIcon.src} alt="" />
        </div>
      </button>
      <img
        onClick={toggleDropdown}
        src={isOpen ? ArrowUpIcon.src : ArrowDownIcon.src}
        alt=""
        className="icon"
      />
      {isOpen && (
        <div className="dropdown-menu">
          {canChangeModule && (
            <a href="/select-module" className="dropdown-item">
              <img src={ChangeModuleIcon.src} alt="" className="icon" />
              Cambiar Módulo
            </a>
          )}
          <button onClick={handleLogout} className="dropdown-item">
            <img src={LogoutIcon.src} alt="Cerrar Sesión Icon" className="icon" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;