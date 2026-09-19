import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function CountryChart({ data = [] }) {
  if (!data || !data.length) {
    return <div className="h-48 flex items-center justify-center text-xs text-slate-500 font-mono">No Country Targeting Data</div>;
  }

  const topData = data.slice(0, 6);

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={topData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
          <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace', fill: '#cbd5e1' }} interval={0} angle={-15} textAnchor="end" />
          <YAxis stroke="#64748b" tick={{ fontSize: 11, fontFamily: 'monospace', fill: '#94a3b8' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111726',
              borderColor: '#1e293b',
              borderRadius: '8px',
              color: '#f8fafc',
              fontFamily: 'monospace',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
