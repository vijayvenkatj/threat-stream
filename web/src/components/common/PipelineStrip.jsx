import React from 'react';
import { Rss, Waypoints, HardDrive, Sparkles, Server, LayoutDashboard, ChevronRight } from 'lucide-react';

// The project's story in one row: where data comes from and how far it got.
// `correlated === null` means Spark hasn't produced output (or the API is down).
export function PipelineStrip({ raw, correlated }) {
  const sparkReady = correlated != null;
  const stages = [
    { icon: Rss, name: 'Collect', detail: 'AlienVault OTX poller' },
    { icon: Waypoints, name: 'Stream', detail: 'Kafka topics' },
    { icon: HardDrive, name: 'Store', detail: raw != null ? `${raw} raw pulses in HDFS` : 'HDFS raw zone' },
    { icon: Sparkles, name: 'Correlate', detail: sparkReady ? `${correlated} pulses categorized by Spark` : 'Spark has not run yet', warn: !sparkReady },
    { icon: Server, name: 'Serve', detail: 'Go REST API, paged + cached' },
    { icon: LayoutDashboard, name: 'Explore', detail: 'You are here' },
  ];

  return (
    <ol className="grid grid-cols-2 md:grid-cols-6 gap-2">
      {stages.map(({ icon: Icon, name, detail, warn }, i) => (
        <li key={name} className={`relative rounded-xl border p-3 ${warn ? 'bg-amber-50 border-amber-300' : 'bg-white border-slate-300'} shadow-cyber-card`}>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-900">
            <Icon className={`w-4 h-4 ${warn ? 'text-amber-700' : 'text-cyan-700'}`} />
            <span>{i + 1}. {name}</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-600 font-sans leading-snug">{detail}</p>
          {i < stages.length - 1 && <ChevronRight className="hidden md:block absolute -right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />}
        </li>
      ))}
    </ol>
  );
}
