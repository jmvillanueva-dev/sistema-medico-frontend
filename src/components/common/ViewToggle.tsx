import React from "react";

interface ViewToggleProps {
  viewMode: "list" | "grid";
  onToggle: (mode: "list" | "grid") => void;
}

export default function ViewToggle({ viewMode, onToggle }: ViewToggleProps) {
  return (
    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
      <button
        onClick={() => onToggle("list")}
        className={`p-1.5 rounded-md transition-all duration-200 ${
          viewMode === "list"
            ? "bg-white text-primary shadow-sm"
            : "text-slate-400 hover:text-slate-600"
        }`}
        title="Vista de lista"
        aria-label="Vista de lista"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
      </button>
      <button
        onClick={() => onToggle("grid")}
        className={`p-1.5 rounded-md transition-all duration-200 ${
          viewMode === "grid"
            ? "bg-white text-primary shadow-sm"
            : "text-slate-400 hover:text-slate-600"
        }`}
        title="Vista de cuadrícula"
        aria-label="Vista de cuadrícula"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      </button>
    </div>
  );
}
