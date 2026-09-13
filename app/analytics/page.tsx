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

      {/* 24-Hour Incident Heatmap & SLA Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 24-Hour Incident Telemetry Heatmap */}
        <div className="lg:col-span-2 glass-card p-6 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-cyan-400" />
                <h2 className="text-base font-semibold text-white">24-Hour Telemetry & Incident Density</h2>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Hourly throughput of incoming inquiries, autonomous agent deflections, and peak load windows
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-gray-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500/30 border border-cyan-400/40"></span>
                Normal
              </span>
              <span className="flex items-center gap-1.5 text-gray-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]"></span>
                Peak Load
              </span>
            </div>
          </div>

          {/* 24-hour visual bar grid */}
          <div className="pt-4 pb-2">
            <div className="grid grid-cols-12 md:grid-cols-24 gap-1.5 items-end h-32 px-1">
              {[
                { hour: '00', val: 12, defl: 11 }, { hour: '01', val: 8, defl: 7 }, { hour: '02', val: 6, defl: 6 },
                { hour: '03', val: 5, defl: 5 }, { hour: '04', val: 7, defl: 6 }, { hour: '05', val: 14, defl: 12 },
                { hour: '06', val: 24, defl: 19 }, { hour: '07', val: 38, defl: 30 }, { hour: '08', val: 56, defl: 42 },
                { hour: '09', val: 82, defl: 61 }, { hour: '10', val: 94, defl: 70 }, { hour: '11', val: 88, defl: 64 },
                { hour: '12', val: 76, defl: 58 }, { hour: '13', val: 91, defl: 69 }, { hour: '14', val: 108, defl: 79 }, // Peak
                { hour: '15', val: 102, defl: 74 }, { hour: '16', val: 89, defl: 67 }, { hour: '17', val: 73, defl: 54 },
                { hour: '18', val: 62, defl: 48 }, { hour: '19', val: 49, defl: 39 }, { hour: '20', val: 41, defl: 33 },
                { hour: '21', val: 31, defl: 26 }, { hour: '22', val: 22, defl: 19 }, { hour: '23', val: 16, defl: 14 }
              ].map((slot, i) => {
                const heightPercent = Math.max(12, Math.round((slot.val / 108) * 100));
                const isPeak = slot.val >= 100;
                return (
                  <div key={i} className="group relative flex flex-col items-center h-full justify-end">
                    {/* Tooltip */}
                    <div className="absolute -top-14 hidden group-hover:flex flex-col items-center z-20 pointer-events-none whitespace-nowrap bg-black/90 backdrop-blur-md border border-cyan-500/40 px-2.5 py-1.5 rounded-lg shadow-xl text-[10px]">
                      <span className="font-mono text-cyan-300 font-semibold">{slot.hour}:00 UTC</span>
                      <span className="text-gray-300">{slot.val} incidents · {slot.defl} deflected</span>
                    </div>
                    {/* Bar */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-sm transition-all duration-300 group-hover:scale-y-105 ${
                        isPeak
                          ? 'bg-gradient-to-t from-cyan-500 to-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.8)]'
                          : slot.val > 50
                          ? 'bg-cyan-500/50 hover:bg-cyan-400/80'
                          : 'bg-cyan-500/20 hover:bg-cyan-500/40'
                      }`}
                    />
                    <span className="text-[9px] font-mono text-gray-500 mt-1.5 select-none hidden md:block">
                      {i % 3 === 0 ? slot.hour : ''}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 mt-2 px-1 border-t border-white/5 pt-2">
              <span>00:00 UTC (Low Latency)</span>
              <span className="text-cyan-400 font-medium">14:00 UTC Peak (108 Inquiries / hr)</span>
              <span>23:00 UTC</span>
            </div>
          </div>
        </div>

        {/* Enterprise SLA Compliance Matrix */}
        <div className="glass-card p-6 border border-white/5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={18} className="text-emerald-400" />
              <h2 className="text-base font-semibold text-white">SLA Compliance Breakdown</h2>
            </div>
            <p className="text-xs text-gray-400">
              Distribution of response and resolution speeds across all active enterprise commitments
            </p>
          </div>

          {/* Segmented bar */}
          <div className="space-y-2">
            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden flex p-0.5 gap-0.5">
              <div style={{ width: '68.4%' }} className="bg-cyan-400 rounded-l-full" title="Instant AI (<30s): 68.4%" />
              <div style={{ width: '24.2%' }} className="bg-emerald-400" title="Tier-2 Capsule (1-3m): 24.2%" />
              <div style={{ width: '5.8%' }} className="bg-amber-400" title="Specialized (3-10m): 5.8%" />
              <div style={{ width: '1.6%' }} className="bg-rose-400 rounded-r-full" title="Edge (>10m): 1.6%" />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                <div className="flex items-center gap-1.5 text-[11px] text-cyan-300 font-medium">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  Autonomous (&lt;30s)
                </div>
                <div className="text-lg font-bold font-mono text-white mt-0.5">68.4%</div>
                <div className="text-[10px] text-gray-500">Instant multi-agent resolve</div>
              </div>

              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Warm Route (1-3m)
                </div>
                <div className="text-lg font-bold font-mono text-white mt-0.5">24.2%</div>
                <div className="text-[10px] text-gray-500">Context Capsule handoff</div>
              </div>

              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                <div className="flex items-center gap-1.5 text-[11px] text-amber-300 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  L3 Escalated (3-10m)
                </div>
                <div className="text-lg font-bold font-mono text-white mt-0.5">5.8%</div>
                <div className="text-[10px] text-gray-500">Human engineer review</div>
              </div>

              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                <div className="flex items-center gap-1.5 text-[11px] text-rose-300 font-medium">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                  Edge Overrides (&gt;10m)
                </div>
                <div className="text-lg font-bold font-mono text-white mt-0.5">1.6%</div>
                <div className="text-[10px] text-gray-500">Critical multi-dept outage</div>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2">
            <CheckCircle size={14} className="text-emerald-400 shrink-0" />
            <span>98.4% of total customer inquiries resolved within SLA target.</span>
          </div>
        </div>
      </div>

      {/* Churn Radar & Incident Clusters */}
      <ChurnRadar tickets={tickets} />

      {/* Emerging NLP Complaint Intelligence */}
      <TrendingIssues tickets={tickets} />
    </div>
  );
}
