import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Dashboard } from './pages/Dashboard';
import { PulseExplorer } from './pages/PulseExplorer';
import { PulseDetails } from './pages/PulseDetails';
import { IndicatorExplorer } from './pages/IndicatorExplorer';
import { IndicatorDetails } from './pages/IndicatorDetails';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-cyber-900 text-slate-100 bg-cyber-grid">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pulses" element={<PulseExplorer />} />
            <Route path="/pulses/:id" element={<PulseDetails />} />
            <Route path="/indicators" element={<IndicatorExplorer />} />
            <Route path="/indicators/:id" element={<IndicatorDetails />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
