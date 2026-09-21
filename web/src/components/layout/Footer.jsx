import React from 'react';
import { Shield, ArrowRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-6 mt-16 text-slate-300 text-xs font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span className="text-white font-bold tracking-wider">Threat Stream CTI Platform</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">AlienVault OTX Raw Ingestion Pipeline</span>
        </div>

        {/* Pipeline Architecture Indicator */}
        <div className="flex items-center gap-2 text-[11px] text-slate-300 bg-slate-800/90 px-3.5 py-1.5 rounded-lg border border-slate-700 shadow-sm">
          <span>Collect</span>
          <ArrowRight className="w-3 h-3 text-cyan-400" />
          <span>Stream</span>
          <ArrowRight className="w-3 h-3 text-cyan-400" />
          <span>Store</span>
          <ArrowRight className="w-3 h-3 text-cyan-400" />
          <span className="text-slate-400">Analyze</span>
          <ArrowRight className="w-3 h-3 text-cyan-400" />
          <span className="text-cyan-400 font-bold">Visualize</span>
        </div>
      </div>
    </footer>
  );
}
