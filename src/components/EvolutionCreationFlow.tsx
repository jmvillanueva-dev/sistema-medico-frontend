import { useState, useEffect } from "react";
import ClinicalRecordSelector from "./ClinicalRecordSelector";
import MedicalEvolutionForm from "./MedicalEvolution/MedicalEvolutionForm";
import ConfirmationModal from "./ConfirmationModal";
import type { ClinicalRecord } from "../types/clinicalRecord";
import { getClinicalRecordById } from "../services/clinicalRecordService";
import { useAuthStore } from "@/store/authStore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Icons
import ArrowLeftIcon from "@/icons/system/arrow-left.svg";
import ClipboardIcon from "@/icons/system/clipboard.svg";

type Step = "select-hc" | "form";

interface EvolutionCreationFlowProps {
  hcId?: string | null;
}

export default function EvolutionCreationFlow({ hcId }: EvolutionCreationFlowProps) {
  const [step, setStep] = useState<Step>("select-hc");
  const [selectedHC, setSelectedHC] = useState<ClinicalRecord | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isLoadingHC, setIsLoadingHC] = useState(false);
  const { user } = useAuthStore();

  // Auto-load HC if hcId is provided
  useEffect(() => {
    if (hcId && !selectedHC) {
      const loadHC = async () => {
        setIsLoadingHC(true);
        try {
          const response = await getClinicalRecordById(hcId);
          if (response.data.success && response.data.data) {
            setSelectedHC(response.data.data);
            setStep("form");
            toast.success("Historia clínica cargada");
          } else {
            toast.error("No se pudo cargar la historia clínica");
          }
        } catch (error) {
          console.error("Error loading HC:", error);
          toast.error("Error al cargar la historia clínica");
        } finally {
          setIsLoadingHC(false);
        }
      };
      loadHC();
    }
  }, [hcId, selectedHC]);

  const handleSelectHC = (clinicalRecord: ClinicalRecord) => {
    setSelectedHC(clinicalRecord);
    setStep("form");
  };

  const handleBackToSelection = () => {
    // If we have hcId (came from HC view), go back in history
    if (hcId) {
      window.history.back();
    } else {
      setStep("select-hc");
    }
  };

  const handleCancelSelection = () => {
    // If we have hcId (came from HC view), go back in history
    if (hcId) {
      window.history.back();
    } else {
      window.location.href = "/medical/evolutions";
    }
  };

  const handleFormSuccess = () => {
    // Redirect to evolutions list filtered by the selected HC
    if (selectedHC) {
      window.location.href = `/medical/evolutions?historiaClinicaId=${ selectedHC.id }`;
    } else {
      window.location.href = "/medical/evolutions";
    }
  };

  const handleFormCancel = () => {
    // Show confirmation modal instead of window.confirm
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    // If we have hcId (came from HC view), go back in history
    if (hcId) {
      window.history.back();
    } else {
      window.location.href = "/medical/evolutions";
    }
  };

  const handleCancelModal = () => {
    setShowCancelModal(false);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50">
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 99999 }}
      />

      {/* Loading state when auto-loading HC */}
      {isLoadingHC && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Cargando historia clínica...</p>
          </div>
        </div>
      )}

      {/* Step 1: Select Clinical Record */}
      {step === "select-hc" && !isLoadingHC && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ClinicalRecordSelector
            onSelect={handleSelectHC}
            onCancel={handleCancelSelection}
          />
        </div>
      )}

      {/* Step 2: Evolution Form */}
      {step === "form" && selectedHC && (
        <div className="w-full min-h-screen bg-slate-50">
          {/* HC Context Banner */}
          <div className="top-0 left-0 right-0 z-20 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <img src={ClipboardIcon.src} alt="HC" className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                        HC: {selectedHC.numeroHistoriaClinica}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg">
                      {selectedHC.pacienteNombreCompleto}
                    </h3>
                    <p className="text-sm text-slate-600">
                      Cédula: {selectedHC.pacienteCedula}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleBackToSelection}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <img src={ArrowLeftIcon.src} alt="Volver" className="w-4 h-4" />
                  {hcId ? "Regresar" : "Cambiar HC"}
                </button>
              </div>
            </div>
          </div>

          {/* Form - with padding to account for fixed header */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-5">
            <MedicalEvolutionForm
              historiaClinicaId={selectedHC.id}
              empleadoId={user?.employeeId}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCancelModal}
        title="Cancelar Creación"
        message="¿Está seguro que desea cancelar la creación de la evolución médica? Los datos ingresados se perderán."
        onConfirm={handleConfirmCancel}
        onCancel={handleCancelModal}
        confirmButtonText="Sí, cancelar"
        cancelButtonText="No, continuar"
      />
    </div>
  );
}
