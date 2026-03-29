import React, { useState } from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const Calendar = ({ selectedDate, onDateSelect, minDate, label }) => {
  const today = new Date();
  const [viewDate, setViewDate] = useState(selectedDate || today);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const isSelected = (day) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    );
  };

  const isToday = (day) => {
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };

  const isDisabled = (day) => {
    if (!minDate) return false;
    const d = new Date(year, month, day);
    return d < minDate;
  };

  const handleDayClick = (day) => {
    if (isDisabled(day)) return;
    onDateSelect(new Date(year, month, day));
  };

  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-outline-variant/20 w-full overflow-hidden">
      {label && (
        <div className="px-5 pt-4 pb-0">
          <span className="text-[11px] font-bold tracking-widest uppercase text-on-surface-variant font-label">{label}</span>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <button
          onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-on-surface-variant"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_left</span>
        </button>
        <h3 className="font-headline font-bold text-on-surface text-base">
          {MONTHS[month]} {year}
        </h3>
        <button
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-on-surface-variant"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_right</span>
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 px-3 pb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[11px] font-bold text-on-surface-variant font-label tracking-wider py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7 px-3 pb-4 gap-y-1">
        {blanks.map((_, i) => <div key={`b-${i}`} />)}
        {days.map(day => (
          <button
            key={day}
            onClick={() => handleDayClick(day)}
            disabled={isDisabled(day)}
            className={`
              mx-auto w-9 h-9 rounded-full text-sm font-medium transition-all flex items-center justify-center
              ${isSelected(day)
                ? 'bg-primary text-white font-bold shadow-md shadow-primary/30 scale-110'
                : isToday(day)
                ? 'border-2 border-primary text-primary font-bold'
                : isDisabled(day)
                ? 'text-outline/40 cursor-not-allowed'
                : 'text-on-surface hover:bg-surface-container-low cursor-pointer'
              }
            `}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Selected date footer */}
      {selectedDate && (
        <div className="px-5 py-3 bg-surface-container-low border-t border-outline-variant/20 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>event</span>
          <span className="text-sm font-semibold text-on-surface font-label">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      )}
    </div>
  );
};

export default Calendar;
