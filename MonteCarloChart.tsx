'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  data: number[];
}

export default function MonteCarloChart({ data }: Props) {
  // Build histogram bins
  const bins = 20;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const binSize = range / bins;

  const histogram = Array.from({ length: bins }, (_, i) => ({
    x: +(min + i * binSize).toFixed(2),
    count: 0,
  }));

  data.forEach((val) => {
    const idx = Math.min(Math.floor((val - min) / binSize), bins - 1);
    histogram[idx].count++;
  });

  const median = [...data].sort((a, b) => a - b)[Math.floor(data.length / 2)];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500">n = {data.length.toLocaleString()} simuleringer</span>
        <span className="text-xs text-amber-400 font-semibold">Median: {median?.toFixed(2)}</span>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={histogram} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
          <XAxis
            dataKey="x"
            tick={{ fill: '#64748b', fontSize: 9 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => v.toFixed(1)}
          />
          <YAxis tick={{ fill: '#64748b', fontSize: 9 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
            labelStyle={{ color: '#94a3b8' }}
            itemStyle={{ color: '#f59e0b' }}
            formatter={(value) => [value, 'Frekvens']}
            labelFormatter={(label) => `Verdi: ${Number(label).toFixed(2)}`}
          />
          <Bar dataKey="count" radius={[2, 2, 0, 0]}>
            {histogram.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.x >= median ? '#f59e0b' : '#334155'}
                opacity={entry.x >= median ? 0.9 : 0.5}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
