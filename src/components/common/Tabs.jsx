import React from 'react';

export const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div className={`border-b border-slate-200 ${className}`}>
      <nav className="-mb-px flex space-x-6 overflow-x-auto no-scrollbar" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`
                whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-all duration-150 flex items-center gap-2
                ${
                  isActive
                    ? 'border-primary-600 text-primary-700 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }
              `}
            >
              {tab.icon && <span className="flex-shrink-0 text-current">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`
                    ml-1.5 py-0.5 px-2 rounded-full text-xs font-medium
                    ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-slate-100 text-slate-600'
                    }
                  `}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
