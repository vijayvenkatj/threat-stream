import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, Activity, Radio, Key, Database, Layers } from 'lucide-react';
import { isUsingMockData, getApiBaseUrl } from '../../api/client';

export function Navbar() {
  const usingMock = isUsingMockData();

  return (
    <header className="sticky top-0 z-50 bg-cyber-900/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Pipeline Status */}
          <div className="flex items-center gap-4">
            <NavLink to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 group-hover:shadow-cyber-glow transition-all">
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-wider text-slate-100 font-mono flex items-center gap-1.5">
                  THREAT<span className="text-cyan-400">STREAM</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400 tracking-tight">
                  CYBER THREAT INTELLIGENCE
                </span>
              </div>
            </NavLink>

            {/* Pipeline Stage Badge */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-850 border border-slate-800 text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-slate-400">STAGE:</span>
              <span className="text-emerald-400 font-semibold">RAW OTX</span>
              <span className="text-slate-500 text-[10px]">[KAFKA/HDFS]</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  isActive
                    ? 'bg-cyber-800 text-cyan-400 border border-cyan-500/40 shadow-cyber-glow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-cyber-850'
                }`
              }
            >
              <Activity className="w-4 h-4" />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/pulses"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  isActive
                    ? 'bg-cyber-800 text-cyan-400 border border-cyan-500/40 shadow-cyber-glow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-cyber-850'
                }`
              }
            >
              <Radio className="w-4 h-4" />
              <span>Pulses</span>
            </NavLink>

            <NavLink
              to="/indicators"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  isActive
                    ? 'bg-cyber-800 text-cyan-400 border border-cyan-500/40 shadow-cyber-glow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-cyber-850'
                }`
              }
            >
              <Key className="w-4 h-4" />
              <span>Indicators</span>
            </NavLink>
          </nav>

          {/* Mock/API Data Toggle Badge */}
          <div className="hidden sm:flex items-center gap-2">
            <span
              title={usingMock ? 'Using local mock CTI dataset' : `Connecting to API: ${getApiBaseUrl()}`}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono border ${
                usingMock
                  ? 'bg-amber-950/50 text-amber-300 border-amber-800/60'
                  : 'bg-cyan-950/50 text-cyan-300 border-cyan-800/60'
              }`}
            >
              <Layers className="w-3 h-3" />
              {usingMock ? 'DATA: MOCK' : 'DATA: API'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
