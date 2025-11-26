import React, { useState, useEffect } from "react";

// 1. Definición de tipos para las props
interface NotificationProps {
  message: string;
  type: "success" | "error" | "info" | "warning";
  isVisible: boolean;
  onClose: () => void;
}

/**
 * Componente reutilizable para mostrar notificaciones (toasts).
 * Soporta múltiples tipos: success, error, info, warning.
 * Usa los Design Tokens definidos en global.css.
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
      // Configura un temporizador para ocultar el toast automáticamente después de 5 segundos
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer); // Limpieza del temporizador
    }
  }, [isVisible, onClose]);

  // Ocultar el componente completamente cuando isVisible es falso Y la transición terminó
  if (!display) {
    return null;
  }

  // Define las clases de estilo basadas en el tipo de mensaje
  const getTypeClass = () => {
    switch (type) {
      case "success":
        return "toast--success";
      case "error":
        return "toast--error";
      case "warning":
        return "toast--warning";
      case "info":
      default:
        return "toast--info";
    }
  };

  // Define el icono basado en el tipo
  const getIcon = () => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "info":
      default:
        return "ℹ️";
    }
  };

  // El toast se oculta mediante clases CSS de transición, controladas por 'isVisible'
  return (
    <div
      className={`toast-container ${isVisible ? "toast-visible" : "toast-hidden"}`}
      // Cuando la transición CSS termina, si no es visible, establece display en false
      onTransitionEnd={() => !isVisible && setDisplay(false)}
      role="alert"
      aria-live="polite"
    >
      <div className={`toast-content ${getTypeClass()}`}>
        <span className="toast-icon" aria-hidden="true">
          {getIcon()}
        </span>
        <p className="toast-message">{message}</p>
        <button
          onClick={onClose}
          className="toast-close-btn"
          aria-label="Cerrar notificación"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;

// Estilos CSS usando Design Tokens de global.css
const style = `
    .toast-container {
        position: fixed;
        top: var(--space-4);
        right: var(--space-4);
        z-index: 5000;
        opacity: 0;
        transform: translateX(100%);
        transition: opacity var(--transition-normal), transform var(--transition-normal);
        max-width: 400px;
        width: calc(100% - var(--space-8));
    }

    .toast-visible {
        opacity: 1;
        transform: translateX(0);
    }

    .toast-hidden {
        opacity: 0;
        transform: translateX(100%);
    }

    .toast-content {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-4);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        border: 1px solid transparent;
    }

    .toast-icon {
        font-size: 1.25rem;
        flex-shrink: 0;
    }

    .toast-message {
        flex: 1;
        margin: 0;
        font-size: var(--font-size-sm);
        font-weight: 500;
        line-height: var(--line-height-base);
    }

    .toast-close-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        cursor: pointer;
        padding: var(--space-1);
        border-radius: var(--radius-sm);
        transition: background-color var(--transition-fast), opacity var(--transition-fast);
        opacity: 0.7;
        flex-shrink: 0;
    }

    .toast-close-btn:hover {
        opacity: 1;
        background-color: rgba(0, 0, 0, 0.1);
    }

    .toast-close-btn:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: 2px;
    }

    /* === Toast Type Variants === */
    .toast--success {
        background-color: var(--color-success-bg);
        color: var(--color-success);
        border-color: var(--color-success);
    }

    .toast--error {
        background-color: var(--color-error-bg);
        color: var(--color-error);
        border-color: var(--color-error);
    }

    .toast--warning {
        background-color: var(--color-warning-bg);
        color: var(--color-warning);
        border-color: var(--color-warning);
    }

    .toast--info {
        background-color: var(--color-info-bg);
        color: var(--color-info);
        border-color: var(--color-info);
    }

    /* === Responsive === */
    @media (max-width: 640px) {
        .toast-container {
            top: auto;
            bottom: var(--space-4);
            left: var(--space-4);
            right: var(--space-4);
            width: auto;
            max-width: none;
        }

        .toast-visible {
            transform: translateY(0);
        }

        .toast-hidden {
            transform: translateY(100%);
        }
    }
`;

// Inyección de estilos en el DOM si no están ya
if (
  typeof document !== "undefined" &&
  !document.getElementById("toast-styles")
) {
  const styleTag = document.createElement("style");
  styleTag.id = "toast-styles";
  styleTag.textContent = style;
  document.head.appendChild(styleTag);
}
