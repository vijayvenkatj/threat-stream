import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function TimelineChart({ data = [] }) {
  if (!data.length) {
    return <div className="h-40 flex items-center justify-center text-xs text-slate-500 font-mono">No timeline data</div>;
  }
  return (
    <div className="w-full h-44">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: 'monospace', fill: '#334155' }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 10, fontFamily: 'monospace', fill: '#334155' }} />
          <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: 0, borderRadius: 8, color: '#F8FAFC', fontFamily: 'monospace', fontSize: 12 }} />
          <Area type="monotone" dataKey="count" name="Pulses" stroke="#0891B2" fill="#CFFAFE" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
