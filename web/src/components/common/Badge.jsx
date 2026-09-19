import React from 'react';

/**
 * TLP (Traffic Light Protocol) Badge
 */
export function TlpBadge({ tlp }) {
  const level = (tlp || 'white').toLowerCase();
  
  const styles = {
    white: 'bg-slate-800 text-slate-200 border-slate-700',
    green: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60 glow-emerald',
    amber: 'bg-amber-950/80 text-amber-400 border-amber-800/60',
    red: 'bg-rose-950/80 text-rose-400 border-rose-800/60 font-semibold',
  };

  const styleClass = styles[level] || styles.white;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono tracking-wider uppercase border ${styleClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      TLP:{level}
    </span>
  );
}

/**
 * Indicator Active / Inactive Status Badge
 */
export function StatusBadge({ isActive }) {
  const active = isActive === 1 || isActive === true || isActive === 'active';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        active
          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40 shadow-emerald-glow'
          : 'bg-slate-900 text-slate-400 border-slate-700'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
      {active ? 'ACTIVE' : 'INACTIVE'}
    </span>
  );
}

/**
 * Indicator Type Badge with semantic colors
 */
export function TypeBadge({ type }) {
  const t = (type || 'other').toLowerCase();

  let style = 'bg-slate-800 text-slate-300 border-slate-700';

  if (t.includes('ipv4') || t.includes('ipv6') || t.includes('ip')) {
    style = 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60';
  } else if (t.includes('domain') || t.includes('hostname')) {
    style = 'bg-teal-950/80 text-teal-300 border-teal-700/60';
  } else if (t.includes('url') || t.includes('uri')) {
    style = 'bg-amber-950/80 text-amber-300 border-amber-700/60';
  } else if (t.includes('hash') || t.includes('sha') || t.includes('md5')) {
    style = 'bg-purple-950/80 text-purple-300 border-purple-700/60';
  } else if (t.includes('email')) {
    style = 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono border font-medium ${style}`}>
      {type || 'UNKNOWN'}
    </span>
  );
}

/**
 * Adversary Tag Badge
 */
export function AdversaryBadge({ name }) {
  if (!name) return null;

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-950/40 text-rose-300 border border-rose-800/50">
      <svg className="w-3.5 h-3.5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      {name}
    </span>
  );
}
