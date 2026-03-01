export function formatCurrency(value: number | undefined | null, decimals = 2): string {
  if (value === undefined || value === null) return '—';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}u`;
}

export function formatPercent(value: number | undefined | null, decimals = 1): string {
  if (value === undefined || value === null) return '—';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatOdds(value: number | undefined | null): string {
  if (value === undefined || value === null) return '—';
  return value.toFixed(2);
}

export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('nb-NO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function resultColor(result: string | null | undefined): string {
  if (result === 'W') return 'text-green-400';
  if (result === 'L') return 'text-red-400';
  if (result === 'P') return 'text-amber-400';
  return 'text-slate-400';
}

export function resultBadge(result: string | null | undefined): string {
  if (result === 'W') return 'bg-green-500/20 text-green-400 border border-green-500/30';
  if (result === 'L') return 'bg-red-500/20 text-red-400 border border-red-500/30';
  if (result === 'P') return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
  return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
}

export function profitColor(value: number | undefined | null): string {
  if (value === undefined || value === null) return 'text-slate-400';
  return value >= 0 ? 'text-green-400' : 'text-red-400';
}

export function tierColor(tier: string | undefined | null): string {
  if (tier === 'A') return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
  if (tier === 'B') return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
  if (tier === 'C') return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
  return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
}

export function confidenceColor(value: number | undefined | null): string {
  if (value === undefined || value === null) return 'text-slate-400';
  if (value >= 80) return 'text-green-400';
  if (value >= 60) return 'text-amber-400';
  return 'text-red-400';
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
