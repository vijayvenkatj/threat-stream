import React from 'react';

// Ranked bars; each row is a button so charts double as filters.
export function RankList({ items = [], active, onSelect, color = 'bg-cyan-600' }) {
  if (!items.length) return <p className="text-xs text-slate-500 font-mono py-4">No data yet</p>;
  const max = items[0].count || 1;

  return (
    <div className="space-y-1">
      {items.map(({ name, count }) => (
        <button
          key={name}
          onClick={() => onSelect?.(active === name ? '' : name)}
          title={`Filter by ${name}`}
          className={`w-full flex items-center gap-3 px-2 py-1 rounded-md text-xs font-mono text-left transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-300 ${active === name ? 'bg-cyan-50 ring-1 ring-cyan-400' : ''}`}
        >
          <span className="w-36 truncate font-semibold text-slate-800">{name}</span>
          <span className="flex-1 bg-slate-100 rounded h-2">
            <span className={`block h-2 rounded ${color}`} style={{ width: `${(count / max) * 100}%` }} />
          </span>
          <span className="w-8 text-right font-bold text-slate-700">{count}</span>
        </button>
      ))}
    </div>
  );
}
