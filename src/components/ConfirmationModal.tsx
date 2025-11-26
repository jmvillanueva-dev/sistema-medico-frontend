import { useEffect, useRef, useCallback } from "react";
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
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Memoizar onCancel para evitar re-renders innecesarios
  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  // Enfocar el botón de cancelar cuando se abre el modal
  useEffect(() => {
    if (isOpen && cancelButtonRef.current) {
      const timer = setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Manejar tecla Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        handleCancel();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleCancel]);

  // Manejar clic en el overlay
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      handleCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirmation-title"
      aria-describedby="confirmation-message"
    >
      <div className="modal-content">
        <h2 id="confirmation-title">{title}</h2>
        <p id="confirmation-message">{message}</p>
        <div className="modal-actions">
          <button
            ref={cancelButtonRef}
            className="btn btn-blue-system"
            onClick={handleCancel}
            type="button"
          >
            <img src={CloseIcon.src} alt="" aria-hidden="true" />
            <span>{cancelButtonText}</span>
          </button>
          <button className="btn btn-danger" onClick={onConfirm} type="button">
            <img src={DeleteIcon.src} alt="" aria-hidden="true" />
            <span>{confirmButtonText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
