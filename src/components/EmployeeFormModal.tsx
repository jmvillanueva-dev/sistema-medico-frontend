import { useState, useEffect, useRef, useCallback } from "react";
import type { Employee } from "./EmployeesManager";
import EmployeeProfileForm from "./forms/EmployeeProfileForm";
import EmployeeEmailForm from "./forms/EmployeeEmailForm";
import "./EmployeeFormModal.css";

import CloseIcon from "@/icons/system/close.svg";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  employee: Employee | null;
}

type Tab = "profile" | "email" | "password";

export default function EmployeeFormModal({
  isOpen,
  onClose,
  onSave,
  employee,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const isEditing = employee !== null;
  const title = isEditing ? "Editar Empleado" : "Crear Nuevo Empleado";

  // Manejar cierre del modal
  const handleClose = useCallback(() => {
    setActiveTab("profile");
    onClose();
  }, [onClose]);

  const handleSaveAndClose = () => {
    setActiveTab("profile");
    onSave();
  };

  // Enfocar el primer elemento al abrir
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      // Pequeño delay para que el modal se renderice
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Manejar tecla Escape para cerrar el modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleClose]);

  // Manejar clic en el overlay para cerrar
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-content form-modal" ref={modalRef}>
        <div className="form-modal-header">
          <h2 id="modal-title" className="form-modal-title">
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            onClick={handleClose}
            className="btn-close"
            aria-label="Cerrar modal"
            type="button"
          >
            <img
              src={CloseIcon.src}
              alt=""
              className="icon-close"
              aria-hidden="true"
            />
          </button>
        </div>

        <div className="form-modal-body">
          {isEditing && (
            <div
              className="tabs"
              role="tablist"
              aria-label="Secciones del formulario"
            >
              <button
                role="tab"
                aria-selected={activeTab === "profile"}
                aria-controls="panel-profile"
                id="tab-profile"
                className={`tab ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
                type="button"
              >
                Datos Personales
              </button>
              <button
                role="tab"
                aria-selected={activeTab === "email"}
                aria-controls="panel-email"
                id="tab-email"
                className={`tab ${activeTab === "email" ? "active" : ""}`}
                onClick={() => setActiveTab("email")}
                type="button"
              >
                Email
              </button>
            </div>
          )}

          <div className="tab-content">
            {activeTab === "profile" && (
              <div
                role="tabpanel"
                id="panel-profile"
                aria-labelledby="tab-profile"
              >
                <EmployeeProfileForm
                  employee={employee}
                  onSave={handleSaveAndClose}
                />
              </div>
            )}
            {activeTab === "email" && isEditing && (
              <div role="tabpanel" id="panel-email" aria-labelledby="tab-email">
                <EmployeeEmailForm
                  employeeId={employee.id}
                  currentEmail={employee.email || ""}
                  onSave={handleSaveAndClose}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
