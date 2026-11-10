import React, { forwardRef } from 'react';

export const Textarea = forwardRef(
  (
    {
      label,
      error,
      helperText,
      rows = 3,
      className = '',
      id,
      disabled = false,
      required = false,
      ...props
    },
    ref
  ) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            {label}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative rounded-lg shadow-sm">
          <textarea
            ref={ref}
            id={textareaId}
            rows={rows}
            disabled={disabled}
            className={`
              block w-full rounded-lg border text-sm transition-colors duration-150
              px-3.5 py-2 text-slate-800 placeholder-slate-400 bg-white
              ${
                error
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-300 focus:border-primary-500 focus:ring-primary-500/20'
              }
              focus:outline-none focus:ring-4
              disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          />
        </div>
        {error ? (
          <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
