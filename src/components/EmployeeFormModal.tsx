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
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="4xl">
      <div className={`flex h-full ${isEditing ? "-m-6" : ""}`}>
        {isEditing && (
          <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
            <div className="p-4 space-y-1">
              <button
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all text-left ${
                  activeTab === "profile"
                    ? "bg-white text-primary shadow-sm ring-1 ring-slate-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
                onClick={() => setActiveTab("profile")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                Datos Personales
              </button>
              <button
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all text-left ${
                  activeTab === "email"
                    ? "bg-white text-primary shadow-sm ring-1 ring-slate-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
                onClick={() => setActiveTab("email")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                Email
              </button>
            </div>
          </div>
        )}

        <div className={`flex-1 ${isEditing ? "p-6 overflow-y-auto max-h-[70vh]" : ""}`}>
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
