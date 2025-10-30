import { useState } from "react";
import type { Employee } from "./EmployeesManager";
import EmployeeProfileForm from "./forms/EmployeeProfileForm";
import EmployeeEmailForm from "./forms/EmployeeEmailForm";
import "./EmployeeFormModal.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  employee: Employee | null;
}

type Tab = "profile" | "email" | "password";

export default function EmployeeFormModal({ isOpen, onClose, onSave, employee }: Props) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const isEditing = employee !== null;
  const title = isEditing ? "Editar Empleado" : "Crear Nuevo Empleado";

  const handleClose = () => {
    setActiveTab("profile");
    onClose();
  }

  const handleSaveAndClose = () => {
    setActiveTab("profile");
    onSave();
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content form-modal">
        <button onClick={handleClose} className="btn close-button">&times; Cerrar</button>
        <div className="form-modal-header">
          <h2>{title}</h2>
        </div>
        <div className="form-modal-body">
          <div className="tabs">
            <button
              className={`tab ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}>
              Datos Personales
            </button>
            {isEditing && (
              <button
                className={`tab ${activeTab === "email" ? "active" : ""}`}
                onClick={() => setActiveTab("email")}>
                Email
              </button>
            )}
            {/* {isEditing && (
              <button
                className={`tab ${activeTab === "password" ? "active" : ""}`}
                onClick={() => setActiveTab("password")}>
                Contraseña
              </button>
            )} */}
          </div>

          <div className="tab-content">
            {activeTab === "profile" && (
              <EmployeeProfileForm employee={employee} onSave={handleSaveAndClose} />
            )}
            {activeTab === "email" && isEditing && (
              <EmployeeEmailForm 
                employeeId={employee.id} 
                currentEmail={employee.email || ''} 
                onSave={handleSaveAndClose} 
              />
            )}
            {/* {activeTab === "password" && isEditing && (
              <div>
                <p>Aquí irá el formulario para actualizar la contraseña.</p>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
}
