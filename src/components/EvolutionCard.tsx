import React from "react";
import type { EvolucionReporteDiario } from "@/types/medicalEvolution";

interface EvolutionCardProps {
  evolution: EvolucionReporteDiario;
  onViewPatient: (pacienteId: string) => void;
  onViewClinicalRecord: (historiaClinicaId: string) => void;
}

const EvolutionCard: React.FC<EvolutionCardProps> = ({
  evolution,
  onViewPatient,
  onViewClinicalRecord,
}) => {
  // Format time from ISO string
  const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewDetails = () => {
    // Navigate to evolution details page
    window.location.href = `/medical/evolutions/${evolution.evolucionId}`;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-primary/50 transition-all">
      {/* Header with HC number badge and time */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-primary text-xs font-semibold rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            HC: {evolution.numeroHistoriaClinica}
          </span>
        </div>

        <span className="text-sm font-semibold text-slate-500">
          {formatTime(evolution.fechaConsulta)}
        </span>
      </div>

      {/* Patient info */}
      <div className="space-y-3 mb-4">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
            Paciente
          </p>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              {evolution.pacienteNombreCompleto}
            </h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewPatient(evolution.pacienteId);
              }}
              className="text-xs text-primary hover:text-blue-700 font-medium whitespace-nowrap"
              title="Ver datos del paciente"
            >
              Ver datos
            </button>
          </div>
        </div>

        {/* Employee name */}
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
            Médico/Empleado
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-slate-400"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="font-medium">{evolution.empleadoNombreCompleto}</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewClinicalRecord(evolution.historiaClinicaId);
          }}
          className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          Ver HC
        </button>

        <button
          onClick={handleViewDetails}
          className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-primary hover:bg-blue-700 rounded-lg transition-colors"
        >
          Ver detalles
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default EvolutionCard;
