import React from "react";

const SelectModule: React.FC = () => {
  return (
    <div className="module-selection-buttons">
      <a
        href="/admin/dashboard"
        className="btn btn-primary btn-submit"
        style={{ textDecoration: "none" }}
      >
        Ingresar como Administrador
      </a>
      <a
        href="/medical/dashboard"
        className="btn btn-secondary btn-submit"
        style={{
          textDecoration: "none",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        Ingresar como Personal Médico
      </a>
    </div>
  );
};

export default SelectModule;

// Añade este estilo a src/styles/global.css si lo deseas
/*
.module-selection-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
}
*/
