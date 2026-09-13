'use client';

import { useState } from 'react';
import { ContextCapsule } from '@/lib/types';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import ConfidenceGauge from './ConfidenceGauge';

const URGENCY_STYLES: Record<string, string> = {
  High: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  Medium: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Low: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
};

function sentimentEmoji(v: number) {
  if (v <= -0.4) return '😠';
  if (v <= 0) return '😐';
  return '🙂';
}

export default function ContextCapsuleCard({
  capsule,
  onResolve,
}: {
  capsule: ContextCapsule;
  onResolve: (id: string, note: string) => void;
}) {
  const [note, setNote] = useState('');
  const [resolving, setResolving] = useState(false);

  return (
    <div className="glass-card p-5 space-y-4 animate-fadeIn">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <ConfidenceGauge value={capsule.confidence} size={56} />
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">Context Capsule</p>
            <h3 className="font-display text-lg font-semibold">
              {capsule.customerName} <span className="text-gray-500 text-sm font-normal">· {capsule.customerTier}</span>
            </h3>
          </div>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full border whitespace-nowrap ${URGENCY_STYLES[capsule.urgency]}`}>
          {capsule.urgency} urgency
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className="text-gray-400">
          Category: <span className="text-white">{capsule.category}</span>
        </span>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Sentiment trend</p>
        <div className="flex gap-2 text-xl">
          {capsule.sentimentTrend.map((v, i) => (
            <span key={i}>{sentimentEmoji(v)}</span>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Root cause</p>
        <p className="text-sm text-gray-200">{capsule.rootCause}</p>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">What AURA already tried</p>
        <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
          {capsule.attemptedActions.slice(0, 4).map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      </div>

      <div className="flex items-start gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3">
        <AlertTriangle size={16} className="text-cyan-400 mt-0.5 shrink-0" />
        <p className="text-sm text-cyan-100">{capsule.recommendedAction}</p>
      </div>

      {!resolving ? (
        <button
          onClick={() => setResolving(true)}
          className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 transition text-sm font-medium"
        >
          Resolve this case
        </button>
      ) : (
        <div className="space-y-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="How did you resolve this? (used to auto-draft a KB article)"
            className="w-full bg-black/30 border border-white/10 rounded-xl p-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-400"
            rows={2}
          />
          <button
            onClick={() => onResolve(capsule.id, note)}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 hover:opacity-90 transition text-sm font-semibold flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={16} /> Mark Resolved &amp; Update Knowledge Base
          </button>
        </div>
      )}
    </div>
  );
}
