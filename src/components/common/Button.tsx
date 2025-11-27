import React from "react";

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
    const baseStyles = "inline-flex items-center justify-center gap-2 font-semibold rounded-xl border border-transparent cursor-pointer transition-all no-underline whitespace-nowrap focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:grayscale-50";
    
    const variants = {
      primary: "bg-primary text-white hover:not-disabled:bg-blue-700 hover:not-disabled:shadow-md active:not-disabled:scale-95",
      secondary: "bg-white border-slate-200 text-slate-900 hover:not-disabled:border-primary hover:not-disabled:text-primary hover:not-disabled:bg-blue-50 active:not-disabled:scale-95",
      danger: "bg-red-50 text-red-600 hover:not-disabled:bg-red-600 hover:not-disabled:text-white active:not-disabled:scale-95",
      ghost: "bg-transparent text-slate-600 hover:not-disabled:bg-blue-50 hover:not-disabled:text-primary active:not-disabled:scale-95",
    };

    const sizes = {
      sm: "h-9 px-3 text-xs",
      md: "h-11 px-4 text-sm sm:h-12",
      lg: "h-13 px-6 text-base sm:h-14",
    };

    const classNames = [
      baseStyles,
      variants[variant],
      sizes[size],
      fullWidth && "w-full",
      isLoading && "relative pointer-events-none",
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
          <span className="flex items-center justify-center" aria-hidden="true">
            <svg
              className="w-5 h-5 animate-spin"
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
          <span className="flex items-center justify-center w-5 h-5">{icon}</span>
        )}

        <span className="flex items-center">
          {isLoading ? "Procesando..." : children}
        </span>

        {!isLoading && icon && iconPosition === "right" && (
          <span className="flex items-center justify-center w-5 h-5">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
