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
import { SkeletonTableRow } from '../components/common/Skeleton';

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
      {/* Featured Cyber Navy Header Banner */}
      <div className="bg-[#0B1F33] border border-slate-700/80 rounded-2xl p-6 shadow-navy-glow text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider">
              SOC Command Operations Center
            </span>
          </div>
          <h1 className="text-2xl font-bold font-mono text-white flex items-center gap-2 tracking-tight">
            Threat Intelligence Dashboard
          </h1>
          <p className="text-xs text-slate-300 font-sans mt-1 max-w-2xl leading-relaxed">
            Real-time Cyber Threat Intelligence (CTI) aggregated from AlienVault OTX raw stream pipeline.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-mono text-white font-bold border border-cyan-400/40 shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-white ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-sm font-mono flex items-center justify-between shadow-sm">
          <span>{error}</span>
          <button onClick={loadDashboardData} className="underline font-bold text-rose-950">Retry</button>
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pulses */}
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-cyber-card hover:shadow-cyber-hover transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-600 font-bold uppercase tracking-wider">Total Pulses</span>
            <div className="p-2.5 rounded-lg bg-cyan-100 border border-cyan-300 text-cyan-800">
              <Radio className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            {loading ? (
              <div className="h-8 bg-slate-200 rounded w-20 animate-pulse"></div>
            ) : (
              <div className="text-3xl font-extrabold font-mono text-slate-900">{stats?.total_pulses || 0}</div>
            )}
            <div className="text-xs text-slate-500 mt-1 font-mono font-medium">Subscribed OTX feeds</div>
          </div>
        </div>

        {/* Total Indicators */}
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-cyber-card hover:shadow-cyber-hover transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-600 font-bold uppercase tracking-wider">Total Indicators</span>
            <div className="p-2.5 rounded-lg bg-purple-100 border border-purple-300 text-purple-800">
              <Key className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            {loading ? (
              <div className="h-8 bg-slate-200 rounded w-20 animate-pulse"></div>
            ) : (
              <div className="text-3xl font-extrabold font-mono text-slate-900">{stats?.total_indicators || 0}</div>
            )}
            <div className="text-xs text-slate-500 mt-1 font-mono font-medium">
              {stats?.unique_indicator_types || 0} unique IOC types
            </div>
          </div>
        </div>

        {/* Active Indicators */}
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-cyber-card hover:shadow-cyber-hover transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-600 font-bold uppercase tracking-wider">Active IOCs</span>
            <div className="p-2.5 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            {loading ? (
              <div className="h-8 bg-slate-200 rounded w-20 animate-pulse"></div>
            ) : (
              <div className="text-3xl font-extrabold font-mono text-emerald-700">
                {stats?.active_indicators || 0}
              </div>
            )}
            <div className="text-xs text-emerald-800 mt-1 font-mono font-medium">Enforced threat signatures</div>
          </div>
        </div>

        {/* Expired / Inactive Indicators */}
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-cyber-card hover:shadow-cyber-hover transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-600 font-bold uppercase tracking-wider">Inactive IOCs</span>
            <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            {loading ? (
              <div className="h-8 bg-slate-200 rounded w-20 animate-pulse"></div>
            ) : (
              <div className="text-3xl font-extrabold font-mono text-slate-700">{stats?.inactive_indicators || 0}</div>
            )}
            <div className="text-xs text-slate-500 mt-1 font-mono font-medium">Archived or expired</div>
          </div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Indicators by Type (Donut) */}
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-cyber-card">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
            <h3 className="text-sm font-bold font-mono text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-700" />
              <span>Indicators by Type</span>
            </h3>
          </div>
          <IndicatorTypeChart data={typesData} />
        </div>

        {/* Top Malware Families */}
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-cyber-card">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
            <h3 className="text-sm font-bold font-mono text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-rose-700" />
              <span>Top Malware Families</span>
            </h3>
          </div>
          <MalwareChart data={malwareData} />
        </div>

        {/* Targeted Countries */}
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-cyber-card">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
            <h3 className="text-sm font-bold font-mono text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-700" />
              <span>Top Targeted Countries</span>
            </h3>
          </div>
          <CountryChart data={countriesData} />
        </div>
      </div>

      {/* Common Tags Cloud */}
      <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-cyber-card">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
          <h3 className="text-sm font-bold font-mono text-slate-900 flex items-center gap-2">
            <TagIcon className="w-4 h-4 text-amber-700" />
            <span>Popular Threat Classifications & Tags</span>
          </h3>
        </div>
        <TagCloud
          data={tagsData}
          onSelectTag={(tagName) => navigate(`/pulses?tag=${encodeURIComponent(tagName)}`)}
        />
      </div>

      {/* Recent Pulses Section */}
      <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-cyber-card overflow-hidden">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
          <h3 className="text-sm font-bold font-mono text-slate-900 flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-700" />
            <span>Recent Threat Pulses</span>
          </h3>
          <Link
            to="/pulses"
            className="text-xs font-mono text-cyan-800 hover:text-cyan-900 flex items-center gap-1 font-bold transition-colors"
          >
            <span>View All Pulses</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-300 text-slate-700 font-bold uppercase tracking-wider bg-slate-100">
                <th className="py-3 px-4">Pulse Name</th>
                <th className="py-3 px-4">Adversary</th>
                <th className="py-3 px-4">TLP</th>
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4">IOC Count</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
              {loading ? (
                <>
                  <SkeletonTableRow cols={7} />
                  <SkeletonTableRow cols={7} />
                  <SkeletonTableRow cols={7} />
                </>
              ) : recentPulses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500 font-medium">
                    No pulses available
                  </td>
                </tr>
              ) : (
                recentPulses.map((pulse) => (
                  <tr key={pulse.id} className="hover:bg-cyan-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-sans font-bold text-slate-900 max-w-xs truncate">
                      <Link to={`/pulses/${pulse.id}`} className="hover:text-cyan-800 transition-colors">
                        {pulse.name}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <AdversaryBadge name={pulse.adversary} />
                    </td>
                    <td className="py-3.5 px-4">
                      <TlpBadge tlp={pulse.tlp} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-semibold">{pulse.author_name}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded bg-cyan-100 text-cyan-900 border border-cyan-300 font-bold">
                        {pulse.indicators ? pulse.indicators.length : 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {new Date(pulse.created).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/pulses/${pulse.id}`}
                        className="inline-flex items-center gap-1 text-cyan-800 hover:text-cyan-950 font-bold"
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
