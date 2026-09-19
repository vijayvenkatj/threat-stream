import React from 'react';
import { Tag } from 'lucide-react';

export function TagCloud({ data = [], onSelectTag }) {
  if (!data || !data.length) {
    return <div className="text-xs text-slate-500 font-mono py-4">No Tags Available</div>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {data.map(({ name, count }) => (
        <button
          key={name}
          onClick={() => onSelectTag && onSelectTag(name)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-cyber-800/90 text-slate-300 border border-slate-700/70 hover:border-cyan-500/60 hover:text-cyan-400 hover:bg-cyber-750 transition-all group"
        >
          <Tag className="w-3 h-3 text-cyan-500 group-hover:text-cyan-400" />
          <span>#{name}</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-cyber-900 text-slate-400 border border-slate-700">
            {count}
          </span>
        </button>
      ))}
    </div>
  );
}
