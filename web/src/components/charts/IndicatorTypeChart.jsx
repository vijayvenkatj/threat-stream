import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#0891B2', '#0F766E', '#047857', '#1D4ED8', '#6D28D9', '#B45309', '#B91C1C'];

export function IndicatorTypeChart({ data = {} }) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
  }));

  if (!chartData.length) {
    return <div className="h-48 flex items-center justify-center text-xs text-slate-500 font-mono">No Indicator Type Data</div>;
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#ffffff" strokeWidth={2} />
            ))}
          </Pie>
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
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => <span className="text-xs text-slate-800 font-mono font-bold">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
