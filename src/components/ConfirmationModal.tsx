import "./ConfirmationModal.css";
import CloseIcon from "@/icons/system/close.svg";
import DeleteIcon from "@/icons/system/delete-full.svg";

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmButtonText = "Confirmar",
  cancelButtonText = "Cancelar",
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn btn-blue-system" onClick={onCancel}>
            <img src={CloseIcon.src} alt="Icon Cerrar" />
            {cancelButtonText}
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            <img src={DeleteIcon.src} alt="Icon Eliminar" />
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}
