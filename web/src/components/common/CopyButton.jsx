import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function CopyButton({ text, label = 'Copy', className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium transition-all duration-200 border shadow-sm ${
        copied
          ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
          : 'bg-white text-slate-700 border-slate-300 hover:text-cyan-800 hover:border-cyan-400 hover:bg-cyan-50'
      } ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5 text-slate-500" />
          {label && <span>{label}</span>}
        </>
      )}
    </button>
  );
}
