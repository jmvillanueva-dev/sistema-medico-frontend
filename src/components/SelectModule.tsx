import React from "react";
import "./forms/SelectModule.css";
import adminIcon from "@/icons/user-admin.svg";
import medicalIcon from "@/icons/clinical.svg";

const SelectModule: React.FC = () => {
  return (
    <div className="module-selection-container">
      <a href="/admin/dashboard" className="module-card">
        <img
          src={adminIcon.src}
          alt="Administrador"
          className="module-card-icon"
        />
        <span className="module-card-title">
          Ingresar como
          <br />
          Administrador
        </span>
      </a>
      <a href="/medical/dashboard" className="module-card">
        <img
          src={medicalIcon.src}
          alt="Personal Médico"
          className="module-card-icon"
        />
        <span className="module-card-title">
          Ingresar como
          <br />
          Personal Médico
        </span>
      </a>
    </div>
  );
};

export default SelectModule;
