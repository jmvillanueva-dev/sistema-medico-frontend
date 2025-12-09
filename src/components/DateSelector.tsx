import React from "react";

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onDateChange,
}) => {
  // Helper functions
  const formatDay = (date: Date): string => {
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

  // Generate 7 days for display (3 before, selected, 3 after)
  const generateDays = (): Date[] => {
    const days: Date[] = [];
    for (let i = -3; i <= 3; i++) {
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

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 p-4">
      {/* Header with month/year and Today button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 capitalize">
          {formatMonthYear(selectedDate)}
        </h2>
        <button
          onClick={handleToday}
          className="px-4 py-2 text-sm font-medium text-primary hover:bg-blue-50 rounded-lg transition-colors"
        >
          Hoy
        </button>
      </div>

      {/* Calendar navigation */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <button
          onClick={handlePreviousWeek}
          className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
          aria-label="Semana anterior"
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
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Days container */}
        <div className="flex-1 grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const isSelected = isSameDay(day, selectedDate);
            const isTodayDay = isToday(day);

            return (
              <button
                key={index}
                onClick={() => handleDateClick(day)}
                className={`
                  flex flex-col items-center justify-center p-3 rounded-lg transition-all
                  ${
                    isSelected
                      ? "bg-primary text-white shadow-md"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }
                  ${isTodayDay && !isSelected ? "ring-2 ring-primary ring-opacity-50" : ""}
                `}
              >
                <span className="text-xs font-medium capitalize mb-1">
                  {formatDay(day)}
                </span>
                <span className="text-lg font-bold">
                  {formatDayNumber(day)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Next button */}
        <button
          onClick={handleNextWeek}
          className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
          aria-label="Semana siguiente"
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
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default DateSelector;
