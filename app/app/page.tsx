'use client';

import { useState, useEffect, useCallback } from 'react';
import { getDagensKamp, DagensKampItem } from '@/lib/api';
import { formatOdds, formatPercent } from '@/lib/utils';
import { Card, Badge, Button, Spinner, ErrorState, EmptyState, PageHeader } from '@/components/ui';
import MonteCarloChart from '@/components/charts/MonteCarloChart';

export default function DagensPage() {
  const [data, setData] = useState<DagensKampItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [selected, setSelected] = useState<number>(0);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sesomnod-api-production.up.railway.app';

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await getDagensKamp();
      setData(res.data || []);
    } catch {
      setError('Kunne ikke hente dagens kamp. Sjekk tilkobling.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      await fetch(`${API_URL}/dagens-kamp/analyze`, { method: 'POST' });
      await fetchData();
    } catch {
      await fetchData();
    } finally {
      setAnalyzing(false);
    }
  };

  const pick = data[selected];

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title="Dagens Kamp"
        subtitle="Analysert av SesomNod Engine"
      />

      <div className="px-4 pb-6 flex flex-col gap-4">
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          loading={analyzing}
          onClick={handleAnalyze}
        >
          {analyzing ? 'Analyserer...' : '⚡ Analyser nå'}
        </Button>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" className="text-amber-400" />
          </div>
        )}

        {!loading && error && (
          <ErrorState message={error} onRetry={fetchData} />
        )}

        {!loading && !error && data.length === 0 && (
          <EmptyState
            message="Ingen analyserte kamper ennå. Trykk 'Analyser nå' for å starte."
            icon={
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8l4 4-4 4M8 12h8" />
              </svg>
            }
          />
        )}

        {!loading && !error && data.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {data.map((item, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selected === i
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {item.match || `Kamp ${i + 1}`}
              </button>
            ))}
          </div>
        )}

        {!loading && !error && pick && (
          <>
            <Card className="card-hover">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px]">
                      {pick.league || 'Ukjent liga'}
                    </Badge>
                  </div>
                  <h2 className="text-lg font-bold text-slate-100 leading-tight">
                    {pick.match || 'Kamp ikke spesifisert'}
                  </h2>
                  <p className="text-sm text-slate-400 mt-0.5">{pick.market || 'Marked ikke spesifisert'}</p>
                </div>
                {pick.confidence !== undefined && (
                  <div className="flex flex-col items-center ml-3">
                    <ConfidenceRing value={pick.confidence} />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4">
                <MetricBox label="Odds" value={formatOdds(pick.odds)} />
                <MetricBox
                  label="EV%"
                  value={formatPercent(pick.ev_percent)}
                  valueClass={pick.ev_percent && pick.ev_percent > 0 ? 'text-green-400 glow-green' : 'text-red-400'}
                />
                <MetricBox
                  label="Kelly"
                  value={pick.kelly_stake !== undefined ? `${(pick.kelly_stake * 100).toFixed(1)}%` : '—'}
                  valueClass="text-amber-400 glow-amber"
                />
              </div>

              {(pick.home_xg !== undefined || pick.away_xg !== undefined) && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Expected Goals (xG)</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300 font-medium">Hjemme</span>
                        <span className="text-amber-400 font-bold">{pick.home_xg?.toFixed(2) || '—'}</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${Math.min(((pick.home_xg || 0) / 4) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300 font-medium">Borte</span>
                        <span className="text-blue-400 font-bold">{pick.away_xg?.toFixed(2) || '—'}</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${Math.min(((pick.away_xg || 0) / 4) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {pick.reasoning && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Analyse</p>
                  <p className="text-sm text-slate-300 leading-relaxed">{pick.reasoning}</p>
                </div>
              )}
            </Card>

            {pick.monte_carlo && pick.monte_carlo.length > 0 && (
              <Card>
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Monte Carlo Simulering</p>
                <MonteCarloChart data={pick.monte_carlo} />
              </Card>
            )}

            {data.length > 1 && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-3 px-1">Alternativkamper</p>
                <div className="flex flex-col gap-2">
                  {data.filter((_, i) => i !== selected).map((alt, i) => (
                    <button
                      key={i}
                      onClick={() => setSelected(data.indexOf(alt))}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-left active:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-200">{alt.match || 'Kamp'}</p>
                          <p className="text-xs text-slate-500">{alt.market || '—'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-300">{formatOdds(alt.odds)}</span>
                          <span className={`text-xs font-semibold ${alt.ev_percent && alt.ev_percent > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatPercent(alt.ev_percent)}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function MetricBox({ label, value, valueClass = 'text-slate-100' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="bg-slate-800/50 rounded-xl p-3 flex flex-col gap-1">
      <span className="text-[10px] text-slate-500 uppercase tracking-widest">{label}</span>
      <span className={`text-xl font-bold tabular-nums ${valueClass}`}>{value}</span>
    </div>
  );
}

function ConfidenceRing({ value }: { value: number }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / 100) * circumference;
  const color = value >= 80 ? '#22c55e' : value >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="52" height="52" viewBox="0 0 52 52">
        <circle cx="26" cy="26" r={radius} fill="none" stroke="#1e293b" strokeWidth="4" />
        <circle
          cx="26" cy="26" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(-90 26 26)"
        />
        <text x="26" y="30" textAnchor="middle" fontSize="11" fontWeight="700" fill={color}>
          {value}%
        </text>
      </svg>
      <span className="text-[9px] text-slate-500 uppercase tracking-widest">Conf.</span>
    </div>
  );
}
