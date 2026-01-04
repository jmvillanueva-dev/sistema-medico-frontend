import React, { useState, useEffect } from "react";

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onDateChange,
}) => {
  // Track screen size for responsive behavior
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Day initials for mobile (Spanish)
  const dayInitials: { [key: number]: string } = {
    0: "D", // Domingo
    1: "L", // Lunes
    2: "M", // Martes
    3: "X", // Miércoles (X to differentiate from Martes)
    4: "J", // Jueves
    5: "V", // Viernes
    6: "S", // Sábado
  };

  // Helper functions
  const formatDay = (date: Date): string => {
    if (isMobile) {
      return dayInitials[date.getDay()];
    }
    return date.toLocaleDateString("es-ES", { weekday: "short" });
  };

  const formatDayNumber = (date: Date): string => {
    return date.getDate().toString();
  };

  const formatMonthYear = (date: Date): string => {
    return date.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  };

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isToday = (date: Date): boolean => {
    return isSameDay(date, new Date());
  };

  // Generate days for display
  // Mobile: 5 days (2 before, selected, 2 after)
  // Desktop: 7 days (3 before, selected, 3 after)
  const generateDays = (): Date[] => {
    const days: Date[] = [];
    const range = isMobile ? 2 : 3;
    for (let i = -range; i <= range; i++) {
      const date = new Date(selectedDate);
      date.setDate(selectedDate.getDate() + i);
      days.push(date);
    }
    return days;
  };

  // Navigation handlers
  const handlePreviousWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 7);
    onDateChange(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 7);
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const handleDateClick = (date: Date) => {
    onDateChange(date);
  };

  const days = generateDays();
  const gridCols = isMobile ? "grid-cols-5" : "grid-cols-7";

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 p-3 sm:p-4">
      {/* Header with month/year and Today button */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-slate-900 capitalize">
          {formatMonthYear(selectedDate)}
        </h2>
        <button
          onClick={handleToday}
          className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-primary hover:bg-blue-50 rounded-lg transition-colors"
        >
          Hoy
        </button>
      </div>

      {/* Calendar navigation */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Previous button */}
        <button
          onClick={handlePreviousWeek}
          className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors flex-shrink-0"
          aria-label="Semana anterior"
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
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Days container with proper gap */}
        <div className={`flex-1 grid ${ gridCols } gap-1 sm:gap-2`}>
          {days.map((day, index) => {
            const isSelected = isSameDay(day, selectedDate);
            const isTodayDay = isToday(day);

            return (
              <button
                key={index}
                onClick={() => handleDateClick(day)}
                className={`
                  flex flex-col items-center justify-center p-1.5 sm:p-3 rounded-lg transition-all min-w-0
                  ${ isSelected
                    ? "bg-primary text-white shadow-md"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }
                  ${ isTodayDay && !isSelected ? "ring-2 ring-primary ring-opacity-50" : "" }
                `}
              >
                <span className="text-[10px] sm:text-xs font-medium capitalize mb-0.5 sm:mb-1">
                  {formatDay(day)}
                </span>
                <span className="text-sm sm:text-lg font-bold">
                  {formatDayNumber(day)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Next button */}
        <button
          onClick={handleNextWeek}
          className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors flex-shrink-0"
          aria-label="Semana siguiente"
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
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default DateSelector;

