import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Premium Generic Table Component with built-in Pagination UI
 *
 * @param {Array} columns - [{ label: 'ID', accessor: 'id', render: (val, row) => <jsx> }]
 * @param {Array} data - Array of row objects
 * @param {Object} pagination - { current, total, onPageChange }
 */
export const GenericTable = ({ 
  columns, 
  data, 
  loading, 
  pagination,
  emptyStateMessage = "No records found",
  onRowClick
}) => {
  return (
    <div className="w-full flex flex-col">
      <div className="overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-800/20 backdrop-blur-sm">
        <table className="w-full text-left text-sm text-textLight">
          <thead className="bg-slate-800/80 text-xs uppercase text-textMuted border-b border-slate-700/50">
            <tr>
              {columns.map((col, i) => (
                <th key={i} scope="col" className="px-6 py-4 font-medium tracking-wider">
                  {col.label}
                  {col.filter && <div className="mt-2 text-primary">{col.filter}</div>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-textMuted animate-pulse">
                  Loading data...
                </td>
              </tr>
            ) : data && data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr 
                  key={row.id || rowIndex} 
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`hover:bg-slate-700/20 transition-colors duration-200 ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                      {col.render ? col.render(row[col.accessor], row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-textMuted">
                  {emptyStateMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.total > 1 && (
        <div className="flex items-center justify-between mt-6 px-2">
          <span className="text-sm text-textMuted">
            Page <span className="font-semibold text-slate-200">{pagination.current}</span> of <span className="font-semibold text-slate-200">{pagination.total}</span>
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.current - 1)}
              disabled={pagination.current === 1}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-textLight disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-slate-700"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.current + 1)}
              disabled={pagination.current === pagination.total}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-textLight disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-slate-700"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
