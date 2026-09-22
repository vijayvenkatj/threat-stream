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
          <XAxis dataKey="name" stroke="#94A3B8" tick={{ fontSize: 10, fontFamily: 'monospace', fill: '#0F172A', fontWeight: 700 }} interval={0} angle={-15} textAnchor="end" />
          <YAxis stroke="#94A3B8" tick={{ fontSize: 11, fontFamily: 'monospace', fill: '#334155', fontWeight: 600 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0F172A',
              borderColor: '#334155',
              borderRadius: '8px',
              color: '#F8FAFC',
              fontFamily: 'monospace',
              fontSize: '12px',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)',
            }}
          />
          <Bar dataKey="count" fill="#047857" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
