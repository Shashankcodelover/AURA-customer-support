'use client';

import { useState } from 'react';
import { useAppState } from '@/lib/context/AppStateContext';
import ChurnRadar from '@/components/ChurnRadar';
import TrendingIssues from '@/components/TrendingIssues';
import { BarChart3, TrendingUp, Activity, CheckCircle, ShieldCheck, Zap, Download } from 'lucide-react';

export default function AnalyticsPage() {
  const { tickets, capsules, resolvedCapsules } = useAppState();
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header & Range Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center gap-1.5">
              <Activity size={12} className="text-cyan-400" />
              Executive Operations Intelligence
            </span>
            <span className="text-gray-600 text-xs">·</span>
            <span className="text-xs text-gray-400">Continuous Telemetry</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">
            Customer Experience &amp; Churn Analytics
          </h1>
          <p className="text-gray-400 text-sm mt-1 max-w-2xl">
            Live evaluation of multi-agent auto-resolution rates, recurring anomaly clusters, and proactive churn risk
            indicators across all customer tiers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-1">
            {(['24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  timeRange === range
                    ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              const data = JSON.stringify({ tickets, capsules, resolvedCapsules }, null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `aura-analytics-export-${Date.now()}.json`;
              a.click();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition text-xs flex items-center gap-1.5"
            title="Export Telemetry JSON"
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Executive KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 border border-white/5 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Autonomous Deflection</span>
            <Zap size={16} className="text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-bold text-white">68.4%</span>
            <span className="text-xs text-emerald-400 font-medium">+5.2% MoM</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Resolved without agent handover</p>
        </div>

        <div className="glass-card p-4 border border-white/5 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Customer CSAT</span>
            <CheckCircle size={16} className="text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-bold text-white">96.8%</span>
            <span className="text-xs text-emerald-400 font-medium">Industry Best</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Post-resolution satisfaction survey</p>
        </div>

        <div className="glass-card p-4 border border-white/5 bg-gradient-to-br from-violet-500/10 via-transparent to-transparent">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Avg Latency to Root Cause</span>
            <Activity size={16} className="text-violet-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-bold text-white">1.38s</span>
            <span className="text-xs text-cyan-400 font-medium">⚡ 85 tok/s</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Multi-agent parallel consensus</p>
        </div>

        <div className="glass-card p-4 border border-white/5 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Escalation Capsule SLA</span>
            <ShieldCheck size={16} className="text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-bold text-white">100%</span>
            <span className="text-xs text-emerald-400 font-medium">0 Lost History</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Zero repetitive customer re-prompts</p>
        </div>
      </div>

      {/* Churn Radar & Incident Clusters */}
      <ChurnRadar tickets={tickets} />

      {/* Emerging NLP Complaint Intelligence */}
      <TrendingIssues tickets={tickets} />
    </div>
  );
}
