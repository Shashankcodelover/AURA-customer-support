'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Ticket } from '@/lib/types';

export default function ChurnRadar({ tickets }: { tickets: Ticket[] }) {
  const counts: Record<string, number> = {};
  tickets.forEach((t) => {
    counts[t.category] = (counts[t.category] || 0) + 1;
  });
  const data = Object.entries(counts).map(([category, count]) => ({ category, count }));

  const customerRisk: Record<string, { negatives: number; total: number }> = {};
  tickets.forEach((t) => {
    if (!customerRisk[t.customerId]) customerRisk[t.customerId] = { negatives: 0, total: 0 };
    customerRisk[t.customerId].total += 1;
    if (t.sentiment === 'Negative') customerRisk[t.customerId].negatives += 1;
  });

  const riskList = Object.entries(customerRisk)
    .map(([customerId, v]) => ({
      customerId,
      score: v.total ? v.negatives / v.total : 0,
      total: v.total,
    }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="glass-card p-5">
        <h3 className="font-display font-semibold mb-4">Recurring Issue Clusters</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2A44" />
              <XAxis dataKey="category" stroke="#8A94B3" fontSize={12} />
              <YAxis stroke="#8A94B3" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #2A3655', borderRadius: 8 }} />
              <Bar dataKey="count" fill="#3EC6FF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="font-display font-semibold mb-4">Churn Risk Radar</h3>
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {riskList.map((r) => {
            const level = r.score >= 0.6 ? 'High' : r.score >= 0.3 ? 'Medium' : 'Low';
            const color =
              level === 'High'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                : level === 'Medium'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
            return (
              <div key={r.customerId} className="flex items-center justify-between text-sm">
                <span className="text-gray-300">
                  {r.customerId} <span className="text-gray-500">· {r.total} ticket(s)</span>
                </span>
                <span className={`px-2.5 py-1 rounded-full border text-xs ${color}`}>{level} risk</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
