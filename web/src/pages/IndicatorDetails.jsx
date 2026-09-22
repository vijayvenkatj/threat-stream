import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Key, Calendar, Radio, ArrowLeft, Info, FileText } from 'lucide-react';
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
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
        <div className="h-16 bg-slate-200 rounded w-3/4"></div>
        <div className="h-32 bg-slate-200 rounded w-full"></div>
      </div>
    );
  }

  if (error || !indicator) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Indicator Explorer', path: '/indicators' }, { label: 'Error' }]} />
        <div className="p-8 text-center bg-white rounded-xl border border-rose-300 text-rose-900 font-mono shadow-sm">
          <p className="text-lg mb-4">{error || 'Indicator details could not be loaded'}</p>
          <Link to="/indicators" className="inline-flex items-center gap-2 px-4 py-2 rounded bg-slate-100 border border-slate-300 text-slate-900 font-sans font-bold hover:bg-slate-200 transition-colors">
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

      {/* Prominent Focal Indicator Header Card */}
      <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-cyber-card relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <TypeBadge type={indicator.type} />
              <StatusBadge isActive={indicator.is_active} />
              {indicator.role && (
                <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-cyan-100 text-cyan-900 border border-cyan-300 font-bold">
                  Role: {indicator.role}
                </span>
              )}
            </div>

            {/* Prominent Monospace Focal IOC Value */}
            <h1 className="text-2xl sm:text-3xl font-extrabold font-mono text-cyan-800 break-all pt-2 tracking-tight">
              {indicator.indicator}
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <CopyButton text={indicator.indicator} label="Copy Indicator" />
          </div>
        </div>

        {/* Title / Summary */}
        <p className="text-sm text-slate-700 leading-relaxed font-sans max-w-4xl mb-6 font-medium">
          {indicator.title || indicator.description || 'No detailed title provided for this indicator.'}
        </p>

        {/* Primary Metadata Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-200 text-xs font-mono text-slate-700">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-700" />
            <div>
              <span className="block text-[10px] text-slate-500 uppercase font-bold">Parent Pulse</span>
              <Link to={`/pulses/${indicator.PulseID}`} className="text-cyan-800 font-bold hover:underline truncate block max-w-xs">
                {indicator.PulseName || indicator.PulseID}
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-700" />
            <div>
              <span className="block text-[10px] text-slate-500 uppercase font-bold">Created Date</span>
              <span className="text-slate-900 font-bold">{new Date(indicator.created).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-700" />
            <div>
              <span className="block text-[10px] text-slate-500 uppercase font-bold">Expiration</span>
              <span className="text-slate-900 font-bold">
                {indicator.expiration ? new Date(indicator.expiration).toLocaleDateString() : 'None (Active)'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-cyan-700" />
            <div>
              <span className="block text-[10px] text-slate-500 uppercase font-bold">Indicator ID</span>
              <span className="text-slate-900 font-bold">{indicator.id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Information & Context */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-cyber-card space-y-3">
          <h3 className="text-sm font-bold font-mono text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
            <Info className="w-4 h-4 text-cyan-700" />
            <span>Description & Context</span>
          </h3>
          <p className="text-xs text-slate-700 font-sans leading-relaxed font-medium">
            {indicator.description || 'No additional contextual description provided.'}
          </p>
        </div>

        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-cyber-card space-y-3">
          <h3 className="text-sm font-bold font-mono text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
            <FileText className="w-4 h-4 text-cyan-700" />
            <span>Operational Role & Content</span>
          </h3>
          <div className="text-xs font-mono space-y-2">
            <div>
              <span className="text-slate-500 uppercase block text-[10px] font-bold">Role:</span>
              <span className="text-slate-900 font-bold">{indicator.role || 'Unspecified'}</span>
            </div>
            <div>
              <span className="text-slate-500 uppercase block text-[10px] font-bold">Content Summary:</span>
              <span className="text-slate-900 block bg-slate-100 p-2.5 rounded-lg border border-slate-300 truncate font-semibold">
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
