import React, { useState } from 'react';

export const Avatar = ({
  src,
  alt = '',
  name = '',
  size = 'md',
  status, // 'online' | 'busy' | 'offline'
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const getInitials = (fullName) => {
    if (!fullName) return '?';
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
    xl: 'w-14 h-14 text-lg',
  };

  const statusColors = {
    online: 'bg-emerald-500 ring-white',
    busy: 'bg-amber-500 ring-white',
    offline: 'bg-slate-400 ring-white',
  };

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      {src && !imageError ? (
        <img
          src={src}
          alt={alt || name}
          onError={() => setImageError(true)}
          className={`rounded-full object-cover ring-2 ring-white shadow-sm ${sizes[size] || sizes.md}`}
        />
      ) : (
        <div
          className={`
            rounded-full bg-primary-100 text-primary-700 font-semibold ring-2 ring-white shadow-sm
            flex items-center justify-center uppercase
            ${sizes[size] || sizes.md}
          `}
        >
          {getInitials(name || alt)}
        </div>
      )}

      {status && (
        <span
          className={`
            absolute bottom-0 right-0 block rounded-full ring-2
            ${size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5'}
            ${statusColors[status] || statusColors.online}
          `}
        />
      )}
    </div>
  );
};
