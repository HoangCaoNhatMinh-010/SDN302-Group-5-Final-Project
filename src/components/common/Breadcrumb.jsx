import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumb = ({ items = [], className = '' }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav className={`flex items-center text-xs text-slate-500 mb-4 ${className}`} aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 sm:space-x-2">
        <li className="inline-flex items-center">
          <Link
            to="/"
            className="inline-flex items-center text-slate-500 hover:text-primary-600 transition-colors"
          >
            <Home className="w-3.5 h-3.5 mr-1" />
            <span>Trang chủ</span>
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label || index} className="inline-flex items-center">
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 mx-1 flex-shrink-0" />
              {isLast || !item.path ? (
                <span className="font-semibold text-slate-800">{item.label}</span>
              ) : (
                <Link
                  to={item.path}
                  className="text-slate-500 hover:text-primary-600 transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
