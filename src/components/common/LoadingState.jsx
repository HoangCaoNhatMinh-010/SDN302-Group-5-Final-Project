import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState = ({
  message = 'Đang tải dữ liệu...',
  fullPage = false,
  className = '',
}) => {
  const content = (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="relative">
        <div className="w-10 h-10 rounded-full border-2 border-primary-200 animate-pulse" />
        <Loader2 className="w-6 h-6 text-primary-600 animate-spin absolute inset-0 m-auto" />
      </div>
      <p className="mt-3 text-xs font-medium text-slate-500">{message}</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[400px] flex items-center justify-center w-full">
        {content}
      </div>
    );
  }

  return content;
};
