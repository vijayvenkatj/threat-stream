import React from 'react';
import { Search } from 'lucide-react';

export function EmptyState({
  title = 'No Threat Intelligence Found',
  description = 'No results match your active search or filter criteria.',
  onReset,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white border-2 border-dashed border-slate-300 rounded-xl text-center shadow-sm">
      <div className="w-14 h-14 rounded-full bg-cyan-100 border border-cyan-300 flex items-center justify-center mb-4 text-cyan-800">
        <Search className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1 font-mono">{title}</h3>
      <p className="text-sm text-slate-600 max-w-md mb-6">{description}</p>
      {onReset && (
        <button
          onClick={onReset}
          className="px-4 py-2 text-xs font-mono rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white shadow-sm transition-all font-bold"
        >
          Reset Filters
        </button>
      )}
    </div>
  );
}
