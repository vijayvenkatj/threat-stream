import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Radio,
  User,
  Calendar,
  Shield,
  ExternalLink,
  Tag,
  Globe,
  Cpu,
  Layers,
  ArrowLeft,
  Search,
} from 'lucide-react';
import { getPulseById } from '../api/pulses';
import { TlpBadge, AdversaryBadge, StatusBadge, TypeBadge } from '../components/common/Badge';
import { CopyButton } from '../components/common/CopyButton';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { JsonViewer } from '../components/common/JsonViewer';

export function PulseDetails() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pulse, setPulse] = useState(null);
  const [iocSearch, setIocSearch] = useState('');

  useEffect(() => {
    async function fetchPulse() {
      setLoading(true);
      setError(null);
      try {
        const data = await getPulseById(id);
        setPulse(data);
      } catch (err) {
        console.error('Failed fetching pulse details:', err);
        setError(err.message || `Pulse ${id} not found`);
      } finally {
        setLoading(false);
      }
    }
    fetchPulse();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 bg-slate-800 rounded w-1/4"></div>
        <div className="h-10 bg-slate-800 rounded w-3/4"></div>
        <div className="h-32 bg-slate-800 rounded w-full"></div>
      </div>
    );
  }

  if (error || !pulse) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Pulse Explorer', path: '/pulses' }, { label: 'Error' }]} />
        <div className="p-8 text-center bg-cyber-850 rounded-xl border border-rose-800/80 text-rose-300 font-mono">
          <p className="text-lg mb-4">{error || 'Pulse details could not be loaded'}</p>
          <Link to="/pulses" className="inline-flex items-center gap-2 px-4 py-2 rounded bg-cyber-800 border border-slate-700 text-slate-200">
            <ArrowLeft className="w-4 h-4" /> Back to Pulse Explorer
          </Link>
        </div>
      </div>
    );
  }

  const indicators = pulse.indicators || [];
  const filteredIndicators = indicators.filter(
    (i) =>
      i.indicator.toLowerCase().includes(iocSearch.toLowerCase()) ||
      i.type.toLowerCase().includes(iocSearch.toLowerCase()) ||
      (i.title && i.title.toLowerCase().includes(iocSearch.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { label: 'Pulse Explorer', path: '/pulses' },
          { label: pulse.name },
        ]}
      />

      {/* Main Header Card */}
      <div className="bg-cyber-850/80 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <TlpBadge tlp={pulse.tlp} />
              <AdversaryBadge name={pulse.adversary} />
              <span className="text-xs font-mono text-slate-400 bg-cyber-900 px-2.5 py-0.5 rounded border border-slate-800">
                REV {pulse.revision}
              </span>
            </div>
            <h1 className="text-2xl font-bold font-sans text-slate-100 leading-tight">
              {pulse.name}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <CopyButton text={pulse.id} label="Pulse ID" />
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed font-sans max-w-4xl mb-6">
          {pulse.description || 'No detailed description available for this pulse.'}
        </p>

        {/* Primary Metadata Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="block text-[10px] text-slate-500 uppercase">Author</span>
              <span className="text-slate-200">{pulse.author_name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="block text-[10px] text-slate-500 uppercase">Created</span>
              <span className="text-slate-200">{new Date(pulse.created).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="block text-[10px] text-slate-500 uppercase">Modified</span>
              <span className="text-slate-200">{new Date(pulse.modified).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="block text-[10px] text-slate-500 uppercase">IOC Count</span>
              <span className="text-cyan-400 font-bold">{indicators.length} Indicators</span>
            </div>
          </div>
        </div>
      </div>

      {/* Threat Classification & Intelligence Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Classification Breakdown */}
        <div className="bg-cyber-850/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold font-mono text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Threat Classification</span>
          </h3>

          {/* Malware Families */}
          {pulse.malware_families && pulse.malware_families.length > 0 && (
            <div>
              <span className="block text-xs font-mono text-slate-400 mb-1.5">Malware Families:</span>
              <div className="flex flex-wrap gap-1.5">
                {pulse.malware_families.map((m) => (
                  <span key={m} className="px-2.5 py-1 rounded text-xs font-mono bg-rose-950/40 text-rose-300 border border-rose-800/50">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Targeted Countries */}
          {pulse.targeted_countries && pulse.targeted_countries.length > 0 && (
            <div>
              <span className="block text-xs font-mono text-slate-400 mb-1.5 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-emerald-400" /> Targeted Countries:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {pulse.targeted_countries.map((c) => (
                  <span key={c} className="px-2.5 py-1 rounded text-xs font-mono bg-emerald-950/40 text-emerald-300 border border-emerald-800/50">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Targeted Industries */}
          {pulse.industries && pulse.industries.length > 0 && (
            <div>
              <span className="block text-xs font-mono text-slate-400 mb-1.5">Targeted Industries:</span>
              <div className="flex flex-wrap gap-1.5">
                {pulse.industries.map((ind) => (
                  <span key={ind} className="px-2.5 py-1 rounded text-xs font-mono bg-cyber-800 text-slate-300 border border-slate-700">
                    {ind}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ATT&CK IDs */}
          {pulse.attack_ids && pulse.attack_ids.length > 0 && (
            <div>
              <span className="block text-xs font-mono text-slate-400 mb-1.5">MITRE ATT&CK TTPs:</span>
              <div className="flex flex-wrap gap-1.5">
                {pulse.attack_ids.map((att) => (
                  <span key={att} className="px-2.5 py-1 rounded text-xs font-mono bg-purple-950/40 text-purple-300 border border-purple-800/50">
                    {att}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {pulse.tags && pulse.tags.length > 0 && (
            <div>
              <span className="block text-xs font-mono text-slate-400 mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-amber-400" /> Pulse Tags:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {pulse.tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyber-900 text-slate-400 border border-slate-800">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* References & Technical Sources */}
        <div className="bg-cyber-850/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold font-mono text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
            <ExternalLink className="w-4 h-4 text-cyan-400" />
            <span>References & Provenance</span>
          </h3>

          {/* External Links */}
          {pulse.references && pulse.references.length > 0 ? (
            <div>
              <span className="block text-xs font-mono text-slate-400 mb-2">Reference Citations:</span>
              <ul className="space-y-2">
                {pulse.references.map((ref, idx) => (
                  <li key={idx}>
                    <a
                      href={ref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 truncate hover:underline"
                    >
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{ref}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-xs text-slate-500 font-mono">No external reference links documented.</p>
          )}

          {/* Extract Sources */}
          {pulse.extract_source && pulse.extract_source.length > 0 && (
            <div className="pt-2">
              <span className="block text-xs font-mono text-slate-400 mb-1.5">Ingestion Source Engines:</span>
              <div className="flex flex-wrap gap-1.5">
                {pulse.extract_source.map((src, idx) => (
                  <span key={idx} className="px-2 py-1 rounded text-[11px] font-mono bg-cyber-900 text-slate-300 border border-slate-800">
                    {src}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Associated Indicators Table */}
      <div className="bg-cyber-850/60 border border-slate-800 rounded-xl p-5 overflow-hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-sm font-semibold font-mono text-slate-200 flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Associated Indicators of Compromise ({indicators.length})</span>
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search pulse indicators..."
              value={iocSearch}
              onChange={(e) => setIocSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-cyber-900 border border-slate-700/80 rounded-lg text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Indicator Value</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Role / Title</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredIndicators.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">
                    No matching indicators found in this pulse
                  </td>
                </tr>
              ) : (
                filteredIndicators.map((ind) => (
                  <tr key={ind.id} className="hover:bg-cyber-800/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-100 font-medium max-w-xs truncate">
                      <Link to={`/indicators/${ind.id}`} className="hover:text-cyan-400 transition-colors">
                        {ind.indicator}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <TypeBadge type={ind.type} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge isActive={ind.is_active} />
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                      {ind.role ? <span className="text-cyan-400 font-semibold mr-1.5">[{ind.role}]</span> : null}
                      {ind.title || ind.description || 'No details'}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(ind.created).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <CopyButton text={ind.indicator} label="" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collapsible Raw Payload Section */}
      <JsonViewer title="Raw Pulse OTX Payload" data={pulse} />
    </div>
  );
}
