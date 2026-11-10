import React from 'react';
import { Search, X } from 'lucide-react';

export const SearchInput = ({
  value = '',
  onChange,
  onClear,
  placeholder = 'Tìm kiếm khách hàng, thú cưng, chuyên viên, mã lịch hẹn...',
  className = '',
  size = 'md',
  ...props
}) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          w-full rounded-lg border border-slate-300 bg-white pl-9 pr-9 text-slate-800 placeholder-slate-400
          text-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/20
          ${size === 'sm' ? 'py-1.5' : 'py-2'}
        `}
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            if (onClear) onClear();
            else if (onChange) onChange('');
          }}
          className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
