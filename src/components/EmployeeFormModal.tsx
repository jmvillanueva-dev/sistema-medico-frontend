import { useState, useCallback } from "react";
import type { Employee } from "./EmployeesManager";
import EmployeeProfileForm from "./forms/EmployeeProfileForm";
import EmployeeEmailForm from "./forms/EmployeeEmailForm";
import { Modal } from "./common/Modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  employee: Employee | null;
}

type Tab = "profile" | "email";

export default function EmployeeFormModal({
  isOpen,
  onClose,
  onSave,
  employee,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const isEditing = employee !== null;
  const title = isEditing ? "Editar Empleado" : "Crear Nuevo Empleado";

  const handleClose = useCallback(() => {
    setActiveTab("profile");
    onClose();
  }, [onClose]);

  const handleSaveAndClose = () => {
    setActiveTab("profile");
    onSave();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="lg">
      <div className="flex flex-col h-full">
        {isEditing && (
          <div className="flex border-b border-slate-200 mb-6">
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "profile"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
              onClick={() => setActiveTab("profile")}
            >
              Datos Personales
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "email"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
              onClick={() => setActiveTab("email")}
            >
              Email
            </button>
          </div>
        )}

        <div className="flex-1">
          {activeTab === "profile" && (
            <EmployeeProfileForm
              employee={employee}
              onSave={handleSaveAndClose}
            />
          )}
          {activeTab === "email" && isEditing && (
            <EmployeeEmailForm
              employeeId={employee.id}
              currentEmail={employee.email || ""}
              onSave={handleSaveAndClose}
            />
          )}
        </div>
      </div>
    </Modal>
  );
}
