import React from 'react';

export function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-300 rounded-xl p-5 animate-pulse shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="h-6 bg-slate-200 rounded w-2/3"></div>
        <div className="h-5 bg-slate-200 rounded w-16"></div>
      </div>
      <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-slate-200 rounded w-4/5 mb-4"></div>
      <div className="flex gap-2 pt-2 border-t border-slate-200">
        <div className="h-6 bg-slate-200 rounded w-20"></div>
        <div className="h-6 bg-slate-200 rounded w-24"></div>
      </div>
    </div>
  );
}

export function SkeletonTableRow({ cols = 5 }) {
  return (
    <tr className="border-b border-slate-200 animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        </td>
      ))}
    </tr>
  );
}
