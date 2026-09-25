'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { Ticket } from '@/lib/types';
import customersData from '@/lib/data/customers.json';
import { ShieldAlert, UserCheck, AlertOctagon, TrendingDown, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useAppState } from '@/lib/context/AppStateContext';

const CUSTOMER_MAP = new Map(customersData.map((c) => [c.id, c]));

const CATEGORY_COLORS: Record<string, string> = {
  Billing: '#06b6d4', // cyan-500
  Order: '#3b82f6', // violet-500
  Technical: '#3b82f6', // blue-500
  Account: '#ec4899', // pink-500
};

export default function ChurnRadar({ tickets }: { tickets: Ticket[] }) {
  const { pushToast } = useAppState();
  const [activeCustomerAction, setActiveCustomerAction] = useState<string | null>(null);

  // 1. Recurring Issue Clusters
  const counts: Record<string, number> = {};
  tickets.forEach((t) => {
    counts[t.category] = (counts[t.category] || 0) + 1;
  });
  const chartData = Object.entries(counts).map(([category, count]) => ({
    category,
    count,
    fill: CATEGORY_COLORS[category] || '#06b6d4',
  }));

  // 2. Customer Churn Risk Calculation
  const customerRisk: Record<string, { negatives: number; total: number; lastSubject: string }> = {};
  tickets.forEach((t) => {
    if (!customerRisk[t.customerId]) {
      customerRisk[t.customerId] = { negatives: 0, total: 0, lastSubject: t.subject };
    }
    customerRisk[t.customerId].total += 1;
    if (t.sentiment === 'Negative') customerRisk[t.customerId].negatives += 1;
  });

  const riskList = Object.entries(customerRisk)
    .map(([customerId, v]) => {
      const customer = CUSTOMER_MAP.get(customerId);
      const score = v.total ? v.negatives / v.total : 0;
      return {
        customerId,
        name: customer?.name || customerId,
        tier: customer?.tier || 'Pro',
        score,
        total: v.total,
        negatives: v.negatives,
        lastSubject: v.lastSubject,
      };
    })
    .sort((a, b) => b.score - a.score);

  const handleTriggerRetention = (name: string, customerId: string) => {
    setActiveCustomerAction(customerId);
    pushToast(`🎯 Automated Retention Concierge dispatched for ${name} (${customerId})`, 'success');
    setTimeout(() => setActiveCustomerAction(null), 3000);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-4 sm:p-5">
      {/* Left: Category Distribution Chart */}
      <div className="glass-card p-5 md:p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display font-semibold text-[#1B1D2A] dark:text-white flex items-center gap-2">
              <TrendingDown size={18} className="text-[#6D4AEB] dark:text-violet-400" />
              Incident Velocity by Category
            </h3>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[rgba(255,255,255,0.7)] dark:bg-white/5 border border-white/90 dark:border-white/10 text-slate-700 dark:text-slate-300 dark:text-gray-400">
              Live Aggregation
            </span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 dark:text-gray-400 mb-6">
            Real-time clustering across incoming multi-modal tickets and conversation threads.
          </p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E5EE" vertical={false} className="dark:stroke-[#1f293d]" />
              <XAxis dataKey="category" stroke="#9599AD" fontSize={11} tickLine={false} />
              <YAxis stroke="#9599AD" fontSize={11} allowDecimals={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-slate-900 border border-white/90 dark:border-white/10 rounded-xl p-3 shadow-2xl">
                        <p className="text-xs font-semibold text-[#1B1D2A] dark:text-white">{data.category} Tickets</p>
                        <p className="text-sm font-bold text-[#6D4AEB] dark:text-violet-400 mt-1">{data.count} incidents</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-4 gap-2 pt-4 border-t border-[rgba(109,74,235,0.08)] dark:border-white/5 mt-4">
          {chartData.map((item) => (
            <div key={item.category} className="text-center">
              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono">{item.category}</span>
              <p className="text-sm font-bold text-[#1B1D2A] dark:text-white mt-0.5">{item.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Predictive Churn Radar & Proactive Intervention */}
      <div className="glass-card p-5 md:p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display font-semibold text-[#1B1D2A] dark:text-white flex items-center gap-2">
              <AlertOctagon size={18} className="text-[#E11D48]" />
              Predictive Customer Churn Radar
            </h3>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[rgba(225,29,72,0.06)] border border-[rgba(225,29,72,0.2)] text-[#E11D48] dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-300">
              High-Risk Alerting
            </span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 dark:text-gray-400 mb-4">
            Accounts evaluated by repeated negative sentiment friction. Instant trigger allows proactive outreach before cancellation.
          </p>
        </div>

        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {riskList.map((r) => {
            const level = r.score >= 0.6 ? 'High' : r.score >= 0.3 ? 'Medium' : 'Low';
            const badgeStyle =
              level === 'High'
                ? 'bg-[rgba(225,29,72,0.1)] text-[#E11D48] border-[rgba(225,29,72,0.3)] dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30'
                : level === 'Medium'
                ? 'bg-[rgba(201,122,0,0.1)] text-[#C97A00] border-[rgba(201,122,0,0.3)] dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30'
                : 'bg-[rgba(14,156,116,0.1)] text-[#0E9C74] border-[rgba(14,156,116,0.3)] dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30';

            const tierStyle =
              r.tier === 'Enterprise'
                ? 'bg-[rgba(109,74,235,0.1)] text-[#6D4AEB] border-[rgba(109,74,235,0.3)] dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30'
                : r.tier === 'Pro'
                ? 'bg-[rgba(14,156,116,0.1)] text-[#0E9C74] border-[rgba(14,156,116,0.3)] dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/30'
                : 'bg-[rgba(255,255,255,0.7)] text-slate-700 dark:text-slate-300 border-white/90 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/30';

            const isActionActive = activeCustomerAction === r.customerId;

            return (
              <div
                key={r.customerId}
                className="p-3 rounded-xl bg-[rgba(255,255,255,0.5)] dark:bg-black/30 border border-white/90 dark:border-white/5 hover:border-[rgba(109,74,235,0.2)] dark:hover:border-white/10 transition focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#1B1D2A] dark:text-white">{r.name}</span>
                    <span className={`text-[10px] px-2 py-0.2 rounded-full border font-medium ${tierStyle}`}>
                      {r.tier}
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-400 dark:text-gray-500 font-mono">({r.customerId})</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 dark:text-gray-400 line-clamp-1">
                    Last issue: &quot;{r.lastSubject}&quot;
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 dark:text-gray-500">
                    <span>{r.total} total ticket(s)</span>
                    <span>·</span>
                    <span className="text-[#E11D48] dark:text-rose-400 font-medium">{r.negatives} negative sentiment</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${badgeStyle}`}>
                    {level} Risk ({(r.score * 100).toFixed(0)}%)
                  </span>

                  <button
                    onClick={() => handleTriggerRetention(r.name, r.customerId)}
                    disabled={isActionActive}
                    className={`px-2.5 py-1 rounded-xl text-xs font-medium transition focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none flex items-center gap-1 border ${
                      isActionActive
                        ? 'bg-[rgba(14,156,116,0.08)] border-[rgba(14,156,116,0.25)] text-[#0E9C74] dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300'
                        : 'bg-[rgba(255,255,255,0.7)] hover:bg-[rgba(109,74,235,0.1)] border-white/90 hover:border-[rgba(109,74,235,0.3)] text-slate-700 dark:text-slate-300 hover:text-[#6D4AEB] dark:bg-white/5 dark:hover:bg-violet-500/20 dark:border-white/10 dark:hover:border-violet-500/40 dark:text-gray-300 dark:hover:text-violet-300'
                    }`}
                  >
                    {isActionActive ? (
                      <>
                        <CheckCircle2 size={12} className="text-[#0E9C74] dark:text-emerald-400" /> Concierge Dispatched
                      </>
                    ) : (
                      <>
                        <ArrowUpRight size={12} /> Intervene
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
