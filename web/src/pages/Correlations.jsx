import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, X, ChevronDown, ChevronUp, Network } from 'lucide-react';
import { getCorrelations, getCorrelationStats } from '../api/correlations';
import { keyFindings } from '../lib/insights';
import { Card } from '../components/common/Card';
import { RankList } from '../components/common/RankList';
import { TimelineChart } from '../components/charts/TimelineChart';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { SkeletonTableRow } from '../components/common/Skeleton';

const LIMIT = 10;
const FILTERS = ['category', 'country', 'adversary'];

function Chips({ items = [], tone = 'bg-cyan-50 text-cyan-900 border-cyan-300' }) {
  if (!items.length) return <span className="text-slate-400">—</span>;
  return items.map((c) => (
    <span key={c} className={`inline-block mr-1 mb-1 px-2 py-0.5 rounded text-[11px] font-mono border ${tone}`}>{c}</span>
  ));
}

function ErrorCard({ message, onRetry }) {
  return (
    <div className="p-6 bg-rose-50 border border-rose-300 rounded-xl text-center font-mono text-sm text-rose-900">
      <p className="mb-3">Could not load correlations: {message}</p>
      <button onClick={onRetry} className="px-4 py-2 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold">Retry</button>
    </div>
  );
}

export function Correlations() {
  const [params, setParams] = useSearchParams();
  const [stats, setStats] = useState(null);
  const [list, setList] = useState(null);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(null);
  const [text, setText] = useState(params.get('q') || '');
  const [attempt, setAttempt] = useState(0);

  const q = params.get('q') || '';
  const sort = params.get('sort') || 'indicator_count';
  const page = Number(params.get('page')) || 1;
  const active = Object.fromEntries(FILTERS.map((f) => [f, params.get(f) || '']));

  // The URL holds every filter, so views are shareable and back-button safe.
  const set = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries({ page: '', ...changes }).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next);
  };

  useEffect(() => {
    const t = setTimeout(() => text !== q && set({ q: text }), 300);
    return () => clearTimeout(t);
  }, [text]);

  useEffect(() => {
    setError(null);
    getCorrelationStats().then(setStats).catch((e) => setError(e.message));
  }, [attempt]);

  useEffect(() => {
    if (stats && !stats.available) return;
    getCorrelations({ search: q, sortBy: sort, page, limit: LIMIT, ...active })
      .then(setList)
      .catch((e) => setError(e.message));
  }, [q, sort, page, active.category, active.country, active.adversary, stats?.available, attempt]);

  const header = (
    <>
      <Breadcrumbs items={[{ label: 'Correlations' }]} />
      <div className="pb-4 border-b border-slate-300">
        <h1 className="text-2xl font-bold font-mono text-slate-900 flex items-center gap-2">
          <Network className="w-6 h-6 text-cyan-700" />
          <span>Correlated Threats</span>
        </h1>
        <p className="text-sm text-slate-600 mt-1">What Spark found when it grouped raw pulses by behavior: ransomware, phishing, espionage and more.</p>
      </div>
    </>
  );

  if (error) return <div className="space-y-6">{header}<ErrorCard message={error} onRetry={() => setAttempt((n) => n + 1)} /></div>;
  if (!stats) return <div className="space-y-6">{header}<p className="p-12 text-center font-mono text-sm text-slate-500">Loading correlations…</p></div>;

  if (!stats.available) {
    return (
      <div className="space-y-6">
        {header}
        <EmptyState
          title="Spark hasn't correlated anything yet"
          description="Run correlate_threats.py in the spark container, then reload. Raw pulses stay browsable meanwhile."
        />
      </div>
    );
  }

  const findings = keyFindings(stats);
  const hasFilters = q || FILTERS.some((f) => active[f]);
  const rows = list?.data ?? [];

  return (
    <div className="space-y-6">
      {header}

      {findings.length > 0 && (
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {findings.slice(0, 3).map((f) => (
            <li key={f.text}>
              <Link to={f.to} className="block h-full bg-[#0B1F33] hover:bg-[#071524] text-white text-sm font-sans rounded-xl p-4 shadow-navy-glow transition-colors">{f.text}</Link>
            </li>
          ))}
        </ul>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Threat categories" subtitle={`${stats.pulses} pulses, ${stats.indicators} indicators. Click a bar to filter.`}>
          <RankList items={stats.categories} active={active.category} onSelect={(v) => set({ category: v })} />
        </Card>
        <Card title="Pulses over time" subtitle="Correlated pulses by month created">
          <TimelineChart data={stats.timeline} />
        </Card>
        <Card title="Top adversaries">
          <RankList items={stats.adversaries} active={active.adversary} onSelect={(v) => set({ adversary: v })} color="bg-rose-600" />
        </Card>
        <Card title="Most targeted countries">
          <RankList items={stats.countries} active={active.country} onSelect={(v) => set({ country: v })} color="bg-emerald-600" />
        </Card>
      </div>

      {stats.pairs?.length > 0 && (
        <Card title="Threat nexus" subtitle="Categories that show up together in the same pulse">
          <Chips items={stats.pairs.map((p) => `${p.name} · ${p.count}`)} tone="bg-purple-50 text-purple-900 border-purple-300" />
        </Card>
      )}

      <Card>
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Search pulse or adversary…"
              aria-label="Search correlated pulses"
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-400 rounded-lg text-xs font-mono focus:outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            />
          </div>
          <select value={sort} onChange={(e) => set({ sort: e.target.value })} aria-label="Sort" className="px-3 py-2 bg-white border border-slate-400 rounded-lg text-xs font-mono font-bold">
            <option value="indicator_count">Sort: Most indicators</option>
            <option value="created">Sort: Newest</option>
            <option value="name">Sort: Name</option>
          </select>
        </div>

        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-mono">
            {FILTERS.filter((f) => active[f]).map((f) => (
              <button key={f} onClick={() => set({ [f]: '' })} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-100 border border-cyan-300 text-cyan-900 font-bold">
                {f}: {active[f]} <X className="w-3 h-3" />
              </button>
            ))}
            <button onClick={() => { setText(''); setParams({}); }} className="underline text-slate-600 font-bold">Clear all</button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider">
              <tr>
                {['Pulse', 'Adversary', 'Categories', 'IOCs', 'Countries', ''].map((h) => <th key={h} className="px-4 py-3 font-bold">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {!list && <><SkeletonTableRow cols={6} /><SkeletonTableRow cols={6} /><SkeletonTableRow cols={6} /></>}
              {list && rows.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-slate-500">Nothing matches these filters.</td></tr>
              )}
              {rows.map((r) => (
                <React.Fragment key={r.pulse_id}>
                  <tr onClick={() => setOpen(open === r.pulse_id ? null : r.pulse_id)} className="hover:bg-cyan-50/50 cursor-pointer align-top">
                    <td className="px-4 py-3 font-sans font-bold text-slate-900 max-w-xs">{r.pulse_name || r.pulse_id}</td>
                    <td className="px-4 py-3 text-slate-700">{r.adversary || '—'}</td>
                    <td className="px-4 py-3"><Chips items={r.categories} /></td>
                    <td className="px-4 py-3 font-bold text-slate-800">{r.indicator_count ?? 0}</td>
                    <td className="px-4 py-3 text-slate-600">{(r.countries || []).join(', ') || '—'}</td>
                    <td className="px-4 py-3 text-slate-500">{open === r.pulse_id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</td>
                  </tr>
                  {open === r.pulse_id && (
                    <tr className="bg-slate-50">
                      <td colSpan={6} className="px-4 py-3 space-y-1">
                        <div><b>Indicator types:</b> <Chips items={r.indicator_types} tone="bg-white text-slate-700 border-slate-300" /></div>
                        <div><b>Malware:</b> <Chips items={r.malware_families} tone="bg-rose-50 text-rose-900 border-rose-300" /></div>
                        <div><b>Tags:</b> <Chips items={r.tags} tone="bg-white text-slate-700 border-slate-300" /></div>
                        <div><b>Industries:</b> <Chips items={r.industries} tone="bg-white text-slate-700 border-slate-300" /></div>
                        <Link to={`/pulses/${r.pulse_id}`} className="inline-block pt-1 text-cyan-800 font-bold underline">Open the raw pulse</Link>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination page={page} totalPages={list?.total_pages ?? 1} totalItems={list?.total ?? 0} limit={LIMIT} onPageChange={(p) => set({ page: String(p) })} />
      </Card>
    </div>
  );
}
