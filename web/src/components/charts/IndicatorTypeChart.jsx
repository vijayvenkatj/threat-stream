import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#06b6d4', '#10b981', '#a855f7', '#f59e0b', '#f43f5e', '#6366f1'];

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
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#0b0f19" strokeWidth={2} />
            ))}
          </Pie>
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
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => <span className="text-xs text-slate-300 font-mono">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
