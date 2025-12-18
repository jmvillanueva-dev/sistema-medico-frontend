import React, { useEffect, useState } from "react";
import { getEvolucionById } from "../../services/medicalEvolutionService";
import { getClinicalRecordById } from "../../services/clinicalRecordService";
import { getPatientById } from "../../services/patientService";
import type { EvolucionMedica } from "../../types/medicalEvolution";
import type { ClinicalRecord } from "../../types/clinicalRecord";
import type { Patient } from "../../types/patient";
import PatientFormModal from "../PatientFormModal";
import { toast } from "react-toastify";

import ArrowLeftIcon from "@/icons/system/arrow-left.svg";
import PrinterIcon from "@/icons/system/printer.svg";
import EditIcon from "@/icons/system/edit-fill.svg";
import UserIcon from "@/icons/system/user-single.svg";

interface MedicalEvolutionDetailProps {
  evolutionId: string;
  onBack?: () => void;
}

export default function MedicalEvolutionDetail({ evolutionId, onBack }: MedicalEvolutionDetailProps) {
  // Default navigation handler
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.location.href = '/medical/evolutions';
    }
  };

  const handleEdit = () => {
    window.location.href = `/medical/evolutions/edit/${ evolutionId }`;
  };

  const [evolution, setEvolution] = useState<EvolucionMedica | null>(null);
  const [clinicalRecord, setClinicalRecord] = useState<ClinicalRecord | null>(null);
  const [patientData, setPatientData] = useState<Patient | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingPatient, setLoadingPatient] = useState(false);

  const [isPatientModalOpen, setPatientModalOpen] = useState(false);

  useEffect(() => {
    const fetchEvolutionData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Evolution
        const evolutionResponse = await getEvolucionById(evolutionId);

        if (evolutionResponse.data.success && evolutionResponse.data.data) {
          const evoData = evolutionResponse.data.data;
          setEvolution(evoData);

          // 2. Fetch Clinical Record
          if (evoData.historiaClinicaId) {
            try {
              const hcResponse = await getClinicalRecordById(evoData.historiaClinicaId);
              if (hcResponse.data.success && hcResponse.data.data) {
                const hcData = hcResponse.data.data;
                setClinicalRecord(hcData);

                // 3. Fetch Patient Data (need full object for modal)
                if (hcData.pacienteId) {
                  setLoadingPatient(true);
                  const patientResponse = await getPatientById(hcData.pacienteId);
                  if (patientResponse.data.success && patientResponse.data.data) {
                    setPatientData(patientResponse.data.data);
                  }
                  setLoadingPatient(false);
                }
              }
            } catch (hcError) {
              console.error("Error fetching related clinical record", hcError);
            }
          }
        } else {
          toast.error("No se encontró la evolución solicitada");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error al cargar el detalle de la evolución");
      } finally {
        setLoading(false);
      }
    };

    if (evolutionId) {
      fetchEvolutionData();
    }
  }, [evolutionId]);

  const handlePrint = () => {
    window.print();
  };

  const handleOpenPatientModal = () => {
    if (patientData) {
      setPatientModalOpen(true);
    } else {
      toast.warning("No se han cargado los datos del paciente");
    }
  };

  const handlePatientSave = async () => {
    setPatientModalOpen(false);
    // Refresh patient data to update header if name changed
    if (clinicalRecord?.pacienteId) {
      try {
        // Refresh HC first to get updated denormalized name if any
        const hcResponse = await getClinicalRecordById(clinicalRecord.id);
        if (hcResponse.data.success) {
          setClinicalRecord(hcResponse.data.data);
        }

        // Refresh full patient data
        const patientResponse = await getPatientById(clinicalRecord.pacienteId);
        if (patientResponse.data.success) {
          setPatientData(patientResponse.data.data);
        }
      } catch (e) {
        console.error("Error refreshing data after save", e);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-3">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
        <span>Cargando detalle...</span>
      </div>
    );
  }

  if (!evolution) {
    return <div className="text-center py-8 text-red-500">No se encontró la evolución.</div>;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header Section with Patient Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4 print:hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                {clinicalRecord?.pacienteNombreCompleto?.charAt(0) || '?'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                    HC: {clinicalRecord?.numeroHistoriaClinica || 'N/A'}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg mt-1">
                  {clinicalRecord?.pacienteNombreCompleto || 'Paciente desconocido'}
                </h3>
                <p className="text-sm text-slate-500">
                  Cédula: {clinicalRecord?.pacienteCedula || 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleOpenPatientModal}
                disabled={!patientData || loadingPatient}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-70"
              >
                {loadingPatient ? (
                  <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <img src={UserIcon.src} alt="Paciente" className="w-4 h-4" />
                )}
                Ver Paciente
              </button>
              <button
                onClick={handleBack}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver a Evoluciones
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:shadow-none print:border-none">
          {/* Header - No Print */}
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 print:hidden">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200 text-slate-500"
              >
                <img src={ArrowLeftIcon.src} alt="Volver" className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-bold text-slate-800">Detalle de Evolución</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleEdit}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-600 transition-colors"
              >
                <img src={EditIcon.src} alt="Editar" className="w-4 h-4" />
                Editar
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <img src={PrinterIcon.src} alt="Imprimir" className="w-4 h-4" />
                Imprimir
              </button>
            </div>
          </div>

          {/* Content - Printable */}
          <div className="p-8 max-w-4xl mx-auto space-y-8 print:p-0">

            {/* Print Header */}
            <div className="hidden print:block text-center mb-8 border-b pb-4">
              <div className="mb-4">
                <h1 className="text-2xl font-bold">Reporte de Evolución Médica</h1>
                <p className="text-sm text-slate-500">Generado el {new Date().toLocaleDateString()}</p>
              </div>
              {clinicalRecord && (
                <div className="grid grid-cols-2 gap-4 text-left text-sm border-t border-slate-100 pt-4">
                  <div>
                    <span className="font-bold text-slate-700">Paciente:</span> {clinicalRecord.pacienteNombreCompleto}
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">Cédula:</span> {clinicalRecord.pacienteCedula}
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">HC:</span> {clinicalRecord.numeroHistoriaClinica}
                  </div>
                </div>
              )}
            </div>

            {/* General Info */}
            <section className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Fecha de Consulta</h3>
                <p className="text-lg font-medium text-slate-900">
                  {new Date(evolution.fechaConsulta).toLocaleString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Tipo de Consulta</h3>
                <p className="text-lg font-medium text-slate-900">{evolution.tipoConsulta}</p>
              </div>
              <div className="col-span-2">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Observaciones Generales</h3>
                <p className="text-slate-700">{evolution.observacionesGenerales || "Sin observaciones"}</p>
              </div>
            </section>

            <hr className="border-slate-100" />

            {/* Motivo */}
            {evolution.motivoAtencion && (
              <section>
                <h3 className="text-lg font-bold text-slate-800 mb-3 border-l-4 border-primary pl-3">Motivo de Atención</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold text-slate-700">Motivo:</span> {evolution.motivoAtencion.motivoConsulta}
                  </div>
                  {evolution.motivoAtencion.enfermedadActual && (
                    <div>
                      <span className="font-semibold text-slate-700">Enfermedad Actual:</span>
                      <p className="mt-1 text-slate-600 bg-slate-50 p-3 rounded-lg">{evolution.motivoAtencion.enfermedadActual}</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Signos Vitales */}
            {evolution.signosVitales && (
              <section>
                <h3 className="text-lg font-bold text-slate-800 mb-3 border-l-4 border-primary pl-3">Signos Vitales</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl print:bg-transparent print:border print:border-slate-200">
                  {Object.entries(evolution.signosVitales).map(([key, value]) => (
                    <div key={key}>
                      <span className="block text-xs font-bold text-slate-500 uppercase">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="text-base font-medium text-slate-900">{value}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Valoración Clínica */}
            {evolution.valoracionClinica && Object.keys(evolution.valoracionClinica).length > 0 && (
              <section>
                <h3 className="text-lg font-bold text-slate-800 mb-3 border-l-4 border-primary pl-3">Valoración Clínica</h3>
                <div className="space-y-2">
                  {Object.entries(evolution.valoracionClinica).map(([key, value]) => (
                    value && (
                      <div key={key} className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-b border-slate-100 py-2 last:border-0">
                        <span className="font-semibold text-slate-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="sm:col-span-2 text-slate-600">{value}</span>
                      </div>
                    )
                  ))}
                </div>
              </section>
            )}

            {/* Diagnósticos */}
            {evolution.diagnosticos && evolution.diagnosticos.length > 0 && (
              <section>
                <h3 className="text-lg font-bold text-slate-800 mb-3 border-l-4 border-primary pl-3">Diagnósticos</h3>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-2 text-sm font-bold text-slate-500">CIE-10</th>
                      <th className="py-2 text-sm font-bold text-slate-500">Diagnóstico</th>
                      <th className="py-2 text-sm font-bold text-slate-500">Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evolution.diagnosticos.map((d, i) => (
                      <tr key={i} className="border-b border-slate-100 last:border-0">
                        <td className="py-2 text-sm font-medium">{d.codigoCie || "-"}</td>
                        <td className="py-2 text-sm">{d.diagnostico}</td>
                        <td className="py-2 text-sm">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${ d.tipo === 'DEFINITIVO' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700' }`}>
                            {d.tipo}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            {/* Planes de Tratamiento */}
            {evolution.planesTratamiento && evolution.planesTratamiento.length > 0 && (
              <section>
                <h3 className="text-lg font-bold text-slate-800 mb-3 border-l-4 border-primary pl-3">Planes de Tratamiento</h3>
                <div className="space-y-4">
                  {evolution.planesTratamiento.map((plan, i) => (
                    <div key={i} className="bg-slate-50 p-4 rounded-lg print:bg-transparent print:border print:border-slate-200">
                      <h4 className="font-bold text-slate-900">{plan.nombreTratamiento}</h4>
                      <p className="text-sm text-slate-600 mt-1">{plan.descripcion}</p>
                      {plan.indicacionesMedicas && plan.indicacionesMedicas.length > 0 && (
                        <ul className="mt-2 list-disc list-inside text-sm text-slate-700">
                          {plan.indicacionesMedicas.map((ind, j) => (
                            <li key={j}>{ind.medicamento} - {ind.dosis} ({ind.frecuencia})</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Exámenes */}
            {evolution.examenesSolicitados && evolution.examenesSolicitados.length > 0 && (
              <section>
                <h3 className="text-lg font-bold text-slate-800 mb-3 border-l-4 border-primary pl-3">Exámenes Solicitados</h3>
                <ul className="list-disc list-inside space-y-1">
                  {evolution.examenesSolicitados.map((ex, i) => (
                    <li key={i} className="text-slate-700">
                      <span className="font-semibold">{ex.nombreExamen}</span>
                      {ex.urgencia === 'URGENCIA' && <span className="ml-2 text-xs font-bold text-red-600 bg-red-50 px-1 rounded">URGENTE</span>}
                      {ex.indicaciones && <span className="block text-sm text-slate-500 ml-5">{ex.indicaciones}</span>}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Alta Médica */}
            {evolution.altaMedica && (
              <section className="bg-green-50 p-4 rounded-xl border border-green-100 print:bg-transparent print:border-slate-200">
                <h3 className="text-lg font-bold text-green-800 mb-2">Alta Médica</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs font-bold text-green-600 uppercase">Tipo</span>
                    <span className="text-slate-900">{evolution.altaMedica.tipoAlta}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-green-600 uppercase">Condición</span>
                    <span className="text-slate-900">{evolution.altaMedica.condicionAlta}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-xs font-bold text-green-600 uppercase">Recomendaciones</span>
                    <p className="text-slate-900">{evolution.altaMedica.recomendaciones}</p>
                  </div>
                </div>
              </section>
            )}

          </div>
        </div>

        {/* Patient Edit Modal */}
        {patientData && (
          <PatientFormModal
            isOpen={isPatientModalOpen}
            onClose={() => setPatientModalOpen(false)}
            patient={patientData}
            onSave={handlePatientSave}
          />
        )}
      </div>
    </>
  );
}
