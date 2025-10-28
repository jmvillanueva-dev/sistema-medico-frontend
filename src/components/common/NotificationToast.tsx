import React, { useState, useEffect } from "react";

// 1. Definición de tipos para las props
interface NotificationProps {
  message: string;
  type: "success" | "error" | "info";
  isVisible: boolean;
  onClose: () => void;
}

/**
 * Componente reutilizable para mostrar notificaciones (toasts).
 */
const NotificationToast: React.FC<NotificationProps> = ({
  message,
  type,
  isVisible,
  onClose,
}) => {
  // Usamos el estado interno para manejar la lógica de desvanecimiento (fade-out)
  const [display, setDisplay] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setDisplay(true);
      // Configura un temporizador para ocultar el toast automáticamente después de 4 segundos
      const timer = setTimeout(() => {
        onClose();
      }, 4000);

      return () => clearTimeout(timer); // Limpieza del temporizador
    }
  }, [isVisible, onClose]);

  // Ocultar el componente completamente cuando isVisible es falso Y la transición terminó
  if (!display) {
    return null;
  }

  // Define las clases de estilo basadas en el tipo de mensaje
  let toastClass = "";
  switch (type) {
    case "success":
      toastClass = "bg-green-600";
      break;
    case "error":
      toastClass = "bg-red-600";
      break;
    case "info":
    default:
      toastClass = "bg-blue-600";
      break;
  }

  // El toast se oculta mediante clases CSS de transición, controladas por 'isVisible'
  return (
    <div
      className={`toast-container ${isVisible ? "toast-visible" : "toast-hidden"}`}
      // Cuando la transición CSS termina, si no es visible, establece display en false
      onTransitionEnd={() => !isVisible && setDisplay(false)}
    >
      <div className={`toast-content ${toastClass}`}>
        <p>{message}</p>
        <button onClick={onClose} className="close-btn">
          &times;
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;

// Estilos CSS puro para el Toast (inyectados para mantener el componente autocontenido)
// Nota: Las variables CSS (como var(--color-light)) se asumen definidas en global.css
const style = `
    .toast-container {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        z-index: 5000;
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.4s ease-out, transform 0.4s ease-out;
    }

    .toast-visible {
        opacity: 1;
        transform: translateY(0);
    }

    .toast-hidden {
        /* Mantiene la posición y la visibilidad para permitir la animación de salida */
        opacity: 0;
        transform: translateY(20px);
    }

    .toast-content {
        display: flex;
        align-items: center;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: var(--color-light); /* Texto claro del global.css */
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .close-btn {
        background: none;
        border: none;
        color: var(--color-light);
        font-size: 1.5rem;
        margin-left: 1rem;
        cursor: pointer;
        line-height: 1;
        padding: 0 0.5rem;
    }

    /* Colores basados en el tipo de notificación */
    .bg-green-600 { background-color: #22c55e; } /* Success */
    .bg-red-600 { background-color: #ef4444; }   /* Error */
    .bg-blue-600 { background-color: var(--color-primary); } /* Info/Primary */
`;

// Inyección de estilos en el DOM si no están ya en global.css
if (
  typeof document !== "undefined" &&
  !document.getElementById("toast-styles")
) {
  const styleTag = document.createElement("style");
  styleTag.id = "toast-styles";
  styleTag.textContent = style;
  document.head.appendChild(styleTag);
}
