import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, Activity, Radio, Key, Layers } from 'lucide-react';
import { isUsingMockData, getApiBaseUrl } from '../../api/client';

export function Navbar() {
  const usingMock = isUsingMockData();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Pipeline Status */}
          <div className="flex items-center gap-4">
            <NavLink to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-cyan-600 border border-cyan-700 flex items-center justify-center text-white shadow-sm group-hover:bg-cyan-700 transition-all">
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-wider text-slate-900 font-mono flex items-center gap-1">
                  THREAT<span className="text-cyan-700 font-extrabold">STREAM</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500 font-medium tracking-tight">
                  CYBER THREAT INTELLIGENCE
                </span>
              </div>
            </NavLink>

            {/* Pipeline Stage Badge */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-xs font-mono text-slate-800 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span className="text-slate-500 font-medium">STAGE:</span>
              <span className="text-cyan-800 font-bold">RAW OTX</span>
              <span className="text-slate-400 text-[10px]">[KAFKA/HDFS]</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-50 text-slate-900 border border-cyan-400 font-bold shadow-sm'
                    : 'text-slate-600 hover:text-teal-700 hover:bg-slate-100'
                }`
              }
            >
              <Activity className="w-4 h-4 text-cyan-600" />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/pulses"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-50 text-slate-900 border border-cyan-400 font-bold shadow-sm'
                    : 'text-slate-600 hover:text-teal-700 hover:bg-slate-100'
                }`
              }
            >
              <Radio className="w-4 h-4 text-cyan-600" />
              <span>Pulses</span>
            </NavLink>

            <NavLink
              to="/indicators"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-50 text-slate-900 border border-cyan-400 font-bold shadow-sm'
                    : 'text-slate-600 hover:text-teal-700 hover:bg-slate-100'
                }`
              }
            >
              <Key className="w-4 h-4 text-cyan-600" />
              <span>Indicators</span>
            </NavLink>
          </nav>

          {/* Mock/API Data Toggle Badge */}
          <div className="hidden sm:flex items-center gap-2">
            <span
              title={usingMock ? 'Using local mock CTI dataset' : `Connecting to API: ${getApiBaseUrl()}`}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono border font-medium ${
                usingMock
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : 'bg-cyan-50 text-cyan-900 border-cyan-300'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              {usingMock ? 'DATA: MOCK' : 'DATA: API'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
