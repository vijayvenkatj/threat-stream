import React from 'react';
import { Tag } from 'lucide-react';

const TAG_STYLES = [
  'bg-cyan-50 text-cyan-900 border-cyan-300 hover:bg-cyan-100',
  'bg-teal-50 text-teal-900 border-teal-300 hover:bg-teal-100',
  'bg-sky-50 text-sky-900 border-sky-300 hover:bg-sky-100',
  'bg-purple-50 text-purple-900 border-purple-300 hover:bg-purple-100',
  'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100',
  'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100',
];

export function TagCloud({ data = [], onSelectTag }) {
  if (!data || !data.length) {
    return <div className="text-xs text-slate-500 font-mono py-4">No Tags Available</div>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {data.map(({ name, count }, index) => {
        const styleClass = TAG_STYLES[index % TAG_STYLES.length];
        return (
          <button
            key={name}
            onClick={() => onSelectTag && onSelectTag(name)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border font-bold shadow-sm transition-all group ${styleClass}`}
          >
            <Tag className="w-3.5 h-3.5 text-current opacity-80" />
            <span>#{name}</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white text-slate-900 border border-slate-300 font-bold">
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
