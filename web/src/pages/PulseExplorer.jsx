import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Radio, Search, Filter, ArrowUpDown, ChevronRight, Globe, Shield, Tag } from 'lucide-react';
import { getPulses } from '../api/pulses';
import { TlpBadge, AdversaryBadge } from '../components/common/Badge';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';
import { SkeletonCard } from '../components/common/Skeleton';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

export function PulseExplorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pulses, setPulses] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filter states initialized from URL params
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [tlpFilter, setTlpFilter] = useState(searchParams.get('tlp') || '');
  const [adversaryFilter, setAdversaryFilter] = useState(searchParams.get('adversary') || '');
  const [countryFilter, setCountryFilter] = useState(searchParams.get('country') || '');
  const [tagFilter, setTagFilter] = useState(searchParams.get('tag') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'created');
  const [order, setOrder] = useState(searchParams.get('order') || 'desc');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const limit = 8;

  const fetchPulsesData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPulses({
        search,
        tlp: tlpFilter,
        adversary: adversaryFilter,
        country: countryFilter,
        tag: tagFilter,
        sortBy,
        order,
        page,
        limit,
      });

      setPulses(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.total_pages || 1);
    } catch (err) {
      console.error('Failed fetching pulses:', err);
      setError(err.message || 'Failed to fetch threat pulses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPulsesData();
  }, [search, tlpFilter, adversaryFilter, countryFilter, tagFilter, sortBy, order, page]);

  const handleResetFilters = () => {
    setSearch('');
    setTlpFilter('');
    setAdversaryFilter('');
    setCountryFilter('');
    setTagFilter('');
    setSortBy('created');
    setOrder('desc');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Pulse Explorer' }]} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold font-mono text-slate-100 flex items-center gap-2">
            <Radio className="w-6 h-6 text-cyan-400" />
            <span>Threat Pulse Explorer</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse, search, and analyze raw CTI threat pulses subscribed from AlienVault OTX.
          </p>
        </div>
        <div className="font-mono text-xs text-slate-400 bg-cyber-850 px-3 py-1.5 rounded-lg border border-slate-800">
          Total Pulses: <span className="text-cyan-400 font-bold">{total}</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-cyber-850/80 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search pulse name, description, adversary..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-cyber-900 border border-slate-700/80 rounded-lg text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* TLP Filter */}
          <div className="relative">
            <select
              value={tlpFilter}
              onChange={(e) => {
                setTlpFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-cyber-900 border border-slate-700/80 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 appearance-none"
            >
              <option value="">All TLP Levels</option>
              <option value="white">TLP:WHITE</option>
              <option value="green">TLP:GREEN</option>
              <option value="amber">TLP:AMBER</option>
              <option value="red">TLP:RED</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>

          {/* Sort Field */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-cyber-900 border border-slate-700/80 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 appearance-none"
            >
              <option value="created">Sort: Created Date</option>
              <option value="modified">Sort: Modified Date</option>
              <option value="indicators">Sort: IOC Count</option>
              <option value="name">Sort: Pulse Name</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>

          {/* Sort Order */}
          <div className="relative">
            <select
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="w-full px-3 py-2 bg-cyber-900 border border-slate-700/80 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 appearance-none"
            >
              <option value="desc">Order: Descending</option>
              <option value="asc">Order: Ascending</option>
            </select>
          </div>
        </div>

        {/* Active Tag Filter Warning */}
        {tagFilter && (
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/40 px-3 py-1.5 rounded border border-cyan-800/50">
            <Tag className="w-3.5 h-3.5" />
            <span>Filtering by Tag: #{tagFilter}</span>
            <button onClick={() => setTagFilter('')} className="ml-auto underline text-slate-400 hover:text-slate-200">
              Clear Tag
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-sm font-mono">
          {error}
        </div>
      )}

      {/* Pulse Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : pulses.length === 0 ? (
        <EmptyState
          title="No Threat Pulses Match Criteria"
          description="Try clearing search queries or adjusting TLP and sorting filters."
          onReset={handleResetFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pulses.map((pulse) => (
            <Link
              key={pulse.id}
              to={`/pulses/${pulse.id}`}
              className="bg-cyber-850/80 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-5 transition-all duration-200 group flex flex-col justify-between hover:shadow-cyber-glow"
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-sans font-bold text-slate-100 group-hover:text-cyan-400 transition-colors line-clamp-1">
                    {pulse.name}
                  </h3>
                  <TlpBadge tlp={pulse.tlp} />
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed font-sans">
                  {pulse.description || 'No description provided.'}
                </p>

                {/* Adversary & Metadata */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <AdversaryBadge name={pulse.adversary} />
                  <span className="text-[11px] font-mono text-slate-400 bg-cyber-900 px-2 py-0.5 rounded border border-slate-800">
                    Author: {pulse.author_name}
                  </span>
                </div>

                {/* Tags & Classifications */}
                {pulse.tags && pulse.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {pulse.tags.slice(0, 4).map((t) => (
                      <span key={t} className="text-[10px] font-mono text-slate-400 bg-cyber-900/80 px-2 py-0.5 rounded border border-slate-800/80">
                        #{t}
                      </span>
                    ))}
                    {pulse.tags.length > 4 && (
                      <span className="text-[10px] font-mono text-slate-500">
                        +{pulse.tags.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Info Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                    <Shield className="w-3.5 h-3.5" />
                    {pulse.indicators ? pulse.indicators.length : 0} IOCs
                  </span>
                  <span>{new Date(pulse.created).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1 text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                  <span>View Details</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={total}
        limit={limit}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
}
