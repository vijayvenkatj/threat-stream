import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Key, Calendar, Shield, Radio, ArrowLeft, Info, FileText } from 'lucide-react';
import { getIndicatorById } from '../api/indicators';
import { StatusBadge, TypeBadge } from '../components/common/Badge';
import { CopyButton } from '../components/common/CopyButton';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { JsonViewer } from '../components/common/JsonViewer';

export function IndicatorDetails() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [indicator, setIndicator] = useState(null);

  useEffect(() => {
    async function fetchIndicator() {
      setLoading(true);
      setError(null);
      try {
        const data = await getIndicatorById(id);
        setIndicator(data);
      } catch (err) {
        console.error('Failed fetching indicator details:', err);
        setError(err.message || `Indicator ${id} not found`);
      } finally {
        setLoading(false);
      }
    }
    fetchIndicator();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 bg-slate-800 rounded w-1/4"></div>
        <div className="h-16 bg-slate-800 rounded w-3/4"></div>
        <div className="h-32 bg-slate-800 rounded w-full"></div>
      </div>
    );
  }

  if (error || !indicator) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Indicator Explorer', path: '/indicators' }, { label: 'Error' }]} />
        <div className="p-8 text-center bg-cyber-850 rounded-xl border border-rose-800/80 text-rose-300 font-mono">
          <p className="text-lg mb-4">{error || 'Indicator details could not be loaded'}</p>
          <Link to="/indicators" className="inline-flex items-center gap-2 px-4 py-2 rounded bg-cyber-800 border border-slate-700 text-slate-200">
            <ArrowLeft className="w-4 h-4" /> Back to Indicator Explorer
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { label: 'Indicator Explorer', path: '/indicators' },
          { label: indicator.indicator },
        ]}
      />

      {/* Prominent Header Card */}
      <div className="bg-cyber-850/80 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <TypeBadge type={indicator.type} />
              <StatusBadge isActive={indicator.is_active} />
              {indicator.role && (
                <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
                  Role: {indicator.role}
                </span>
              )}
            </div>

            {/* Prominent Monospace Indicator Value */}
            <h1 className="text-2xl sm:text-3xl font-bold font-mono text-cyan-400 break-all glow-cyan pt-2">
              {indicator.indicator}
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <CopyButton text={indicator.indicator} label="Copy Indicator" />
          </div>
        </div>

        {/* Title / Summary */}
        <p className="text-sm text-slate-300 leading-relaxed font-sans max-w-4xl mb-6">
          {indicator.title || indicator.description || 'No detailed title provided for this indicator.'}
        </p>

        {/* Primary Metadata Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="block text-[10px] text-slate-500 uppercase">Parent Pulse</span>
              <Link to={`/pulses/${indicator.PulseID}`} className="text-cyan-400 hover:underline truncate block max-w-xs">
                {indicator.PulseName || indicator.PulseID}
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="block text-[10px] text-slate-500 uppercase">Created Date</span>
              <span className="text-slate-200">{new Date(indicator.created).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="block text-[10px] text-slate-500 uppercase">Expiration</span>
              <span className="text-slate-200">
                {indicator.expiration ? new Date(indicator.expiration).toLocaleDateString() : 'None (Active)'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="block text-[10px] text-slate-500 uppercase">Indicator ID</span>
              <span className="text-slate-200">{indicator.id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Information & Context */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-cyber-850/60 border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold font-mono text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Info className="w-4 h-4 text-cyan-400" />
            <span>Description & Context</span>
          </h3>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            {indicator.description || 'No additional contextual description provided.'}
          </p>
        </div>

        <div className="bg-cyber-850/60 border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold font-mono text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Operational Role & Content</span>
          </h3>
          <div className="text-xs font-mono space-y-2">
            <div>
              <span className="text-slate-500 uppercase block text-[10px]">Role:</span>
              <span className="text-slate-200 font-semibold">{indicator.role || 'Unspecified'}</span>
            </div>
            <div>
              <span className="text-slate-500 uppercase block text-[10px]">Content Summary:</span>
              <span className="text-slate-300 block bg-cyber-950 p-2 rounded border border-slate-800 truncate">
                {indicator.content || 'No specific content payload.'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Technical JSON Payload Section */}
      <JsonViewer title="Raw Technical Indicator Payload (Content & Metadata)" data={indicator} />
    </div>
  );
}
