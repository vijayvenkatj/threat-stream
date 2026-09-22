import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Code, Copy, Check } from 'lucide-react';

export function JsonViewer({ title = 'Technical / Raw Data Payload', data }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-slate-300 rounded-xl bg-white overflow-hidden shadow-sm mt-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-100 hover:bg-slate-200/80 transition-colors text-left border-b border-transparent"
      >
        <div className="flex items-center gap-2 text-sm font-bold font-mono text-slate-900">
          <Code className="w-4 h-4 text-cyan-700" />
          <span>{title}</span>
        </div>
        <div className="flex items-center gap-3">
          {isOpen && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs font-mono font-medium text-slate-800 hover:text-cyan-800 px-2.5 py-1 rounded bg-white border border-slate-300 shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-700 font-bold" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
              {copied ? 'Copied' : 'Copy JSON'}
            </button>
          )}
          {isOpen ? <ChevronDown className="w-4 h-4 text-slate-600" /> : <ChevronRight className="w-4 h-4 text-slate-600" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 bg-slate-900 border-t border-slate-300 overflow-x-auto max-h-96">
          <pre className="font-mono text-xs text-cyan-300 leading-relaxed font-medium">
            {jsonString}
          </pre>
        </div>
      )}
    </div>
  );
}
