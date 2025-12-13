import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UpdateProfileForm from "./forms/UpdateProfileForm";
import UpdateEmailForm from "./forms/UpdateEmailForm";
import UpdatePasswordForm from "./forms/UpdatePasswordForm";

type ActiveView = "profile" | "email" | "password";

const ProfileManager: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>("profile");

  const renderContent = () => {
    switch (activeView) {
      case "profile":
        return <UpdateProfileForm />;
      case "email":
        return <UpdateEmailForm />;
      case "password":
        return <UpdatePasswordForm />;
      default:
        return <UpdateProfileForm />;
    }
  };

  const navLinks = [
    { id: "profile", label: "Información General" },
    { id: "email", label: "Correo Electrónico" },
    { id: "password", label: "Contraseña" },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <ToastContainer style={{ zIndex: 99999 }} />
      <nav className="flex flex-row md:flex-col gap-2 w-full md:w-[200px] shrink-0 overflow-x-auto md:overflow-visible pb-4 md:pb-0 border-b-2 md:border-b-0 md:border-r border-slate-100 md:pr-4">
        {navLinks.map((link) => (
          <button
            key={link.id}
            className={`w-auto md:w-full px-4 py-3 text-left text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeView === link.id
                ? "bg-blue-50 text-primary font-semibold"
                : "text-slate-600 hover:bg-slate-50"
            }`}
            onClick={() => setActiveView(link.id as ActiveView)}
          >
            {link.label}
          </button>
        ))}
      </nav>
      <div className="flex-grow max-w-full md:max-w-5xl min-h-[500px]">{renderContent()}</div>
    </div>
  );
};

export default ProfileManager;
