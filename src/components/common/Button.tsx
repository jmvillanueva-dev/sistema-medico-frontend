import React from "react";
import "./Button.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

/**
 * Componente Button reutilizable y accesible.
 * Soporta múltiples variantes, tamaños, estados de carga e iconos.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      icon,
      iconPosition = "left",
      fullWidth = false,
      className = "",
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    const classNames = [
      "btn-component",
      `btn-component--${variant}`,
      `btn-component--${size}`,
      fullWidth && "btn-component--full-width",
      isLoading && "btn-component--loading",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        type={type}
        className={classNames}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && (
          <span className="btn-component__spinner" aria-hidden="true">
            <svg
              className="spinner-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="31.4 31.4"
              />
            </svg>
          </span>
        )}

        {!isLoading && icon && iconPosition === "left" && (
          <span className="btn-component__icon">{icon}</span>
        )}

        <span className="btn-component__text">
          {isLoading ? "Procesando..." : children}
        </span>

        {!isLoading && icon && iconPosition === "right" && (
          <span className="btn-component__icon">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
