import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Radio,
  Key,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Globe,
  Tag as TagIcon,
  ChevronRight,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import {
  getOverviewStats,
  getIndicatorTypesStats,
  getMalwareStats,
  getCountriesStats,
  getTagsStats,
} from '../api/stats';
import { getPulses } from '../api/pulses';
import { IndicatorTypeChart } from '../components/charts/IndicatorTypeChart';
import { MalwareChart } from '../components/charts/MalwareChart';
import { CountryChart } from '../components/charts/CountryChart';
import { TagCloud } from '../components/charts/TagCloud';
import { TlpBadge, AdversaryBadge } from '../components/common/Badge';
import { SkeletonCard, SkeletonTableRow } from '../components/common/Skeleton';

export function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [typesData, setTypesData] = useState({});
  const [malwareData, setMalwareData] = useState([]);
  const [countriesData, setCountriesData] = useState([]);
  const [tagsData, setTagsData] = useState([]);
  const [recentPulses, setRecentPulses] = useState([]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ovStats, typesRes, malwareRes, countriesRes, tagsRes, pulsesRes] =
        await Promise.all([
          getOverviewStats(),
          getIndicatorTypesStats(),
          getMalwareStats(),
          getCountriesStats(),
          getTagsStats(),
          getPulses({ limit: 5, sortBy: 'created', order: 'desc' }),
        ]);

      setStats(ovStats);
      setTypesData(typesRes);
      setMalwareData(malwareRes);
      setCountriesData(countriesRes);
      setTagsData(tagsRes);
      setRecentPulses(pulsesRes.data || []);
    } catch (err) {
      console.error('Failed loading dashboard data:', err);
      setError(err.message || 'Failed to connect to threat intelligence service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 font-mono flex items-center gap-2">
            Threat Intelligence Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time Cyber Threat Intelligence (CTI) aggregated from AlienVault OTX raw pipeline.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-cyber-800 text-xs font-mono text-slate-200 border border-slate-700 hover:border-cyan-500/50 hover:text-cyan-400 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-sm font-mono flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadDashboardData} className="underline font-semibold">Retry</button>
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pulses */}
        <div className="bg-cyber-850/80 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Total Pulses</span>
            <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/50 text-cyan-400">
              <Radio className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            {loading ? (
              <div className="h-8 bg-slate-800 rounded w-20 animate-pulse"></div>
            ) : (
              <div className="text-3xl font-bold font-mono text-slate-100">{stats?.total_pulses || 0}</div>
            )}
            <div className="text-xs text-slate-400 mt-1 font-mono">Subscribed OTX feeds</div>
          </div>
        </div>

        {/* Total Indicators */}
        <div className="bg-cyber-850/80 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Total Indicators</span>
            <div className="p-2 rounded-lg bg-purple-950/60 border border-purple-800/50 text-purple-400">
              <Key className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            {loading ? (
              <div className="h-8 bg-slate-800 rounded w-20 animate-pulse"></div>
            ) : (
              <div className="text-3xl font-bold font-mono text-slate-100">{stats?.total_indicators || 0}</div>
            )}
            <div className="text-xs text-slate-400 mt-1 font-mono">
              {stats?.unique_indicator_types || 0} unique IOC types
            </div>
          </div>
        </div>

        {/* Active Indicators */}
        <div className="bg-cyber-850/80 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Active IOCs</span>
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            {loading ? (
              <div className="h-8 bg-slate-800 rounded w-20 animate-pulse"></div>
            ) : (
              <div className="text-3xl font-bold font-mono text-emerald-400 glow-emerald">
                {stats?.active_indicators || 0}
              </div>
            )}
            <div className="text-xs text-emerald-500/80 mt-1 font-mono">Enforced threat signatures</div>
          </div>
        </div>

        {/* Expired / Inactive Indicators */}
        <div className="bg-cyber-850/80 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Inactive IOCs</span>
            <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            {loading ? (
              <div className="h-8 bg-slate-800 rounded w-20 animate-pulse"></div>
            ) : (
              <div className="text-3xl font-bold font-mono text-slate-400">{stats?.inactive_indicators || 0}</div>
            )}
            <div className="text-xs text-slate-400 mt-1 font-mono">Archived or expired</div>
          </div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Indicators by Type (Donut) */}
        <div className="bg-cyber-850/60 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold font-mono text-slate-200 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Indicators by Type</span>
            </h3>
          </div>
          <IndicatorTypeChart data={typesData} />
        </div>

        {/* Top Malware Families */}
        <div className="bg-cyber-850/60 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold font-mono text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-rose-400" />
              <span>Top Malware Families</span>
            </h3>
          </div>
          <MalwareChart data={malwareData} />
        </div>

        {/* Targeted Countries */}
        <div className="bg-cyber-850/60 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold font-mono text-slate-200 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Top Targeted Countries</span>
            </h3>
          </div>
          <CountryChart data={countriesData} />
        </div>
      </div>

      {/* Common Tags Cloud */}
      <div className="bg-cyber-850/60 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold font-mono text-slate-200 flex items-center gap-2">
            <TagIcon className="w-4 h-4 text-amber-400" />
            <span>Popular Threat Classifications & Tags</span>
          </h3>
        </div>
        <TagCloud
          data={tagsData}
          onSelectTag={(tagName) => navigate(`/pulses?tag=${encodeURIComponent(tagName)}`)}
        />
      </div>

      {/* Recent Pulses Section */}
      <div className="bg-cyber-850/60 border border-slate-800 rounded-xl p-5 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold font-mono text-slate-200 flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span>Recent Threat Pulses</span>
          </h3>
          <Link
            to="/pulses"
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <span>View All Pulses</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Pulse Name</th>
                <th className="py-3 px-4">Adversary</th>
                <th className="py-3 px-4">TLP</th>
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4">IOC Count</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <>
                  <SkeletonTableRow cols={7} />
                  <SkeletonTableRow cols={7} />
                  <SkeletonTableRow cols={7} />
                </>
              ) : recentPulses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    No pulses available
                  </td>
                </tr>
              ) : (
                recentPulses.map((pulse) => (
                  <tr key={pulse.id} className="hover:bg-cyber-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-sans font-medium text-slate-200 max-w-xs truncate">
                      <Link to={`/pulses/${pulse.id}`} className="hover:text-cyan-400 transition-colors">
                        {pulse.name}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <AdversaryBadge name={pulse.adversary} />
                    </td>
                    <td className="py-3.5 px-4">
                      <TlpBadge tlp={pulse.tlp} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{pulse.author_name}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-cyber-800 text-cyan-400 border border-slate-700">
                        {pulse.indicators ? pulse.indicators.length : 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(pulse.created).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/pulses/${pulse.id}`}
                        className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
