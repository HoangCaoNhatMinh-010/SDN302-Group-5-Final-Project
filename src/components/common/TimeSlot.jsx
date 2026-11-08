import React from 'react';
import { Clock, Check } from 'lucide-react';

export const TimeSlot = ({
  time,
  period = 'Sáng',
  state = 'available', // 'available' | 'selected' | 'occupied' | 'disabled'
  spotsLeft,
  onClick,
  className = '',
}) => {
  const isOccupied = state === 'occupied';
  const isSelected = state === 'selected';
  const isDisabled = state === 'disabled' || isOccupied;

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={!isDisabled ? onClick : undefined}
      className={`
        relative flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-150 select-none
        ${
          isSelected
            ? 'bg-primary-600 border-primary-600 text-white shadow-sm ring-2 ring-primary-500/30'
            : isOccupied
            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
            : 'bg-white border-slate-200 hover:border-primary-400 hover:bg-primary-50/50 text-slate-800'
        }
        ${className}
      `}
    >
      <div className="flex items-center gap-1.5 font-semibold text-sm">
        <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
        <span>{time}</span>
      </div>

      <div className="mt-1 flex items-center justify-between w-full text-[11px]">
        <span className={isSelected ? 'text-primary-100' : 'text-slate-500'}>
          {isOccupied ? 'Đã kín' : period}
        </span>
        {spotsLeft !== undefined && !isOccupied && (
          <span
            className={`font-medium ${
              isSelected ? 'text-white' : 'text-primary-600'
            }`}
          >
            {spotsLeft} chỗ
          </span>
        )}
      </div>

      {isSelected && (
        <span className="absolute -top-1.5 -right-1.5 bg-white text-primary-600 rounded-full p-0.5 shadow-sm border border-primary-200">
          <Check className="w-3 h-3 stroke-[3]" />
        </span>
      )}
    </button>
  );
};
