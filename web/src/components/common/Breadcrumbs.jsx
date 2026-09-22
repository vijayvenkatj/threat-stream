import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs({ items = [] }) {
  return (
    <nav className="flex items-center gap-2 text-xs font-mono text-slate-600 font-medium mb-6">
      <Link to="/" className="flex items-center gap-1 text-slate-700 hover:text-cyan-700 transition-colors">
        <Home className="w-3.5 h-3.5 text-cyan-600" />
        <span>Dashboard</span>
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          {item.path ? (
            <Link to={item.path} className="text-slate-700 hover:text-cyan-700 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-900 font-bold truncate max-w-xs">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
