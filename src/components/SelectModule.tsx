import React, { useEffect } from "react";
import adminIcon from "@/icons/user-admin.svg";
import medicalIcon from "@/icons/clinical.svg";
import { useCatalogStore } from "@/store/catalogStore";

const SelectModule: React.FC = () => {
  // Precargar catálogos al montar el componente (después del login)
  const { loadCatalogs, isLoaded, isLoading } = useCatalogStore();

  useEffect(() => {
    if (!isLoaded && !isLoading) {
      loadCatalogs();
    }
  }, [loadCatalogs, isLoaded, isLoading]);

  return (
    <div className="flex justify-center gap-6 mt-8 flex-wrap">
      <a
        href="/admin/dashboard"
        className="group flex flex-col items-center justify-center p-8 rounded-2xl bg-white border border-slate-200 no-underline text-slate-900 transition-all duration-300 w-[240px] h-[200px] shadow-sm hover:-translate-y-1 hover:border-primary hover:shadow-xl hover:shadow-primary/10"
      >
        <div className="p-4 rounded-full bg-blue-50 mb-4 transition-colors group-hover:bg-primary/10">
          <img
            src={adminIcon.src}
            alt="Administrador"
            className="w-10 h-10 text-primary"
          />
        </div>
        <span className="text-lg font-bold text-center leading-tight text-slate-800 group-hover:text-primary transition-colors">
          Ingresar como
          <br />
          Administrador
        </span>
      </a>
      <a
        href="/medical/dashboard"
        className="group flex flex-col items-center justify-center p-8 rounded-2xl bg-white border border-slate-200 no-underline text-slate-900 transition-all duration-300 w-[240px] h-[200px] shadow-sm hover:-translate-y-1 hover:border-primary hover:shadow-xl hover:shadow-primary/10"
      >
        <div className="p-4 rounded-full bg-blue-50 mb-4 transition-colors group-hover:bg-primary/10">
          <img
            src={medicalIcon.src}
            alt="Personal Médico"
            className="w-10 h-10 text-primary"
          />
        </div>
        <span className="text-lg font-bold text-center leading-tight text-slate-800 group-hover:text-primary transition-colors">
          Ingresar como
          <br />
          Personal Médico
        </span>
      </a>
    </div>
  );
};

export default SelectModule;
