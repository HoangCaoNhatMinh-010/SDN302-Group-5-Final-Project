import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

export const DatePickerPlaceholder = ({
  label = 'Chọn ngày khám',
  value,
  onChange,
  className = '',
  minDate,
  maxDate,
  disabled = false,
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
          <CalendarIcon className="w-4 h-4 text-primary-600" />
        </div>
        <input
          type="date"
          value={value}
          min={minDate}
          max={maxDate}
          disabled={disabled}
          onChange={(e) => onChange && onChange(e.target.value)}
          className="block w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3.5 py-2 text-sm text-slate-800 transition-colors focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/20 disabled:bg-slate-50 disabled:cursor-not-allowed"
        />
      </div>
      <div className="mt-1.5 flex gap-2">
        <button
          type="button"
          onClick={() => {
            const today = new Date().toISOString().split('T')[0];
            onChange && onChange(today);
          }}
          className="text-xs text-primary-600 hover:text-primary-800 font-medium hover:underline"
        >
          Hôm nay
        </button>
        <span className="text-slate-300 text-xs">•</span>
        <button
          type="button"
          onClick={() => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            onChange && onChange(tomorrow.toISOString().split('T')[0]);
          }}
          className="text-xs text-primary-600 hover:text-primary-800 font-medium hover:underline"
        >
          Ngày mai
        </button>
      </div>
    </div>
  );
};
