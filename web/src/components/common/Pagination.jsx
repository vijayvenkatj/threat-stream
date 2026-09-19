import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ page, totalPages, totalItems, limit, onPageChange }) {
  if (totalPages <= 1) return null;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-t border-slate-800/80 text-xs text-slate-400">
      <div className="font-mono">
        Showing <span className="text-cyan-400">{startItem}</span> - <span className="text-cyan-400">{endItem}</span> of{' '}
        <span className="text-cyan-400">{totalItems}</span> records
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded bg-cyber-800 border border-slate-700 hover:border-cyan-500 disabled:opacity-40 disabled:hover:border-slate-700 text-slate-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-3 py-1 rounded bg-cyber-850 font-mono border border-slate-800 text-slate-300">
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded bg-cyber-800 border border-slate-700 hover:border-cyan-500 disabled:opacity-40 disabled:hover:border-slate-700 text-slate-200 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
