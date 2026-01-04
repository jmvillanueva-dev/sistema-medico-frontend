import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getEvolucionById } from "../../services/medicalEvolutionService";
import { getClinicalRecordById, getFullClinicalRecordByEvolutionId } from "../../services/clinicalRecordService";
import { getPatientById } from "../../services/patientService";
import { generateClinicalRecordPDF } from "../../utils/pdfGenerator";
import type { EvolucionMedica } from "../../types/medicalEvolution";
import type { ClinicalRecord } from "../../types/clinicalRecord";
import type { Patient } from "../../types/patient";
import PatientFormModal from "../PatientFormModal";

// Icons
import ArrowLeftIcon from "../../icons/system/arrow-left.svg";
import PrinterIcon from "../../icons/system/printer.svg";
import UserIcon from "../../icons/system/user-single.svg";
import FileTextIcon from "../../icons/system/file-text.svg";
import ClipboardIcon from "../../icons/system/clipboard.svg";

interface MedicalEvolutionDetailProps {
  evolutionId: string;
  onBack?: () => void;
}

export default function MedicalEvolutionDetail({
  evolutionId,
  onBack,
}: MedicalEvolutionDetailProps) {
  const [evolution, setEvolution] = useState<EvolucionMedica | null>(null);
  const [clinicalRecord, setClinicalRecord] = useState<ClinicalRecord | null>(null);
  const [patientData, setPatientData] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [isPatientModalOpen, setPatientModalOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    const fetchEvolutionData = async () => {
      try {
        setLoading(true);
        const evolutionResponse = await getEvolucionById(evolutionId);

        if (evolutionResponse.data.success && evolutionResponse.data.data) {
          const evoData = evolutionResponse.data.data;
          setEvolution(evoData);

          if (evoData.historiaClinicaId) {
            try {
              const hcResponse = await getClinicalRecordById(evoData.historiaClinicaId);
              if (hcResponse.data.success && hcResponse.data.data) {
                const hcData = hcResponse.data.data;
                setClinicalRecord(hcData);

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

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Use history.back() to preserve query parameters (e.g., ?historiaClinicaId=...)
      window.history.back();
    }
  };

  const handleDownloadPDF = async () => {
    if (!evolutionId) {
      toast.error("ID de evolución no disponible");
      return;
    }

    try {
      setIsGeneratingPdf(true);
      toast.info("Generando PDF...");

      const response = await getFullClinicalRecordByEvolutionId(evolutionId);

      if (response.data.success && response.data.data) {
        generateClinicalRecordPDF(response.data.data);
        toast.success("PDF generado exitosamente");
      } else {
        toast.error("No se pudo obtener la información completa");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Error al generar el PDF");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePatientSave = async () => {
    setPatientModalOpen(false);
    if (patientData) {
      setLoadingPatient(true);
      try {
        const patientResponse = await getPatientById(patientData.id!); // Use existing ID
        if (patientResponse.data.success && patientResponse.data.data) {
          setPatientData(patientResponse.data.data);
          // Also refresh Clinical Record just in case name changed
          if (clinicalRecord) {
            // In a real app we might refetch HC too, but name is usually joined from patient
          }
        }
      } catch (e) {
        console.error("Error refreshing patient data", e);
      } finally {
        setLoadingPatient(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!evolution) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>No se encontró la información de la evolución.</p>
        <button
          onClick={handleBack}
          className="mt-4 text-primary hover:underline"
        >
          Volver
        </button>
      </div>
    );
  }

  // --- Helper Components & Icons ---

  const SectionHeader = ({ icon, title, colorClass = "text-slate-800" }: { icon: any, title: string, colorClass?: string }) => (
    <div className={`flex items-center gap-2 mb-4 border-b border-slate-100 pb-2 ${ colorClass }`}>
      {icon}
      <h3 className="text-lg font-bold uppercase tracking-tight">{title}</h3>
    </div>
  );

  const ActivityIcon = (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
  );

  const HeartIcon = (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5 4.5 1.5-1.5 1-4.5 1-6.5C8.89 3.01 7.23 3 5.5 3A5.5 5.5 0 0 0 0 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
  );

  return (
    <>
      {/* --- Print Header --- */}
      <div className="hidden print:block mb-8 border-b-2 border-slate-800 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Reporte de Evolución Médica</h1>
            <p className="text-slate-600">Fecha: {new Date(evolution.fechaConsulta).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <p className="font-bold">{clinicalRecord?.pacienteNombreCompleto}</p>
            <p>HC: {clinicalRecord?.numeroHistoriaClinica}</p>
            <p>CI: {clinicalRecord?.pacienteCedula}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6 max-w-7xl mx-auto pb-20">

        {/* --- Page Title --- */}
        <div className="print:hidden mb-8 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <img src={ArrowLeftIcon.src} alt="Volver" className="w-4 h-4 opacity-70" />
            <span className="hidden sm:inline">Volver</span>
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Detalle Evolución Médica</h1>
        </div>

        {/* --- Header Actions Bar --- */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center print:hidden gap-4">
          <div className="flex flex-col items-start gap-3 w-full xl:w-auto">
            {/* Patient Info Header - Improved Mobile Layout */}
            {patientData && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm w-full relative">
                <span className="absolute -top-2 left-4 bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Paciente
                </span>
                {/* Main info row */}
                <div className="flex items-center gap-3 w-full sm:w-auto mt-1">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base shrink-0 border border-blue-100">
                    {patientData.primerNombre.charAt(0)}{patientData.apellidoPaterno.charAt(0)}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-bold text-slate-800 leading-tight truncate">{clinicalRecord?.pacienteNombreCompleto}</span>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                      <span className="whitespace-nowrap">HC: {clinicalRecord?.numeroHistoriaClinica}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="whitespace-nowrap">CI: {clinicalRecord?.pacienteCedula}</span>
                    </div>
                  </div>
                </div>
                {/* Button below on mobile, right on larger screens */}
                <button
                  onClick={() => setPatientModalOpen(true)}
                  className="w-full sm:w-auto sm:ml-auto text-xs text-blue-600 hover:text-blue-800 font-medium px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                >
                  Ver Ficha
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-3 w-full sm:w-auto xl:justify-end">
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingPdf ? (
                <div className="w-4 h-4 border-2 border-slate-300 border-t-primary rounded-full animate-spin"></div>
              ) : (
                <img src={PrinterIcon.src} alt="Descargar PDF" className="w-4 h-4" />
              )}
              <span>{isGeneratingPdf ? "Generando..." : "Descargar PDF"}</span>
            </button>
          </div>
        </div>

        {/* --- Main Content Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Context & Motive (8 cols) */}
          <div className="lg:col-span-8 space-y-6">

            {/* General Info Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Fecha Consulta</span>
                  <div className="font-semibold text-slate-800 text-md">
                    {new Date(evolution.fechaConsulta).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(evolution.fechaConsulta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tipo</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ evolution.tipoConsulta === 'EMERGENCIA' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                    {evolution.tipoConsulta}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Profesional</span>
                  <div className="font-medium text-slate-900">{evolution.empleadoNombreCompleto}</div>
                  <div className="text-xs text-slate-500">{evolution.empleadoEspecialidad || 'Medicina General'}</div>
                </div>
              </div>

              {evolution.observacionesGenerales && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Observaciones Generales</span>
                  <p className="text-slate-700">"{evolution.observacionesGenerales}"</p>
                </div>
              )}
            </div>

            {/* Motivo | Enfermedad Actual */}
            {evolution.motivoAtencion && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                {/* <SectionHeader
                  icon={<img src={FileTextIcon.src} className="w-5 h-5 text-blue-600" alt="" />}
                  title="Anamnesis"
                  colorClass="text-blue-900 border-blue-100"
                /> */}

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-500 uppercase mb-1">Motivo de Consulta</h4>
                    <p className="text-slate-900 text-lg leading-snug font-medium">
                      {evolution.motivoAtencion.motivoConsulta}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-500 uppercase mb-1">Síntomas</h4>
                    <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                      {evolution.motivoAtencion.enfermedadActual}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Antecedentes y Valoración Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Antecedentes */}
              {evolution.antecedentesIncidente && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <SectionHeader
                    icon={<span className="text-xl"></span>}
                    title="Antecedentes"
                  />
                  <dl className="space-y-3 text-sm">
                    {Object.entries({
                      "Personales": evolution.antecedentesIncidente.antecedentesPersonales,
                      "Familiares": evolution.antecedentesIncidente.antecedentesFamiliares,
                      "Alergias": evolution.antecedentesIncidente.alergias,
                      "Hábitos": evolution.antecedentesIncidente.habitosToxicos,
                      "Medicamentos": evolution.antecedentesIncidente.medicamentosActuales
                    }).map(([label, value]) => (
                      value && (
                        <div key={label}>
                          <dt className="text-xs font-bold text-slate-400 uppercase">{label}</dt>
                          <dd className="text-slate-800 font-medium mt-0.5">{value}</dd>
                        </div>
                      )
                    ))}
                  </dl>
                </div>
              )}

              {/* Valoración Física */}
              {evolution.valoracionClinica && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <SectionHeader
                    icon={<span className="text-xl"></span>}
                    title="Examen Físico"
                  />
                  <div className="space-y-3 text-sm">
                    {Object.entries({
                      "Inspección": evolution.valoracionClinica.inspeccionGeneral,
                      "Cabeza/Cuello": evolution.valoracionClinica.cabezaCuello,
                      "Tórax": evolution.valoracionClinica.torax,
                      "Abdomen": evolution.valoracionClinica.abdomen,
                      "Extremidades": evolution.valoracionClinica.extremidades,
                      "Neurológico": evolution.valoracionClinica.neurologico,
                      "Piel": evolution.valoracionClinica.pielTegumentos
                    }).map(([label, value]) => (
                      value && (
                        <div key={label} className="border-b border-slate-50 last:border-0 pb-2 last:pb-0">
                          <span className="font-bold text-slate-700 mr-2">{label}:</span>
                          <span className="text-slate-600">{value}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Diagnósticos Table */}
            {evolution.diagnosticos && evolution.diagnosticos.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-4 sm:px-5 py-3 border-b border-slate-200 flex items-center gap-2">
                  <img src={ClipboardIcon.src} className="w-4 h-4 text-slate-500" alt="" />
                  <h3 className="font-bold text-slate-800 uppercase text-sm">Diagnósticos (CIE-10)</h3>
                </div>
                {/* Horizontal scroll wrapper for mobile */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white text-xs uppercase text-slate-500 border-b border-slate-100">
                      <tr>
                        <th className="px-3 sm:px-5 py-3 font-semibold whitespace-nowrap">Código</th>
                        <th className="px-3 sm:px-5 py-3 font-semibold min-w-[200px]">Diagnóstico</th>
                        <th className="px-3 sm:px-5 py-3 font-semibold whitespace-nowrap">Tipo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {evolution.diagnosticos.map((d, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="px-3 sm:px-5 py-3 text-sm font-mono font-bold text-slate-600 whitespace-nowrap">{d.codigoCie || "-"}</td>
                          <td className="px-3 sm:px-5 py-3 text-sm text-slate-800 font-medium">
                            {d.diagnostico}
                            {d.observaciones && <div className="text-xs text-slate-500 mt-0.5 font-normal">{d.observaciones}</div>}
                          </td>
                          <td className="px-3 sm:px-5 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide ${ d.tipo === 'DEFINITIVO' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-yellow-50 text-yellow-600 border border-yellow-100' }`}>
                              {d.tipo}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tratamientos */}
            {evolution.planesTratamiento && evolution.planesTratamiento.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider pl-1">Planes de Tratamiento</h3>
                {evolution.planesTratamiento.map((plan, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg">{plan.nombreTratamiento}</h4>
                        <p className="text-slate-600 text-sm">{plan.descripcion}</p>
                      </div>
                      <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-100">
                        {plan.tipoTratamiento}
                      </span>
                    </div>

                    {plan.indicacionesMedicas && plan.indicacionesMedicas.length > 0 && (
                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <h5 className="text-xs font-bold text-slate-500 uppercase mb-2">Medicamentos / Indicaciones</h5>
                        <ul className="space-y-3">
                          {plan.indicacionesMedicas.map((ind, j) => (
                            <li key={j} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm border-b border-slate-200 border-dashed last:border-0 pb-2 last:pb-0">
                              <div>
                                <span className="font-bold text-slate-800">{ind.medicamento}</span>
                                <span className="mx-2 text-slate-400">|</span>
                                <span className="text-slate-700">{ind.dosis}</span>
                                <span className="mx-2 text-slate-400">|</span>
                                <span className="text-slate-600 italic">via {ind.viaAdministracion?.toLowerCase()}</span>
                              </div>
                              <div className="text-right text-xs text-slate-500 font-medium bg-white px-2 py-0.5 rounded border border-slate-100">
                                {ind.frecuencia} por {ind.duracion}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* Right Column: Vitals & Status (4 cols) */}
          <div className="lg:col-span-4 space-y-6">

            {/* Signos Vitales Card (Sticky-ish?) */}
            {evolution.signosVitales && (
              <div className="bg-slate-900 text-white rounded-xl shadow-lg p-5">
                <div className="flex items-center gap-2 mb-4 text-white/90">
                  <ActivityIcon className="w-5 h-5" />
                  <h3 className="font-bold uppercase tracking-wider text-sm text-white">Signos Vitales</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 text-white/60 mb-1 text-xs uppercase font-bold">
                      <HeartIcon className="w-3.5 h-3.5" /> FC
                    </div>
                    <div className="text-2xl font-bold tracking-tight">{evolution.signosVitales.frecuenciaCardiaca || '--'} <span className="text-sm font-normal text-white/50">bpm</span></div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-white/60 mb-1 text-xs uppercase font-bold">Presión Arterial</div>
                    <div className="text-2xl font-bold tracking-tight">
                      {evolution.signosVitales.presionArterialSistolica}/{evolution.signosVitales.presionArterialDiastolica} <span className="text-sm font-normal text-white/50">mmHg</span>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-white/60 mb-1 text-xs uppercase font-bold">Temp.</div>
                    <div className="text-2xl font-bold tracking-tight">{evolution.signosVitales.temperatura || '--'} <span className="text-sm font-normal text-white/50">°C</span></div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-white/60 mb-1 text-xs uppercase font-bold">Sat. O2</div>
                    <div className="text-2xl font-bold tracking-tight">{evolution.signosVitales.saturacionOxigeno || '--'} <span className="text-sm font-normal text-white/50">%</span></div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 col-span-2 flex justify-between items-center">
                    <div>
                      <div className="text-white/60 text-xs uppercase font-bold">Peso</div>
                      <div className="text-xl font-bold">{evolution.signosVitales.peso} <span className="text-sm font-normal text-white/50">kg</span></div>
                    </div>
                    <div className="h-8 w-px bg-white/10"></div>
                    <div>
                      <div className="text-white/60 text-xs uppercase font-bold">Talla</div>
                      <div className="text-xl font-bold">{evolution.signosVitales.talla} <span className="text-sm font-normal text-white/50">cm</span></div>
                    </div>
                    <div className="h-8 w-px bg-white/10"></div>
                    <div>
                      <div className="text-white/60 text-xs uppercase font-bold">IMC</div>
                      <div className="text-xl font-bold">{evolution.signosVitales.imc}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Alta Médica */}
            {evolution.altaMedica && (
              <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-5 shadow-sm">
                <SectionHeader
                  icon={<span className="text-xl"></span>}
                  title="Alta Médica"
                  colorClass="text-emerald-800 border-emerald-200"
                />
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-emerald-100">
                    <div className="text-xs font-bold text-emerald-600 uppercase">Condición</div>
                    <div className="font-bold text-emerald-900">{evolution.altaMedica.condicionAlta}</div>
                  </div>
                  <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-emerald-100">
                    <div className="text-xs font-bold text-emerald-600 uppercase">Tipo Alta</div>
                    <div className="font-bold text-emerald-900">{evolution.altaMedica.tipoAlta}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-600 uppercase mb-1">Recomendaciones</div>
                    <p className="text-emerald-900 text-sm bg-white p-3 rounded-lg border border-emerald-100">
                      {evolution.altaMedica.recomendaciones}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Exámenes Solicitados */}
            {evolution.examenesSolicitados && evolution.examenesSolicitados.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                <SectionHeader
                  icon={<span className="text-xl"></span>}
                  title="Exámenes"
                />
                <ul className="space-y-3">
                  {evolution.examenesSolicitados.map((ex, i) => (
                    <li key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-slate-800">{ex.nombreExamen}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ ex.urgencia === 'URGENTE' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-600' }`}>
                          {ex.urgencia}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">{ex.tipoExamen}</div>
                      {ex.indicaciones && <div className="text-xs text-slate-600 italic">"{ex.indicaciones}"</div>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Emergencia Obstétrica */}
            {evolution.emergenciaObstetrica && (
              <div className="bg-pink-50 rounded-xl border border-pink-200 shadow-sm p-5">
                <SectionHeader
                  icon={<span className="text-xl"></span>}
                  title="Obstetricia"
                  colorClass="text-pink-800 border-pink-200"
                />
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-white p-2 rounded border border-pink-100">
                    <span className="block text-[10px] text-pink-500 font-bold uppercase">Semanas</span>
                    <span className="font-bold text-pink-900">{evolution.emergenciaObstetrica.semanasGestacion}</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-pink-100">
                    <span className="block text-[10px] text-pink-500 font-bold uppercase">Latidos</span>
                    <span className="font-bold text-pink-900">{evolution.emergenciaObstetrica.latidosFetales}</span>
                  </div>
                  <div className="col-span-2 bg-white p-2 rounded border border-pink-100">
                    <span className="block text-[10px] text-pink-500 font-bold uppercase">Dinámica Ute.</span>
                    <span className="font-medium text-pink-900">{evolution.emergenciaObstetrica.dinamicaUterina}</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* --- Patient Modal --- */}
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
