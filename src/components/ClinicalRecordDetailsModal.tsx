import type { ClinicalRecord } from "../types/clinicalRecord";
import Modal from "./common/Modal";
import Button from "./common/Button";
import EditIcon from "@/icons/system/edit.svg";
import ClipboardIcon from "@/icons/system/clipboard.svg";
import { toast } from "react-toastify";

interface ClinicalRecordDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    record: ClinicalRecord | null;
    onEdit?: (record: ClinicalRecord) => void;
    showFooter?: boolean;
}

export default function ClinicalRecordDetailsModal({
    isOpen,
    onClose,
    record,
    onEdit,
    showFooter = true,
}: ClinicalRecordDetailsModalProps) {
    if (!record) return null;

    const handleViewEvolutions = () => {
        window.location.href = `/medical/evolutions?historiaClinicaId=${ record.id }`;
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Historia Clínica #${ record.numeroHistoriaClinica }`}
            size="lg"
        >
            <div className="space-y-6">
                {/* Header with Patient Info */}
                <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Información del Paciente</h4>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0">
                            {record.pacienteNombreCompleto.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">
                                {record.pacienteNombreCompleto}
                            </h3>
                            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600 mt-1">
                                <p><span className="font-medium text-slate-900">Cédula:</span> {record.pacienteCedula}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Clinical Record Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h4 className="font-semibold text-slate-700 uppercase border-b border-slate-100 pb-2">Información Institución</h4>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-slate-500 text-xs uppercase tracking-wider font-medium">Institución del Sistema</p>
                                <p className="text-slate-900 font-medium">{record.institucionSistema || "No registrado"}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs uppercase tracking-wider font-medium">Unidad Operativa</p>
                                <p className="text-slate-900 font-medium">{record.unidadOperativa || "No registrado"}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs uppercase tracking-wider font-medium">Código de Unidad</p>
                                <p className="text-slate-900 font-medium">{record.codUnidad || "No registrado"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-semibold text-slate-700 uppercase border-b border-slate-100 pb-2">Registro</h4>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-slate-500 text-xs uppercase tracking-wider font-medium">Fecha de Creación</p>
                                <p className="text-slate-900 font-medium">
                                    {record.fechaCreacion ? new Date(record.fechaCreacion).toLocaleString() : "-"}
                                </p>
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs uppercase tracking-wider font-medium">Última Actualización</p>
                                <p className="text-slate-900 font-medium">
                                    {record.fechaActualizacion ? new Date(record.fechaActualizacion).toLocaleString() : "-"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Evolutions Summary */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm">
                            <img src={ClipboardIcon.src} alt="" className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-blue-900 font-medium">Evoluciones Médicas</p>
                            <p className="text-xs text-blue-700">Total registradas: <span className="font-bold">{record.totalEvoluciones}</span></p>
                        </div>
                    </div>
                    <Button onClick={handleViewEvolutions} size="sm">
                        Ver Evoluciones
                    </Button>
                </div>

                {/* Actions Footer */}
                {showFooter && (
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button variant="secondary" onClick={onClose}>
                            Cerrar
                        </Button>
                        {onEdit && (
                            <Button
                                onClick={() => {
                                    onClose();
                                    onEdit(record);
                                }}
                                className="flex items-center gap-2"
                            >
                                <img src={EditIcon.src} alt="" className="w-4 h-4 brightness-0 invert" />
                                Editar Historia
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
}
