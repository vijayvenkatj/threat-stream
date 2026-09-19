import React from 'react';
import { ShieldAlert, Search } from 'lucide-react';

export function EmptyState({
  title = 'No Threat Intelligence Found',
  description = 'No results match your active search or filter criteria.',
  onReset,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-cyber-850/40 border border-dashed border-slate-800 rounded-xl text-center">
      <div className="w-14 h-14 rounded-full bg-cyber-800/80 border border-slate-700/60 flex items-center justify-center mb-4 text-cyan-400">
        <Search className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-slate-200 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mb-6">{description}</p>
      {onReset && (
        <button
          onClick={onReset}
          className="px-4 py-2 text-xs font-mono rounded-lg bg-cyber-800 hover:bg-cyber-750 text-cyan-400 border border-cyan-500/30 hover:border-cyan-500 transition-all"
        >
          Reset Filters
        </button>
      )}
    </div>
  );
}
