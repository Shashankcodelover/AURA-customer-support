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
            <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-[rgba(14,156,116,0.08)] border border-[rgba(14,156,116,0.2)] text-[#0E9C74] flex items-center gap-1.5">
              <Activity size={12} className="text-[#0E9C74]" />
              Operations analytics
            </span>
            <span className="text-[#6B6E85] dark:text-[#8B8FA3] text-xs">·</span>
            <span className="text-xs text-[#9599AD]">Continuous Telemetry</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-[#1B1D2A] dark:text-white tracking-tight">
            Customer Experience &amp; Churn Analytics
          </h1>
          <p className="text-[#6B6E85] dark:text-[#8B8FA3] text-sm mt-1 max-w-2xl">
            Live evaluation of multi-agent auto-resolution rates, recurring anomaly clusters, and proactive churn risk
            indicators across all customer tiers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[rgba(255,255,255,0.5)] border border-white/90 dark:bg-[rgba(0,0,0,0.3)] dark:border-white/10 rounded-xl p-1">
            {(['24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  timeRange === range
                    ? 'bg-[rgba(109,74,235,0.12)] text-[#6D4AEB] shadow-sm border border-[rgba(109,74,235,0.3)]'
                    : 'text-[#6B6E85] hover:text-[#1B1D2A] dark:text-gray-400 dark:hover:text-white'
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
            className="p-2 rounded-xl bg-[rgba(255,255,255,0.5)] border border-white/90 text-[#6B6E85] hover:text-[#1B1D2A] dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 dark:text-gray-300 dark:hover:text-white transition text-xs flex items-center gap-1.5"
            title="Export Telemetry JSON"
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Executive KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between text-[#6B6E85] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Autonomous Deflection</span>
            <Zap size={16} className="text-[#0E9C74]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-bold text-[#1B1D2A] dark:text-white">68.4%</span>
            <span className="text-xs text-[#0E9C74] font-medium">+5.2% MoM</span>
          </div>
          <p className="text-[11px] text-[#9599AD] mt-1">Resolved without agent handover</p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between text-[#6B6E85] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Customer CSAT</span>
            <CheckCircle size={16} className="text-[#0E9C74]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-bold text-[#1B1D2A] dark:text-white">96.8%</span>
            <span className="text-xs text-[#0E9C74] font-medium">Industry Best</span>
          </div>
          <p className="text-[11px] text-[#9599AD] mt-1">Post-resolution satisfaction survey</p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between text-[#6B6E85] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Avg Latency to Root Cause</span>
            <Activity size={16} className="text-[#6D4AEB]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-bold text-[#1B1D2A] dark:text-white">1.38s</span>
            <span className="text-xs text-[#6D4AEB] font-medium">⚡ 85 tok/s</span>
          </div>
          <p className="text-[11px] text-[#9599AD] mt-1">Multi-agent parallel consensus</p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between text-[#6B6E85] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Escalation Capsule SLA</span>
            <ShieldCheck size={16} className="text-[#C97A00]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-bold text-[#1B1D2A] dark:text-white">100%</span>
            <span className="text-xs text-[#0E9C74] font-medium">0 Lost History</span>
          </div>
          <p className="text-[11px] text-[#9599AD] mt-1">Zero repetitive customer re-prompts</p>
        </div>
      </div>

      {/* 24-Hour Incident Heatmap & SLA Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 24-Hour Incident Telemetry Heatmap */}
        <div className="lg:col-span-2 glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-[#6D4AEB]" />
                <h2 className="text-base font-semibold text-[#1B1D2A] dark:text-white">24-Hour Telemetry & Incident Density</h2>
              </div>
              <p className="text-xs text-[#6B6E85] mt-0.5">
                Hourly throughput of incoming inquiries, autonomous agent deflections, and peak load windows
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-[#6B6E85]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#6D4AEB]/30 border border-[#6D4AEB]/40"></span>
                Normal
              </span>
              <span className="flex items-center gap-1.5 text-[#6B6E85]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#6D4AEB] shadow-[0_0_8px_rgba(109,74,235,0.6)]"></span>
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
                    <div className="absolute -top-14 hidden group-hover:flex flex-col items-center z-20 pointer-events-none whitespace-nowrap bg-[rgba(27,29,42,0.95)] backdrop-blur-md border border-[rgba(109,74,235,0.3)] px-2.5 py-1.5 rounded-lg shadow-xl text-[10px]">
                      <span className="font-mono text-[#6D4AEB] font-semibold">{slot.hour}:00 UTC</span>
                      <span className="text-[#E8EAF0]">{slot.val} incidents · {slot.defl} deflected</span>
                    </div>
                    {/* Bar */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-sm transition-all duration-300 group-hover:scale-y-105 ${
                        isPeak
                          ? 'bg-gradient-to-t from-[#6D4AEB] to-[#B69CFF] shadow-[0_0_12px_rgba(109,74,235,0.6)]'
                          : slot.val > 50
                          ? 'bg-[rgba(109,74,235,0.5)] hover:bg-[#6D4AEB]'
                          : 'bg-[rgba(109,74,235,0.15)] hover:bg-[rgba(109,74,235,0.3)]'
                      }`}
                    />
                    <span className="text-[9px] font-mono text-[#9599AD] mt-1.5 select-none hidden md:block">
                      {i % 3 === 0 ? slot.hour : ''}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-[#9599AD] mt-2 px-1 border-t border-black/5 dark:border-white/5 pt-2">
              <span>00:00 UTC (Low Latency)</span>
              <span className="text-[#6D4AEB] font-medium">14:00 UTC Peak (108 Inquiries / hr)</span>
              <span>23:00 UTC</span>
            </div>
          </div>
        </div>

        {/* Enterprise SLA Compliance Matrix */}
        <div className="glass-card p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={18} className="text-[#0E9C74]" />
              <h2 className="text-base font-semibold text-[#1B1D2A] dark:text-white">SLA Compliance Breakdown</h2>
            </div>
            <p className="text-xs text-[#6B6E85]">
              Distribution of response and resolution speeds across all active enterprise commitments
            </p>
          </div>

          {/* Segmented bar */}
          <div className="space-y-2">
            <div className="h-3 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden flex p-0.5 gap-0.5">
              <div style={{ width: '68.4%' }} className="bg-[#6D4AEB] rounded-l-full" title="Instant AI (<30s): 68.4%" />
              <div style={{ width: '24.2%' }} className="bg-[#0E9C74]" title="Tier-2 Capsule (1-3m): 24.2%" />
              <div style={{ width: '5.8%' }} className="bg-[#C97A00]" title="Specialized (3-10m): 5.8%" />
              <div style={{ width: '1.6%' }} className="bg-[#E11D48] rounded-r-full" title="Edge (>10m): 1.6%" />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-2.5 rounded-lg bg-[rgba(255,255,255,0.5)] border border-white/90 dark:bg-white/5 dark:border-white/5">
                <div className="flex items-center gap-1.5 text-[11px] text-[#6D4AEB] font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#6D4AEB]"></span>
                  Autonomous (&lt;30s)
                </div>
                <div className="text-lg font-bold font-mono text-[#1B1D2A] dark:text-white mt-0.5">68.4%</div>
                <div className="text-[10px] text-[#9599AD]">Instant multi-agent resolve</div>
              </div>

              <div className="p-2.5 rounded-lg bg-[rgba(255,255,255,0.5)] border border-white/90 dark:bg-white/5 dark:border-white/5">
                <div className="flex items-center gap-1.5 text-[11px] text-[#0E9C74] font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#0E9C74]"></span>
                  Warm Route (1-3m)
                </div>
                <div className="text-lg font-bold font-mono text-[#1B1D2A] dark:text-white mt-0.5">24.2%</div>
                <div className="text-[10px] text-[#9599AD]">Context Capsule handoff</div>
              </div>

              <div className="p-2.5 rounded-lg bg-[rgba(255,255,255,0.5)] border border-white/90 dark:bg-white/5 dark:border-white/5">
                <div className="flex items-center gap-1.5 text-[11px] text-[#C97A00] font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#C97A00]"></span>
                  L3 Escalated (3-10m)
                </div>
                <div className="text-lg font-bold font-mono text-[#1B1D2A] dark:text-white mt-0.5">5.8%</div>
                <div className="text-[10px] text-[#9599AD]">Human engineer review</div>
              </div>

              <div className="p-2.5 rounded-lg bg-[rgba(255,255,255,0.5)] border border-white/90 dark:bg-white/5 dark:border-white/5">
                <div className="flex items-center gap-1.5 text-[11px] text-[#E11D48] font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#E11D48]"></span>
                  Edge Overrides (&gt;10m)
                </div>
                <div className="text-lg font-bold font-mono text-[#1B1D2A] dark:text-white mt-0.5">1.6%</div>
                <div className="text-[10px] text-[#9599AD]">Critical multi-dept outage</div>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[rgba(14,156,116,0.06)] border border-[rgba(14,156,116,0.15)] text-[11px] text-[#0E9C74] flex items-center gap-2">
            <CheckCircle size={14} className="text-[#0E9C74] shrink-0" />
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
