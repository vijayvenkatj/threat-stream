import React from 'react';

// The one card style: title, optional subtitle/headline, body.
export function Card({ title, subtitle, children, className = '' }) {
  return (
    <section className={`bg-white border border-slate-300 rounded-xl p-5 shadow-cyber-card ${className}`}>
      {title && <h3 className="text-sm font-bold font-mono text-slate-900">{title}</h3>}
      {subtitle && <p className="text-xs text-slate-600 mt-0.5 mb-4 font-sans">{subtitle}</p>}
      {!subtitle && title && <div className="mb-4" />}
      {children}
    </section>
  );
}
