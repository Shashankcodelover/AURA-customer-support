'use client';

import { useAppState } from '@/lib/context/AppStateContext';
import ContextCapsuleCard from '@/components/ContextCapsuleCard';

export default function DashboardPage() {
  const { capsules, resolvedCapsules, kbArticles, resolveCapsule } = useAppState();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold mb-1">Agent Dashboard</h1>
        <p className="text-gray-400 text-sm">
          Escalated cases arrive here with full context — no repeated questions, no lost history.
        </p>
      </div>

      {capsules.length === 0 ? (
        <div className="glass-card p-8 text-center text-gray-400 text-sm">
          No escalated cases yet. Try the <span className="text-cyan-400">Delayed Shipment</span> or{' '}
          <span className="text-cyan-400">Cancel Subscription</span> scenario on the Customer Chat page to see a
          Context Capsule appear here.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {capsules.map((c) => (
            <ContextCapsuleCard key={c.id} capsule={c} onResolve={resolveCapsule} />
          ))}
        </div>
      )}

      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="font-display font-semibold">
            Knowledge Base <span className="text-gray-500 font-normal text-sm">({kbArticles.length} articles)</span>
          </h2>
          {resolvedCapsules.length > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30">
              🔁 Self-learning loop: {resolvedCapsules.length} article(s) added this session
            </span>
          )}
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {kbArticles.map((a) => (
            <div key={a.id} className="text-sm border-b border-white/5 pb-2">
              <p className="text-gray-200 font-medium">{a.title}</p>
              <p className="text-gray-500 text-xs">{a.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
