import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  trend,
  trendType = 'up', // 'up' | 'down' | 'neutral'
  trendLabel,
  icon,
  iconColor = 'text-primary-600 bg-primary-50',
  description,
  className = '',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl border border-slate-200/80 p-5 shadow-subtle transition-all duration-200
        ${onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-card' : ''}
        ${className}
      `}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </p>
        {icon && (
          <div className={`p-2.5 rounded-xl ${iconColor} flex items-center justify-center`}>
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <h4 className="text-2xl font-bold tracking-tight text-slate-900">{value}</h4>
      </div>

      {(trend || description || trendLabel) && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs">
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 font-semibold ${
                trendType === 'up'
                  ? 'text-emerald-600'
                  : trendType === 'down'
                  ? 'text-rose-600'
                  : 'text-slate-500'
              }`}
            >
              {trendType === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
              {trendType === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
              {trend}
            </span>
          )}
          {trendLabel && <span className="text-slate-500">{trendLabel}</span>}
          {description && !trendLabel && <span className="text-slate-500">{description}</span>}
        </div>
      )}
    </div>
  );
};
