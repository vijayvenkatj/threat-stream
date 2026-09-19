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
    <div className="border border-slate-800 rounded-xl bg-cyber-850/60 overflow-hidden mt-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-cyber-800/80 hover:bg-cyber-800 transition-colors text-left"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
          <Code className="w-4 h-4 text-cyan-400" />
          <span>{title}</span>
        </div>
        <div className="flex items-center gap-3">
          {isOpen && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-cyan-400 px-2 py-1 rounded bg-cyber-900 border border-slate-700"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy JSON'}
            </button>
          )}
          {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 bg-cyber-950 border-t border-slate-800 overflow-x-auto max-h-96">
          <pre className="font-mono text-xs text-cyan-300 leading-relaxed">
            {jsonString}
          </pre>
        </div>
      )}
    </div>
  );
}
