import React from 'react';
import { STATUS_CONFIG, APPOINTMENT_STATUS } from '../../utils/constants';

export const StatusBadge = ({ status, size = 'md', className = '' }) => {
  const config = STATUS_CONFIG[status] || {
    label: status || 'Không xác định',
    variant: 'neutral',
    color: 'text-slate-700 bg-slate-100 border-slate-200',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full border
        ${config.color}
        ${sizes[size] || sizes.md}
        ${className}
      `}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {config.label}
    </span>
  );
};
