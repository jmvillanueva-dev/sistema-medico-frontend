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
  const [isLoading, setIsLoading] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);

  const isEditing = employee !== null;
  const title = isEditing ? "Editar Empleado" : "Crear Nuevo Empleado";

  const handleClose = useCallback(() => {
    setActiveTab("profile");
    setIsFormDirty(false); // Reset dirty state
    onClose();
  }, [onClose]);

  const handleSaveAndClose = () => {
    setActiveTab("profile");
    setIsFormDirty(false); // Reset dirty state
    onSave();
  };

  const footer = (
    <>
      <button
        type="button"
        disabled={isLoading}
        className="px-5 py-2.5 text-slate-600 bg-white border border-slate-300 font-medium rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
        onClick={handleClose}
      >
        Cancelar
      </button>
      <button
        type="submit"
        form={activeTab === "profile" ? "employee-form" : "employee-email-form"}
        disabled={isLoading || (isEditing && !isFormDirty)}
        className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/30 flex items-center gap-2"
      >
        {isLoading && (
          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {isLoading
          ? "Guardando..."
          : activeTab === "email"
            ? "Actualizar Correo"
            : isEditing
              ? "Actualizar Empleado"
              : "Crear Empleado"}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="4xl"
      footer={footer}
    >
      <div className="flex flex-col md:flex-row h-[70vh] -m-6 rounded-b-2xl overflow-hidden">
        {isEditing && (
          <div className="w-full md:w-52 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col shrink-0">
            <div className="p-4 flex flex-row md:flex-col gap-2 md:gap-1 overflow-x-auto">
              <button
                className={`flex-none md:flex-auto md:w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all text-left whitespace-nowrap ${ activeTab === "profile"
                  ? "bg-white text-primary shadow-sm ring-1 ring-slate-200"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                onClick={() => {
                  setActiveTab("profile");
                  setIsFormDirty(false);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                Datos Personales
              </button>
              <button
                className={`flex-none md:flex-auto md:w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all text-left whitespace-nowrap ${ activeTab === "email"
                  ? "bg-white text-primary shadow-sm ring-1 ring-slate-200"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                onClick={() => {
                  setActiveTab("email");
                  setIsFormDirty(false);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                Email
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 p-6 overflow-y-auto bg-white">
          {activeTab === "profile" && (
            <EmployeeProfileForm
              employee={employee}
              onSave={handleSaveAndClose}
              onCancel={handleClose}
              setIsLoading={setIsLoading}
              setIsDirty={setIsFormDirty}
            />
          )}
          {activeTab === "email" && isEditing && (
            <EmployeeEmailForm
              employeeId={employee.id}
              currentEmail={employee.email || ""}
              onSave={handleSaveAndClose}
              setIsLoading={setIsLoading}
              setIsDirty={setIsFormDirty}
            />
          )}
        </div>
      </div>
    </Modal>
  );
}
