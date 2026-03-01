const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sesomnod-api-production.up.railway.app';

export interface Pick {
  id?: number;
  date?: string;
  league?: string;
  home_team?: string;
  away_team?: string;
  match?: string;
  pick?: string;
  odds?: number;
  stake?: number;
  ev_percent?: number;
  tier?: string;
  comment?: string;
  result?: 'W' | 'L' | 'P' | null;
  profit?: number;
  clv?: number;
  created_at?: string;
}

export interface BankrollEntry {
  id?: number;
  date?: string;
  balance?: number;
  deposit?: number;
  withdrawal?: number;
  note?: string;
}

export interface DagensKamp {
  status?: string;
  data?: DagensKampItem[];
  count?: number;
}

export interface DagensKampItem {
  id?: number;
  match?: string;
  league?: string;
  market?: string;
  odds?: number;
  ev_percent?: number;
  kelly_stake?: number;
  confidence?: number;
  home_xg?: number;
  away_xg?: number;
  monte_carlo?: number[];
  reasoning?: string;
  created_at?: string;
}

export interface StatsData {
  total_picks?: number;
  wins?: number;
  losses?: number;
  pushes?: number;
  win_rate?: number;
  total_profit?: number;
  total_roi?: number;
  avg_odds?: number;
  avg_ev?: number;
  avg_clv?: number;
  profit_30d?: number;
  by_league?: { league: string; roi: number; picks: number }[];
  clv_history?: { date: string; clv: number }[];
}

export interface PicksResponse {
  status: string;
  data: Pick[];
  count: number;
}

export interface BankrollResponse {
  status: string;
  data: BankrollEntry[];
  count: number;
}

async function fetchWithTimeout(url: string, options?: RequestInit, timeout = 10000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function getHealth() {
  const res = await fetchWithTimeout(`${API_URL}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function getBankroll(): Promise<BankrollResponse> {
  const res = await fetchWithTimeout(`${API_URL}/bankroll`);
  if (!res.ok) throw new Error('Failed to fetch bankroll');
  return res.json();
}

export async function getPicks(): Promise<PicksResponse> {
  const res = await fetchWithTimeout(`${API_URL}/picks`);
  if (!res.ok) throw new Error('Failed to fetch picks');
  return res.json();
}

export async function getDagensKamp(): Promise<DagensKamp> {
  const res = await fetchWithTimeout(`${API_URL}/dagens-kamp`);
  if (!res.ok) throw new Error('Failed to fetch dagens kamp');
  return res.json();
}

export async function addPick(data: Omit<Pick, 'id' | 'created_at'>): Promise<Pick> {
  const res = await fetchWithTimeout(`${API_URL}/picks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to add pick');
  return res.json();
}

export async function getStats(): Promise<StatsData> {
  // Try /stats endpoint, fall back to computing from picks
  try {
    const res = await fetchWithTimeout(`${API_URL}/stats`);
    if (res.ok) return res.json();
  } catch {}
  // Compute stats from picks
  const picksRes = await getPicks();
  const picks = picksRes.data || [];
  const wins = picks.filter(p => p.result === 'W').length;
  const losses = picks.filter(p => p.result === 'L').length;
  const pushes = picks.filter(p => p.result === 'P').length;
  const settled = picks.filter(p => p.result && p.result !== 'P');
  const totalProfit = picks.reduce((sum, p) => sum + (p.profit || 0), 0);
  const totalStake = picks.reduce((sum, p) => sum + (p.stake || 0), 0);
  const roi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0;
  const winRate = settled.length > 0 ? (wins / settled.length) * 100 : 0;
  const avgOdds = picks.length > 0 ? picks.reduce((s, p) => s + (p.odds || 0), 0) / picks.length : 0;
  const avgEv = picks.length > 0 ? picks.reduce((s, p) => s + (p.ev_percent || 0), 0) / picks.length : 0;
  const avgClv = picks.filter(p => p.clv).length > 0
    ? picks.filter(p => p.clv).reduce((s, p) => s + (p.clv || 0), 0) / picks.filter(p => p.clv).length
    : 0;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const profit30d = picks
    .filter(p => p.created_at && p.created_at > thirtyDaysAgo)
    .reduce((sum, p) => sum + (p.profit || 0), 0);
  // By league
  const leagueMap: Record<string, { roi: number; picks: number; profit: number; stake: number }> = {};
  picks.forEach(p => {
    const l = p.league || 'Unknown';
    if (!leagueMap[l]) leagueMap[l] = { roi: 0, picks: 0, profit: 0, stake: 0 };
    leagueMap[l].picks++;
    leagueMap[l].profit += p.profit || 0;
    leagueMap[l].stake += p.stake || 0;
  });
  const byLeague = Object.entries(leagueMap).map(([league, v]) => ({
    league,
    roi: v.stake > 0 ? (v.profit / v.stake) * 100 : 0,
    picks: v.picks,
  })).sort((a, b) => b.roi - a.roi);
  return {
    total_picks: picks.length,
    wins,
    losses,
    pushes,
    win_rate: winRate,
    total_profit: totalProfit,
    total_roi: roi,
    avg_odds: avgOdds,
    avg_ev: avgEv,
    avg_clv: avgClv,
    profit_30d: profit30d,
    by_league: byLeague,
  };
}
