import React, { useState, useRef, useEffect } from 'react';

export const Dropdown = ({
  trigger,
  children,
  align = 'right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const alignments = {
    right: 'right-0',
    left: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`
            absolute z-50 mt-2 min-w-[12rem] rounded-xl bg-white p-1.5 shadow-modal border border-slate-200/80
            animate-in fade-in zoom-in-95 duration-100
            ${alignments[align] || alignments.right}
          `}
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export const DropdownItem = ({
  children,
  icon,
  onClick,
  variant = 'default',
  disabled = false,
  className = '',
}) => {
  const variants = {
    default: 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
    danger: 'text-rose-600 hover:bg-rose-50 hover:text-rose-700',
    primary: 'text-primary-700 hover:bg-primary-50 hover:text-primary-900',
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`
        w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-left transition-colors
        ${variants[variant] || variants.default}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0 text-current">{icon}</span>}
      <span className="flex-1">{children}</span>
    </button>
  );
};

export const DropdownDivider = () => (
  <div className="my-1 border-t border-slate-100" />
);
