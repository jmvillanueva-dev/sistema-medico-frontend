import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { createEvolucion, updateEvolucion } from "../../services/medicalEvolutionService";
import type { EvolucionMedicaRequest, EvolucionMedica } from "../../types/medicalEvolution";
import { Input } from "../common/Input";

// Icons
import SaveIcon from "@/icons/system/save.svg";
import ArrowLeftIcon from "@/icons/system/arrow-left.svg";
import PlusIcon from "@/icons/system/add-circle.svg";
import TrashIcon from "@/icons/system/delete.svg";

interface MedicalEvolutionFormProps {
  historiaClinicaId?: string;
  empleadoId?: string;
  evolutionId?: string;
  initialData?: EvolucionMedica;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialTab?: string; // Allow setting initial tab from props
}

// 7 main tabs matching the summary table circles + obstetrica (optional, inside alta section)
type Tab = "motivo" | "signos" | "valoracion" | "diagnostico" | "tratamiento" | "examenes" | "alta";

// Helper to get initial tab from URL or props
const getInitialTab = (initialTab?: string): Tab => {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (tabParam && ["motivo", "signos", "valoracion", "diagnostico", "tratamiento", "examenes", "alta"].includes(tabParam)) {
      return tabParam as Tab;
    }
  }
  if (initialTab && ["motivo", "signos", "valoracion", "diagnostico", "tratamiento", "examenes", "alta"].includes(initialTab)) {
    return initialTab as Tab;
  }
  return "motivo";
};

import { useAuthStore } from "@/store/authStore";
import Cookies from "js-cookie";

export default function MedicalEvolutionForm({
  historiaClinicaId,
  empleadoId,
  evolutionId,
  initialData,
  onSuccess,
  onCancel,
  initialTab,
}: MedicalEvolutionFormProps) {
  const { user } = useAuthStore(); // Get user from auth store

  // Default navigation handlers
  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      // Always navigate to the evolutions list after saving
      window.location.href = `/medical/evolutions`;
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      // Navigate to evolutions list on cancel
      window.location.href = `/medical/evolutions`;
    }
  };

  const [activeTab, setActiveTab] = useState<Tab>(() => getInitialTab(initialTab));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!evolutionId && !initialData);
  const [loadedData, setLoadedData] = useState<EvolucionMedica | undefined>(initialData);

  const { register, control, handleSubmit, watch, setValue, getValues, reset, formState: { errors } } = useForm<EvolucionMedicaRequest>({
    defaultValues: {
      historiaClinicaId: historiaClinicaId || "",
      empleadoId: empleadoId || user?.employeeId || "", // Use prop or auth store
      tipoConsulta: "CONSULTA EXTERNA",
      fechaConsulta: new Date().toISOString().slice(0, 16),
      observacionesGenerales: "",
      motivoAtencion: { motivoConsulta: "", enfermedadActual: "" },
      signosVitales: {},
      valoracionClinica: {},
      diagnosticos: [],
      planesTratamiento: [],
      examenesSolicitados: [],
      localizacionLesiones: [],
      emergenciaObstetrica: {},
      altaMedica: {}
    }
  });

  // Ensure employeeId is set (fallback to cookie if store is not ready)
  useEffect(() => {
    const currentId = getValues("empleadoId");
    if (!currentId) {
      if (user?.employeeId) {
        setValue("empleadoId", user.employeeId);
      } else {
        // Store not ready? Try cookie directly
        const userCookie = Cookies.get("auth-user");
        if (userCookie) {
          try {
            const parsedUser = JSON.parse(userCookie);
            if (parsedUser.employeeId) {
              setValue("empleadoId", parsedUser.employeeId);
            }
          } catch (e) {
            console.error("Error parsing auth cookie", e);
          }
        }
      }
    }
  }, [user, setValue, getValues]);

  // Fetch data if evolutionId is provided
  useEffect(() => {
    const fetchData = async () => {
      if (evolutionId && !initialData) {
        try {
          setIsLoading(true);
          const { getEvolucionById } = await import("../../services/medicalEvolutionService");
          const response = await getEvolucionById(evolutionId);
          if (response.data.success) {
            setLoadedData(response.data.data);
          }
        } catch (error) {
          console.error(error);
          toast.error("Error al cargar la evolución");
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchData();
  }, [evolutionId, initialData]);

  // Field Arrays for lists
  const { fields: diagnosticosFields, append: appendDiagnostico, remove: removeDiagnostico } = useFieldArray({
    control,
    name: "diagnosticos"
  });

  const { fields: tratamientosFields, append: appendTratamiento, remove: removeTratamiento } = useFieldArray({
    control,
    name: "planesTratamiento"
  });

  const { fields: examenesFields, append: appendExamen, remove: removeExamen } = useFieldArray({
    control,
    name: "examenesSolicitados"
  });

  useEffect(() => {
    const dataToLoad = loadedData || initialData;
    if (dataToLoad) {
      const formattedData = {
        ...dataToLoad,
        fechaConsulta: dataToLoad.fechaConsulta ? new Date(dataToLoad.fechaConsulta).toISOString().slice(0, 16) : ""
      };
      reset(formattedData);
    }
  }, [loadedData, initialData, reset]);

  const onSubmitForm = async (data: EvolucionMedicaRequest) => {
    if (!data.motivoAtencion?.motivoConsulta) {
      toast.error("El motivo de consulta es obligatorio.");
      setActiveTab("motivo");
      return;
    }

    if ((data.planesTratamiento?.length ?? 0) > 0 || (data.examenesSolicitados?.length ?? 0) > 0) {
      if ((data.diagnosticos?.length ?? 0) === 0) {
        toast.error("Debe registrar al menos un diagnóstico si hay tratamientos o exámenes.");
        setActiveTab("diagnostico");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        fechaConsulta: new Date(data.fechaConsulta || Date.now()).toISOString()
      };

      if (evolutionId || (loadedData && loadedData.id)) {
        const idToUpdate = evolutionId || loadedData!.id;
        await updateEvolucion(idToUpdate, payload);
        toast.success("Evolución actualizada correctamente");
      } else {
        await createEvolucion(payload);
        toast.success("Evolución creada correctamente");
      }
      handleSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar la evolución");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate IMC automatically - MUST be before any conditional returns
  const peso = watch("signosVitales.peso");
  const talla = watch("signosVitales.talla");

  useEffect(() => {
    if (peso && talla) {
      const tallaMetros = talla / 100;
      if (tallaMetros > 0) {
        const imc = peso / (tallaMetros * tallaMetros);
        setValue("signosVitales.imc", parseFloat(imc.toFixed(2)));
      }
    }
  }, [peso, talla, setValue]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-3">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
        <span>Cargando datos de la evolución...</span>
      </div>
    );
  }

  const tabs = [
    { id: "motivo", label: "1. Motivo" },
    { id: "signos", label: "2. Signos Vitales" },
    { id: "valoracion", label: "3. Valoración" },
    { id: "diagnostico", label: "4. Diagnósticos" },
    { id: "tratamiento", label: "5. Tratamiento" },
    { id: "examenes", label: "6. Exámenes" },
    { id: "alta", label: "7. Alta" },
  ];

  // Calculate progress based on filled fields
  const currentTabIndex = tabs.findIndex(t => t.id === activeTab);
  const progressPercentage = ((currentTabIndex + 1) / tabs.length) * 100;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <div className="flex items-center gap-3">
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200 text-slate-500"
          >
            <img src={ArrowLeftIcon.src} alt="Volver" className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-800">
            {evolutionId ? "Editar Evolución" : "Nueva Evolución Médica"}
          </h2>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit(onSubmitForm)}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <img src={SaveIcon.src} alt="Guardar" className="w-4 h-4" />
            {isSubmitting ? "Guardando..." : "Guardar Evolución"}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-3 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>Progreso del formulario</span>
          <span className="font-medium text-primary">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary-400 rounded-full transition-all duration-300"
            style={{ width: `${ progressPercentage }%` }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto bg-white">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${ activeTab === tab.id
              ? "border-primary text-primary bg-primary/5"
              : index < currentTabIndex
                ? "border-transparent text-green-600 hover:bg-green-50"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
          >
            {index < currentTabIndex && <span className="text-green-500">✓</span>}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form Content */}
      <div className="p-6 overflow-y-auto flex-1">
        <form className="max-w-5xl mx-auto space-y-8">

          {/* TAB: MOTIVO */}
          {activeTab === "motivo" && (
            <div className="space-y-8 animate-fadeIn">
              {/* Datos Básicos */}
              <section>
                <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full"></span>
                  Datos de la Consulta
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Fecha y Hora"
                    type="datetime-local"
                    {...register("fechaConsulta")}
                    error={errors.fechaConsulta?.message}
                  />
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo de Consulta</label>
                    <select
                      {...register("tipoConsulta")}
                      className="w-full h-11 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="CONSULTA EXTERNA">Consulta Externa</option>
                      <option value="EMERGENCIA">Emergencia</option>
                      <option value="CONTROL">Control</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Observaciones Generales</label>
                    <textarea
                      {...register("observacionesGenerales")}
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>
                </div>
              </section>

              {/* Motivo de Atención */}
              <section>
                <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full"></span>
                  Motivo de Atención
                </h3>
                <div className="space-y-4">
                  <Input
                    label="Motivo de Consulta"
                    {...register("motivoAtencion.motivoConsulta")}
                    placeholder="Ej: Dolor abdominal..."
                  />
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Enfermedad Actual</label>
                    <textarea
                      {...register("motivoAtencion.enfermedadActual")}
                      rows={3}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      placeholder="Descripción detallada de la enfermedad actual..."
                    />
                  </div>
                </div>
              </section>

              {/* Navigation buttons */}
              <div className="flex justify-end pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab("signos")}
                  className="px-4 py-2 text-sm font-medium text-primary hover:underline"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}

          {/* TAB: SIGNOS VITALES */}
          {activeTab === "signos" && (
            <div className="space-y-8 animate-fadeIn">
              <section>
                <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full"></span>
                  Signos Vitales
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Input label="Presión Sistólica (mmHg)" type="number" {...register("signosVitales.presionArterialSistolica", { valueAsNumber: true })} />
                  <Input label="Presión Diastólica (mmHg)" type="number" {...register("signosVitales.presionArterialDiastolica", { valueAsNumber: true })} />
                  <Input label="Frecuencia Cardíaca (lpm)" type="number" {...register("signosVitales.frecuenciaCardiaca", { valueAsNumber: true })} />
                  <Input label="Frecuencia Respiratoria (rpm)" type="number" {...register("signosVitales.frecuenciaRespiratoria", { valueAsNumber: true })} />
                  <Input label="Temperatura (°C)" type="number" step="0.1" {...register("signosVitales.temperatura", { valueAsNumber: true })} />
                  <Input label="Saturación O2 (%)" type="number" {...register("signosVitales.saturacionOxigeno", { valueAsNumber: true })} />
                  <Input label="Peso (kg)" type="number" step="0.01" {...register("signosVitales.peso", { valueAsNumber: true })} />
                  <Input label="Talla (cm)" type="number" step="0.01" {...register("signosVitales.talla", { valueAsNumber: true })} />
                  <Input label="Glucosa (mg/dL)" type="number" {...register("signosVitales.glucosa", { valueAsNumber: true })} />
                  <Input label="IMC" type="number" disabled {...register("signosVitales.imc")} className="bg-slate-100" />
                </div>
              </section>

              {/* Navigation buttons */}
              <div className="flex justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab("motivo")}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  ← Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("valoracion")}
                  className="px-4 py-2 text-sm font-medium text-primary hover:underline"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}

          {/* TAB: VALORACION */}
          {activeTab === "valoracion" && (
            <div className="space-y-8 animate-fadeIn">
              <section>
                <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full"></span>
                  Valoración Clínica (Examen Físico)
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { key: "inspeccionGeneral", label: "Inspección General" },
                    { key: "cabezaCuello", label: "Cabeza y Cuello" },
                    { key: "torax", label: "Tórax" },
                    { key: "abdomen", label: "Abdomen" },
                    { key: "extremidades", label: "Extremidades" },
                    { key: "neurologico", label: "Neurológico" },
                    { key: "pielTegumentos", label: "Piel y Tegumentos" },
                    { key: "otrosHallazgos", label: "Otros Hallazgos" },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">{field.label}</label>
                      <textarea
                        {...register(`valoracionClinica.${ field.key }` as any)}
                        rows={2}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full"></span>
                  Antecedentes del Incidente (Opcional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: "antecedentesPersonales", label: "Personales" },
                    { key: "antecedentesFamiliares", label: "Familiares" },
                    { key: "habitosToxicos", label: "Hábitos Tóxicos" },
                    { key: "alergias", label: "Alergias" },
                    { key: "medicamentosActuales", label: "Medicamentos Actuales" },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">{field.label}</label>
                      <input
                        type="text"
                        {...register(`antecedentesIncidente.${ field.key }` as any)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* Navigation buttons */}
              <div className="flex justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab("signos")}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  ← Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("diagnostico")}
                  className="px-4 py-2 text-sm font-medium text-primary hover:underline"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}

          {/* TAB: DIAGNOSTICO */}
          {activeTab === "diagnostico" && (
            <div className="space-y-8 animate-fadeIn">
              {/* Diagnósticos */}
              <section>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-1 h-6 bg-primary rounded-full"></span>
                    Diagnósticos
                  </h3>
                  <button
                    type="button"
                    onClick={() => appendDiagnostico({ diagnostico: "", tipo: "PRESUNTIVO", codigoCie: "" })}
                    className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
                  >
                    <img src={PlusIcon.src} alt="Agregar" className="w-4 h-4" />
                    Agregar Diagnóstico
                  </button>
                </div>

                <div className="space-y-4">
                  {diagnosticosFields.map((field, index) => (
                    <div key={field.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative">
                      <button
                        type="button"
                        onClick={() => removeDiagnostico(index)}
                        className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                      >
                        <img src={TrashIcon.src} alt="Eliminar" className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          label="CIE-10 (Código)"
                          {...register(`diagnosticos.${ index }.codigoCie`)}
                          placeholder="Ej: K35"
                        />
                        <div className="md:col-span-2">
                          <Input
                            label="Diagnóstico"
                            {...register(`diagnosticos.${ index }.diagnostico`)}
                            placeholder="Descripción del diagnóstico"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo</label>
                          <select
                            {...register(`diagnosticos.${ index }.tipo`)}
                            className="w-full h-11 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="PRESUNTIVO">Presuntivo</option>
                            <option value="DEFINITIVO">Definitivo</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <Input
                            label="Observaciones"
                            {...register(`diagnosticos.${ index }.observaciones`)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {diagnosticosFields.length === 0 && (
                    <p className="text-sm text-slate-500 italic text-center py-4">No hay diagnósticos registrados.</p>
                  )}
                </div>
              </section>

              {/* Navigation buttons */}
              <div className="flex justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab("valoracion")}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  ← Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("tratamiento")}
                  className="px-4 py-2 text-sm font-medium text-primary hover:underline"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}

          {/* TAB: TRATAMIENTO */}
          {activeTab === "tratamiento" && (
            <div className="space-y-8 animate-fadeIn">
              {/* Planes de Tratamiento */}
              <section>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-1 h-6 bg-primary rounded-full"></span>
                    Planes de Tratamiento
                  </h3>
                  <button
                    type="button"
                    onClick={() => appendTratamiento({ nombreTratamiento: "", descripcion: "" })}
                    className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
                  >
                    <img src={PlusIcon.src} alt="Agregar" className="w-4 h-4" />
                    Agregar Tratamiento
                  </button>
                </div>

                <div className="space-y-4">
                  {tratamientosFields.map((field, index) => (
                    <div key={field.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative">
                      <button
                        type="button"
                        onClick={() => removeTratamiento(index)}
                        className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                      >
                        <img src={TrashIcon.src} alt="Eliminar" className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-1 gap-4">
                        <Input
                          label="Nombre del Tratamiento"
                          {...register(`planesTratamiento.${ index }.nombreTratamiento`)}
                        />
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción / Indicaciones</label>
                          <textarea
                            {...register(`planesTratamiento.${ index }.descripcion`)}
                            rows={3}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="Duración"
                            {...register(`planesTratamiento.${ index }.duracion`)}
                            placeholder="Ej: 7 días"
                          />
                          <Input
                            label="Tipo"
                            {...register(`planesTratamiento.${ index }.tipoTratamiento`)}
                            placeholder="Ej: MEDICAMENTOSO"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {tratamientosFields.length === 0 && (
                    <p className="text-sm text-slate-500 italic text-center py-4">No hay tratamientos registrados.</p>
                  )}
                </div>
              </section>

              {/* Navigation buttons */}
              <div className="flex justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab("diagnostico")}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  ← Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("examenes")}
                  className="px-4 py-2 text-sm font-medium text-primary hover:underline"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}

          {/* TAB: EXAMENES */}
          {activeTab === "examenes" && (
            <div className="space-y-8 animate-fadeIn">
              {/* Exámenes */}
              <section>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-1 h-6 bg-primary rounded-full"></span>
                    Exámenes Solicitados
                  </h3>
                  <button
                    type="button"
                    onClick={() => appendExamen({ nombreExamen: "", tipoExamen: "LABORATORIO" })}
                    className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
                  >
                    <img src={PlusIcon.src} alt="Agregar" className="w-4 h-4" />
                    Agregar Examen
                  </button>
                </div>
                <div className="space-y-4">
                  {examenesFields.map((field, index) => (
                    <div key={field.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative">
                      <button
                        type="button"
                        onClick={() => removeExamen(index)}
                        className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                      >
                        <img src={TrashIcon.src} alt="Eliminar" className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Nombre Examen"
                          {...register(`examenesSolicitados.${ index }.nombreExamen`)}
                        />
                        <Input
                          label="Tipo"
                          {...register(`examenesSolicitados.${ index }.tipoExamen`)}
                        />
                        <Input
                          label="Indicaciones"
                          {...register(`examenesSolicitados.${ index }.indicaciones`)}
                        />
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Urgencia</label>
                          <select
                            {...register(`examenesSolicitados.${ index }.urgencia`)}
                            className="w-full h-11 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="RUTINA">Rutina</option>
                            <option value="URGENCIA">Urgencia</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                  {examenesFields.length === 0 && (
                    <p className="text-sm text-slate-500 italic text-center py-4">No hay exámenes solicitados.</p>
                  )}
                </div>
              </section>

              {/* Navigation buttons */}
              <div className="flex justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab("tratamiento")}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  ← Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("alta")}
                  className="px-4 py-2 text-sm font-medium text-primary hover:underline"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}

          {/* TAB: ALTA */}
          {activeTab === "alta" && (
            <div className="space-y-8 animate-fadeIn">
              {/* Alta Médica */}
              <section>
                <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-green-500 rounded-full"></span>
                  Alta Médica
                </h3>
                <p className="text-sm text-slate-500 mb-4">Complete esta sección al dar de alta al paciente.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo de Alta</label>
                    <select
                      {...register("altaMedica.tipoAlta")}
                      className="w-full h-11 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="MEJORIA">Mejoría</option>
                      <option value="CURACION">Curación</option>
                      <option value="VOLUNTARIA">Voluntaria</option>
                      <option value="REFERENCIA">Referencia</option>
                      <option value="DEFUNCION">Defunción</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Condición al Alta</label>
                    <select
                      {...register("altaMedica.condicionAlta")}
                      className="w-full h-11 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="BUENA">Buena</option>
                      <option value="REGULAR">Regular</option>
                      <option value="MALA">Mala</option>
                      <option value="FALLECIDO">Fallecido</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Recomendaciones</label>
                    <textarea
                      {...register("altaMedica.recomendaciones")}
                      rows={3}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      placeholder="Indicaciones para el paciente al alta..."
                    />
                  </div>
                  <Input label="Control Programado" type="date" {...register("altaMedica.controlProgramado")} />
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Especialidad para Control</label>
                    <select
                      {...register("altaMedica.especialidadControl")}
                      className="w-full h-11 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="MEDICINA_GENERAL">Medicina General</option>
                      <option value="CIRUGIA">Cirugía</option>
                      <option value="GINECOLOGIA">Ginecología</option>
                      <option value="PEDIATRIA">Pediatría</option>
                      <option value="TRAUMATOLOGIA">Traumatología</option>
                      <option value="CARDIOLOGIA">Cardiología</option>
                      <option value="NEUROLOGIA">Neurología</option>
                      <option value="OTRO">Otro</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Emergencia Obstétrica - Sección Opcional Colapsable */}
              <section className="border border-pink-200 rounded-xl overflow-hidden">
                <details className="group">
                  <summary className="flex items-center justify-between p-4 bg-pink-50 cursor-pointer hover:bg-pink-100 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="w-1 h-6 bg-pink-500 rounded-full"></span>
                      <h3 className="text-base font-semibold text-slate-900">Emergencia Obstétrica</h3>
                      <span className="text-xs font-medium text-pink-600 bg-pink-100 px-2 py-0.5 rounded-full">Opcional</span>
                    </div>
                    <span className="text-pink-500 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="p-4 bg-white">
                    <p className="text-sm text-slate-500 mb-4">Complete esta sección solo si aplica a la consulta.</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <Input label="Gestas Previas" type="number" {...register("emergenciaObstetrica.gestasPrevias" as any, { valueAsNumber: true })} />
                      <Input label="Partos Previos" type="number" {...register("emergenciaObstetrica.partosPrevios" as any, { valueAsNumber: true })} />
                      <Input label="Abortos Previos" type="number" {...register("emergenciaObstetrica.abortosPrevios" as any, { valueAsNumber: true })} />
                      <Input label="Semanas Gestación" type="number" {...register("emergenciaObstetrica.semanasGestacion" as any, { valueAsNumber: true })} />
                      <Input label="FUM (Última Menstruación)" type="date" {...register("emergenciaObstetrica.fum" as any)} />
                      <Input label="FPP (Probable Parto)" type="date" {...register("emergenciaObstetrica.fpp" as any)} />
                      <Input label="Latidos Fetales" {...register("emergenciaObstetrica.latidosFetales" as any)} placeholder="Ej: 140 lpm" />
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Presentación</label>
                        <select
                          {...register("emergenciaObstetrica.presentacion" as any)}
                          className="w-full h-11 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Seleccionar...</option>
                          <option value="CEFALICA">Cefálica</option>
                          <option value="PODALICA">Podálica</option>
                          <option value="TRANSVERSA">Transversa</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <Input label="Dinámica Uterina" {...register("emergenciaObstetrica.dinamicaUterina" as any)} placeholder="Ej: Contracciones cada 5 minutos" />
                      </div>
                    </div>
                  </div>
                </details>
              </section>

              {/* Navigation buttons */}
              <div className="flex justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab("examenes")}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  ← Anterior
                </button>
                <button
                  type="button"
                  onClick={handleSubmit(onSubmitForm)}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-70"
                >
                  <img src={SaveIcon.src} alt="Guardar" className="w-4 h-4" />
                  {isSubmitting ? "Guardando..." : "Finalizar y Guardar"}
                </button>
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  );
}
