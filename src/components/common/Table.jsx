import React from 'react';

export const Table = ({ children, className = '', ...props }) => {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className={`w-full text-left text-sm text-slate-700 ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader = ({ children, className = '', ...props }) => {
  return (
    <thead
      className={`bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200 tracking-wider ${className}`}
      {...props}
    >
      {children}
    </thead>
  );
};

export const TableBody = ({ children, className = '', ...props }) => {
  return (
    <tbody className={`divide-y divide-slate-100 ${className}`} {...props}>
      {children}
    </tbody>
  );
};

export const TableRow = ({ children, className = '', hover = true, ...props }) => {
  return (
    <tr
      className={`transition-colors ${
        hover ? 'hover:bg-slate-50/80' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
};

export const TableHead = ({ children, className = '', ...props }) => {
  return (
    <th className={`px-4 py-3.5 ${className}`} {...props}>
      {children}
    </th>
  );
};

export const TableCell = ({ children, className = '', ...props }) => {
  return (
    <td className={`px-4 py-3.5 whitespace-nowrap text-slate-700 ${className}`} {...props}>
      {children}
    </td>
  );
};
