import React from 'react';

/**
 * TLP (Traffic Light Protocol) Badge - High Contrast Light Theme
 */
export function TlpBadge({ tlp }) {
  const level = (tlp || 'white').toLowerCase();
  
  const styles = {
    white: 'bg-slate-100 text-slate-700 border-slate-300 font-semibold',
    green: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold',
    amber: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
    red: 'bg-rose-100 text-rose-900 border-rose-300 font-extrabold',
  };

  const styleClass = styles[level] || styles.white;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono tracking-wider uppercase border shadow-sm ${styleClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      TLP:{level}
    </span>
  );
}

/**
 * Indicator Active / Inactive Status Badge - High Contrast Light Theme
 */
export function StatusBadge({ isActive }) {
  const active = isActive === 1 || isActive === true || isActive === 'active';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
        active
          ? 'bg-emerald-100 text-emerald-900 border-emerald-300 shadow-sm'
          : 'bg-slate-100 text-slate-700 border-slate-300'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'}`}></span>
      {active ? 'ACTIVE' : 'INACTIVE'}
    </span>
  );
}

/**
 * Indicator Type Badge with vibrant semantic light colors
 */
export function TypeBadge({ type }) {
  const t = (type || 'other').toLowerCase();

  let style = 'bg-slate-100 text-slate-800 border-slate-300';

  if (t.includes('ipv4') || t.includes('ipv6') || t.includes('ip')) {
    style = 'bg-sky-100 text-sky-900 border-sky-300';
  } else if (t.includes('domain') || t.includes('hostname')) {
    style = 'bg-teal-100 text-teal-900 border-teal-300';
  } else if (t.includes('url') || t.includes('uri')) {
    style = 'bg-purple-100 text-purple-900 border-purple-300';
  } else if (t.includes('hash') || t.includes('sha') || t.includes('md5')) {
    style = 'bg-amber-100 text-amber-900 border-amber-300';
  } else if (t.includes('email')) {
    style = 'bg-emerald-100 text-emerald-900 border-emerald-300';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono border font-bold ${style}`}>
      {type || 'UNKNOWN'}
    </span>
  );
}

/**
 * Adversary Tag Badge - High Contrast Light Theme
 */
export function AdversaryBadge({ name }) {
  if (!name) return null;

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
      <svg className="w-3.5 h-3.5 text-rose-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      {name}
    </span>
  );
}
