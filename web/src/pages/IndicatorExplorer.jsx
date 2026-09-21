import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Key, Search, Filter, ArrowUpDown, Shield } from 'lucide-react';
import { getIndicators } from '../api/indicators';
import { getIndicatorTypesStats } from '../api/stats';
import { StatusBadge, TypeBadge } from '../components/common/Badge';
import { CopyButton } from '../components/common/CopyButton';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';
import { SkeletonTableRow } from '../components/common/Skeleton';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

export function IndicatorExplorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [indicators, setIndicators] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [availableTypes, setAvailableTypes] = useState([]);

  // Filter states
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [pulseIdFilter, setPulseIdFilter] = useState(searchParams.get('pulseId') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'created');
  const [order, setOrder] = useState(searchParams.get('order') || 'desc');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const limit = 10;

  // Load available IOC types dynamically from data
  useEffect(() => {
    async function loadTypes() {
      try {
        const typesMap = await getIndicatorTypesStats();
        setAvailableTypes(Object.keys(typesMap));
      } catch (err) {
        console.error('Failed loading IOC types:', err);
      }
    }
    loadTypes();
  }, []);

  const fetchIndicatorsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getIndicators({
        search,
        type: typeFilter,
        status: statusFilter,
        pulseId: pulseIdFilter,
        sortBy,
        order,
        page,
        limit,
      });

      setIndicators(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.total_pages || 1);
    } catch (err) {
      console.error('Failed fetching indicators:', err);
      setError(err.message || 'Failed to fetch threat indicators');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndicatorsData();
  }, [search, typeFilter, statusFilter, pulseIdFilter, sortBy, order, page]);

  const handleResetFilters = () => {
    setSearch('');
    setTypeFilter('');
    setStatusFilter('');
    setPulseIdFilter('');
    setSortBy('created');
    setOrder('desc');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Indicator Explorer' }]} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-300">
        <div>
          <h1 className="text-2xl font-bold font-mono text-slate-900 flex items-center gap-2">
            <Key className="w-6 h-6 text-cyan-700" />
            <span>Indicator Explorer (IOCs)</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            Explore IPv4, IPv6, Domains, URLs, File Hashes, and Emails harvested from OTX.
          </p>
        </div>
        <div className="font-mono text-xs text-slate-800 bg-white px-3.5 py-1.5 rounded-lg border border-slate-300 shadow-sm font-bold">
          Total Indicators: <span className="text-cyan-800 font-extrabold">{total}</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-cyber-card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search indicator value, title, content..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-400 rounded-lg text-xs font-mono text-slate-900 font-semibold placeholder-slate-500 focus:outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100 shadow-sm"
            />
          </div>

          {/* Indicator Type Filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-white border border-slate-400 rounded-lg text-xs font-mono text-slate-900 font-bold focus:outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100 appearance-none shadow-sm"
            >
              <option value="">All IOC Types</option>
              {availableTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3 pointer-events-none" />
          </div>

          {/* Active / Inactive Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-white border border-slate-400 rounded-lg text-xs font-mono text-slate-900 font-bold focus:outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100 appearance-none shadow-sm"
            >
              <option value="">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive / Expired</option>
            </select>
            <Shield className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3 pointer-events-none" />
          </div>

          {/* Sort Order */}
          <div className="relative">
            <select
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-400 rounded-lg text-xs font-mono text-slate-900 font-bold focus:outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100 appearance-none shadow-sm"
            >
              <option value="desc">Sort: Newest First</option>
              <option value="asc">Sort: Oldest First</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-sm font-mono shadow-sm">
          {error}
        </div>
      )}

      {/* Main IOC Table */}
      <div className="bg-white border border-slate-300 rounded-xl shadow-cyber-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-300 text-slate-700 font-bold uppercase tracking-wider bg-slate-100">
                <th className="py-3.5 px-4">Indicator Value</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Title / Summary</th>
                <th className="py-3.5 px-4">Pulse Name</th>
                <th className="py-3.5 px-4">Created</th>
                <th className="py-3.5 px-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
              {loading ? (
                <>
                  <SkeletonTableRow cols={7} />
                  <SkeletonTableRow cols={7} />
                  <SkeletonTableRow cols={7} />
                  <SkeletonTableRow cols={7} />
                </>
              ) : indicators.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <EmptyState
                      title="No Indicators Match Search Criteria"
                      description="Try clearing filters or searching for different IP, hash, or domain values."
                      onReset={handleResetFilters}
                    />
                  </td>
                </tr>
              ) : (
                indicators.map((ind) => (
                  <tr key={ind.id} className="hover:bg-cyan-50/50 transition-colors">
                    {/* Indicator Monospace Prominent Value */}
                    <td className="py-3.5 px-4 font-mono font-extrabold text-slate-900 max-w-xs truncate text-sm">
                      <Link
                        to={`/indicators/${ind.id}`}
                        className="hover:text-cyan-800 transition-colors tracking-tight"
                        title={ind.indicator}
                      >
                        {ind.indicator}
                      </Link>
                    </td>

                    {/* Type Badge */}
                    <td className="py-3.5 px-4">
                      <TypeBadge type={ind.type} />
                    </td>

                    {/* Active Status Badge */}
                    <td className="py-3.5 px-4">
                      <StatusBadge isActive={ind.is_active} />
                    </td>

                    {/* Title / Description */}
                    <td className="py-3.5 px-4 text-slate-700 font-medium max-w-xs truncate">
                      {ind.title || ind.description || 'No summary'}
                    </td>

                    {/* Pulse Name Link */}
                    <td className="py-3.5 px-4 text-slate-700 font-semibold max-w-xs truncate">
                      <Link to={`/pulses/${ind.PulseID}`} className="hover:text-cyan-800 underline">
                        {ind.PulseName || ind.PulseID}
                      </Link>
                    </td>

                    {/* Created Date */}
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {new Date(ind.created).toLocaleDateString()}
                    </td>

                    {/* Copy Button Action */}
                    <td className="py-3.5 px-4 text-right">
                      <CopyButton text={ind.indicator} label="" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-2 border-t border-slate-200">
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={total}
            limit={limit}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      </div>
    </div>
  );
}
