'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { BankrollEntry, Pick } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface Props {
  bankroll: BankrollEntry[];
  picks: Pick[];
  startingBalance?: number;
}

export default function EquityCurve({ bankroll, picks, startingBalance = 1000 }: Props) {
  // Build equity curve from bankroll history or picks
  let chartData: { date: string; balance: number; label: string }[] = [];

  if (bankroll.length > 0) {
    chartData = bankroll.map((b) => ({
      date: b.date || b.id?.toString() || '',
      balance: b.balance || 0,
      label: formatDate(b.date),
    }));
  } else if (picks.length > 0) {
    // Reconstruct from picks
    let running = startingBalance;
    const sorted = [...picks]
      .filter((p) => p.result && p.profit !== undefined)
      .sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));

    chartData = [{ date: 'Start', balance: running, label: 'Start' }];
    sorted.forEach((p) => {
      running += p.profit || 0;
      chartData.push({
        date: p.created_at || '',
        balance: +running.toFixed(2),
        label: formatDate(p.created_at),
      });
    });
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
        Ingen bankroll-data ennå
      </div>
    );
  }

  const firstBalance = chartData[0]?.balance || startingBalance;
  const lastBalance = chartData[chartData.length - 1]?.balance || startingBalance;
  const isPositive = lastBalance >= firstBalance;
  const strokeColor = isPositive ? '#22c55e' : '#ef4444';
  const fillColor = isPositive ? '#22c55e' : '#ef4444';

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-500">Bankroll over tid</span>
        <span className={`text-sm font-bold tabular-nums ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {lastBalance.toFixed(2)}u
        </span>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={fillColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={fillColor} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tick={{ fill: '#64748b', fontSize: 9 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 9 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
            labelStyle={{ color: '#94a3b8' }}
            itemStyle={{ color: strokeColor }}
            formatter={(value) => [typeof value === 'number' ? `${value.toFixed(2)}u` : value, 'Bankroll']}
          />
          <ReferenceLine y={firstBalance} stroke="#334155" strokeDasharray="3 3" />
          <Area
            type="monotone"
            dataKey="balance"
            stroke={strokeColor}
            strokeWidth={2}
            fill="url(#equityGradient)"
            dot={false}
            activeDot={{ r: 4, fill: strokeColor }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
