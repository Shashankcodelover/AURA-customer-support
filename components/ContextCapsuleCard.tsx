'use client';

import { useState } from 'react';
import { ContextCapsule } from '@/lib/types';
import { AlertTriangle, CheckCircle2, Copy, Sparkles, ShieldAlert, ArrowRight, Zap, Check } from 'lucide-react';
import ConfidenceGauge from './ConfidenceGauge';

const URGENCY_STYLES: Record<string, { badge: string; border: string; glow: string }> = {
  High: {
    badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    border: 'border-rose-500/30 hover:border-rose-500/50',
    glow: 'from-rose-500/10 via-transparent to-transparent',
  },
  Medium: {
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    border: 'border-amber-500/30 hover:border-amber-500/50',
    glow: 'from-amber-500/10 via-transparent to-transparent',
  },
  Low: {
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    border: 'border-emerald-500/30 hover:border-emerald-500/50',
    glow: 'from-emerald-500/10 via-transparent to-transparent',
  },
};

const TIER_BADGES: Record<string, string> = {
  Enterprise: 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.2)]',
  Pro: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]',
  Free: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

function sentimentEmoji(v: number) {
  if (v <= -0.4) return { emoji: '😠', label: 'Frustrated', color: 'text-rose-400' };
  if (v <= 0) return { emoji: '😐', label: 'Neutral', color: 'text-amber-400' };
  return { emoji: '🙂', label: 'Satisfied', color: 'text-emerald-400' };
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
  const [copied, setCopied] = useState(false);

  const urgencyConfig = URGENCY_STYLES[capsule.urgency] || URGENCY_STYLES.Medium;
  const tierClass = TIER_BADGES[capsule.customerTier] || TIER_BADGES.Free;

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(capsule, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const applyPreset = (presetText: string) => {
    setNote(presetText);
    setResolving(true);
  };

  return (
    <div
      className={`glass-card p-5 space-y-5 animate-fadeIn relative overflow-hidden border transition-all duration-300 bg-gradient-to-b ${urgencyConfig.glow} ${urgencyConfig.border}`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <ConfidenceGauge value={capsule.confidence} size={58} strokeWidth={5} />
            <div className="absolute -bottom-1 -right-1 bg-slate-900 border border-white/10 rounded-full p-0.5">
              <ShieldAlert size={12} className="text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1">
                <Sparkles size={11} /> Context Capsule
              </span>
              <span className="text-gray-600 text-xs">·</span>
              <span className="text-[11px] text-gray-400 font-mono">ID: {capsule.id.slice(0, 8)}</span>
            </div>
            <h3 className="font-display text-lg font-semibold text-white flex items-center gap-2">
              {capsule.customerName}
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${tierClass}`}>
                {capsule.customerTier}
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyPayload}
            title="Copy JSON Payload"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition text-xs flex items-center gap-1"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          </button>
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${urgencyConfig.badge}`}>
            {capsule.urgency} urgency
          </span>
        </div>
      </div>

      {/* Category & Time Meta */}
      <div className="flex flex-wrap items-center justify-between text-xs text-gray-400 border-y border-white/5 py-2.5 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Domain:</span>
          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-200 font-medium">
            {capsule.category}
          </span>
        </div>
        {capsule.createdAt && (
          <span className="font-mono text-gray-500 text-[11px]">
            {new Date(capsule.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      {/* Sentiment Progression Arc */}
      <div className="bg-black/30 rounded-xl p-3 border border-white/5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] uppercase tracking-wider text-gray-400 font-medium">Sentiment Progression Arc</p>
          <span className="text-[10px] font-mono text-gray-500">Turn-by-turn trajectory</span>
        </div>
        <div className="flex items-center gap-2">
          {capsule.sentimentTrend.map((v, i) => {
            const info = sentimentEmoji(v);
            const isLast = i === capsule.sentimentTrend.length - 1;
            return (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-all ${
                    isLast
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.15)]'
                      : 'bg-white/5 border-white/10 text-gray-400'
                  }`}
                >
                  <span className="text-base">{info.emoji}</span>
                  <span className="font-mono text-[11px]">{v > 0 ? `+${v.toFixed(1)}` : v.toFixed(1)}</span>
                </div>
                {i < capsule.sentimentTrend.length - 1 && (
                  <ArrowRight size={12} className="text-gray-600 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Root Cause Analysis */}
      <div>
        <p className="text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-1.5">Corroborated Root Cause</p>
        <p className="text-sm text-gray-200 leading-relaxed bg-white/[0.03] border border-white/5 rounded-xl p-3">
          {capsule.rootCause}
        </p>
      </div>

      {/* What AURA Already Executed */}
      <div>
        <p className="text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-1.5 flex items-center gap-1.5">
          <Zap size={13} className="text-cyan-400" /> Automated Interventions Executed
        </p>
        <div className="space-y-1.5">
          {capsule.attemptedActions.slice(0, 4).map((a, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-gray-300 bg-black/20 rounded-lg p-2 border border-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
              <span>{a}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Action */}
      <div className="flex items-start gap-2.5 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-cyan-500/30 rounded-xl p-3.5 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
        <AlertTriangle size={18} className="text-cyan-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-cyan-200 uppercase tracking-wide">Recommended Autonomous Resolution</p>
          <p className="text-sm text-cyan-100 mt-0.5">{capsule.recommendedAction}</p>
        </div>
      </div>

      {/* One-Click Resolution Presets */}
      {!resolving && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span>Fast Dispatch Presets:</span>
            <span className="text-cyan-400">1-click draft</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => applyPreset('Approved full credit adjustment + complimentary 1-month service waiver.')}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-500/30 text-gray-300 hover:text-cyan-300 transition"
            >
              💳 Credit Adjustment
            </button>
            <button
              onClick={() => applyPreset('Expedited overnight carrier replacement dispatched via tier-1 priority queue.')}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-500/30 text-gray-300 hover:text-cyan-300 transition"
            >
              📦 Expedite Dispatch
            </button>
            <button
              onClick={() => applyPreset('Applied 25% annual retention discount and assigned dedicated enterprise account engineer.')}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-500/30 text-gray-300 hover:text-cyan-300 transition"
            >
              🤝 Executive Retention
            </button>
          </div>
        </div>
      )}

      {/* Human Resolution Box */}
      {!resolving ? (
        <button
          onClick={() => setResolving(true)}
          className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition text-sm font-semibold text-white flex items-center justify-center gap-2 shadow-sm"
        >
          Resolve this case &amp; Update KB
        </button>
      ) : (
        <div className="space-y-3 bg-black/40 border border-white/10 rounded-xl p-3.5 animate-fadeIn">
          <label className="text-xs font-medium text-gray-300 flex items-center justify-between">
            <span>Resolution Rationale</span>
            <span className="text-[10px] text-violet-400 font-mono">Feeds Self-Learning Loop</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Document corrective actions taken. This will automatically draft a permanent Knowledge Base article..."
            className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-400 resize-none transition"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              onClick={() => setResolving(false)}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-400 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => onResolve(capsule.id, note || 'Standard enterprise remediation protocol executed.')}
              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-violet-600 hover:opacity-95 text-white transition text-xs font-semibold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              <CheckCircle2 size={15} /> Confirm Resolution &amp; Synthesize Article
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
