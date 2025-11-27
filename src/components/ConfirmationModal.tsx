import { useRef } from "react";
import { Modal } from "./common/Modal";
import { Button } from "./common/Button";
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

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm">
      <div className="flex flex-col gap-4">
        <p className="text-slate-600">{message}</p>
        <div className="flex justify-end gap-3 mt-4">
          <Button
            variant="secondary"
            onClick={onCancel}
            ref={cancelButtonRef}
            icon={<img src={CloseIcon.src} alt="" className="w-4 h-4" />}
          >
            {cancelButtonText}
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            icon={<img src={DeleteIcon.src} alt="" className="w-4 h-4" />}
          >
            {confirmButtonText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
