import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ page, totalPages, totalItems, limit, onPageChange }) {
  if (totalPages <= 1) return null;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-t border-slate-300 text-xs text-slate-700 font-mono">
      <div>
        Showing <span className="text-cyan-800 font-bold">{startItem}</span> - <span className="text-cyan-800 font-bold">{endItem}</span> of{' '}
        <span className="text-cyan-800 font-bold">{totalItems}</span> records
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded bg-white border border-slate-300 hover:border-cyan-500 hover:bg-slate-100 disabled:opacity-40 disabled:hover:border-slate-300 text-slate-800 transition-colors shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-3.5 py-1 rounded bg-slate-100 font-mono border border-slate-300 text-slate-800 font-bold">
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded bg-white border border-slate-300 hover:border-cyan-500 hover:bg-slate-100 disabled:opacity-40 disabled:hover:border-slate-300 text-slate-800 transition-colors shadow-sm"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
