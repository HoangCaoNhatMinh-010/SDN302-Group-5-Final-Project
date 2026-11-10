import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems,
  pageSize = 10,
  onPageChange,
  className = '',
}) => {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems || currentPage * pageSize);

  return (
    <div
      className={`flex items-center justify-between border-t border-slate-200 px-4 py-3 sm:px-6 ${className}`}
    >
      <div className="text-xs text-slate-500">
        {totalItems ? (
          <>
            Hiển thị <span className="font-medium text-slate-800">{startItem}</span> -{' '}
            <span className="font-medium text-slate-800">{endItem}</span> trong tổng số{' '}
            <span className="font-medium text-slate-800">{totalItems}</span> mục
          </>
        ) : (
          <>
            Trang <span className="font-medium text-slate-800">{currentPage}</span> /{' '}
            <span className="font-medium text-slate-800">{totalPages}</span>
          </>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => onPageChange && onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="relative inline-flex items-center rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5 mr-1" />
          Trước
        </button>

        <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-md border border-primary-100">
          {currentPage}
        </span>

        <button
          type="button"
          onClick={() => onPageChange && onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="relative inline-flex items-center rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Sau
          <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </button>
      </div>
    </div>
  );
};
