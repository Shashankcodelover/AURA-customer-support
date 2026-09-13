'use client';

import { useState } from 'react';
import { ContextCapsule } from '@/lib/types';
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Zap,
  Check,
  FileText,
  Printer,
  X,
  DollarSign,
} from 'lucide-react';
import ConfidenceGauge from './ConfidenceGauge';

const URGENCY_STYLES: Record<string, { badge: string; border: string; glow: string }> = {
  High: {
    badge: 'bg-[rgba(225,29,72,0.08)] text-[#E11D48] border-[rgba(225,29,72,0.2)] dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30',
    border: 'border-[rgba(225,29,72,0.2)] hover:border-[rgba(225,29,72,0.4)] dark:border-rose-500/30 dark:hover:border-rose-500/50',
    glow: 'from-[rgba(225,29,72,0.04)] via-transparent to-transparent dark:from-rose-500/10 dark:via-transparent dark:to-transparent',
  },
  Medium: {
    badge: 'bg-[rgba(201,122,0,0.08)] text-[#C97A00] border-[rgba(201,122,0,0.2)] dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
    border: 'border-[rgba(201,122,0,0.2)] hover:border-[rgba(201,122,0,0.4)] dark:border-amber-500/30 dark:hover:border-amber-500/50',
    glow: 'from-[rgba(201,122,0,0.04)] via-transparent to-transparent dark:from-amber-500/10 dark:via-transparent dark:to-transparent',
  },
  Low: {
    badge: 'bg-[rgba(14,156,116,0.08)] text-[#0E9C74] border-[rgba(14,156,116,0.2)] dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
    border: 'border-[rgba(14,156,116,0.2)] hover:border-[rgba(14,156,116,0.4)] dark:border-emerald-500/30 dark:hover:border-emerald-500/50',
    glow: 'from-[rgba(14,156,116,0.04)] via-transparent to-transparent dark:from-emerald-500/10 dark:via-transparent dark:to-transparent',
  },
};

const TIER_BADGES: Record<string, string> = {
  Enterprise: 'bg-[rgba(109,74,235,0.08)] text-[#6D4AEB] border-[rgba(109,74,235,0.25)] dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/40 shadow-[0_0_12px_rgba(109,74,235,0.1)] dark:shadow-[0_0_12px_rgba(168,85,247,0.2)]',
  Pro: 'bg-[rgba(14,156,116,0.08)] text-[#0E9C74] border-[rgba(14,156,116,0.25)] dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40 shadow-[0_0_12px_rgba(14,156,116,0.1)] dark:shadow-[0_0_12px_rgba(16,185,129,0.2)]',
  Free: 'bg-[rgba(107,110,133,0.08)] text-[#6B6E85] border-[rgba(107,110,133,0.2)] dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/30',
};

function sentimentEmoji(v: number) {
  if (v <= -0.4) return { emoji: '😠', label: 'Frustrated', color: 'text-[#E11D48] dark:text-rose-400' };
  if (v <= 0) return { emoji: '😐', label: 'Neutral', color: 'text-[#C97A00] dark:text-amber-400' };
  return { emoji: '🙂', label: 'Satisfied', color: 'text-[#0E9C74] dark:text-emerald-400' };
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
  const [showReportModal, setShowReportModal] = useState(false);

  const urgencyConfig = URGENCY_STYLES[capsule.urgency] || URGENCY_STYLES.Medium;
  const tierClass = TIER_BADGES[capsule.customerTier] || TIER_BADGES.Free;

  const ltvDisplay =
    capsule.customerTier === 'Enterprise'
      ? '$14,400 LTV'
      : capsule.customerTier === 'Pro'
      ? '$870 LTV'
      : 'Conversion Prospect';

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
    <>
      <div
        className={`glass-card p-5 space-y-5 animate-fadeIn relative overflow-hidden border transition-all duration-300 bg-gradient-to-b ${urgencyConfig.glow} ${urgencyConfig.border}`}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <ConfidenceGauge value={capsule.confidence} size={58} strokeWidth={5} />
              <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 border border-[rgba(255,255,255,0.9)] dark:border-white/10 rounded-full p-0.5">
                <ShieldAlert size={12} className="text-[#C97A00] dark:text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#6D4AEB] dark:text-violet-400 font-semibold flex items-center gap-1">
                  <Sparkles size={11} /> Context Capsule
                </span>
                <span className="text-[#9599AD] text-xs">·</span>
                <span className="text-[11px] text-[#9599AD] dark:text-gray-400 font-mono">ID: {capsule.id.slice(0, 8)}</span>
              </div>
              <h3 className="font-display text-lg font-semibold text-[#1B1D2A] dark:text-white flex items-center gap-2">
                {capsule.customerName}
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${tierClass}`}>
                  {capsule.customerTier}
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowReportModal(true)}
              title="Generate Executive Incident Brief"
              className="p-1.5 rounded-lg bg-[rgba(255,255,255,0.7)] hover:bg-[rgba(109,74,235,0.1)] border border-white/90 hover:border-[rgba(109,74,235,0.3)] text-[#6B6E85] hover:text-[#6D4AEB] dark:bg-white/5 dark:hover:bg-violet-500/20 dark:border-white/10 dark:hover:border-violet-500/40 dark:text-gray-400 dark:hover:text-violet-300 transition text-xs flex items-center gap-1"
            >
              <FileText size={13} />
            </button>

            <button
              onClick={handleCopyPayload}
              title="Copy JSON Payload"
              className="p-1.5 rounded-lg bg-[rgba(255,255,255,0.7)] hover:bg-[rgba(109,74,235,0.1)] border border-white/90 hover:border-[rgba(109,74,235,0.3)] text-[#6B6E85] hover:text-[#6D4AEB] dark:bg-white/5 dark:hover:bg-violet-500/20 dark:border-white/10 dark:hover:border-violet-500/40 dark:text-gray-400 dark:hover:text-violet-300 transition text-xs flex items-center gap-1"
            >
              {copied ? <Check size={13} className="text-[#0E9C74] dark:text-emerald-400" /> : <Copy size={13} />}
            </button>

            <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${urgencyConfig.badge}`}>
              {capsule.urgency} urgency
            </span>
          </div>
        </div>

        {/* Category, LTV & Time Meta */}
        <div className="flex flex-wrap items-center justify-between text-xs border-y border-[rgba(109,74,235,0.08)] dark:border-white/5 py-2.5 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[#9599AD]">Domain:</span>
            <span className="px-2 py-0.5 rounded-md bg-[rgba(255,255,255,0.5)] dark:bg-white/5 border border-white/90 dark:border-white/10 text-[#1B1D2A] dark:text-gray-200 font-medium">
              {capsule.category}
            </span>
            <span className="text-[#9599AD]">·</span>
            <span className="text-[#9599AD]">Account Exposure:</span>
            <span className="px-2 py-0.5 rounded-md bg-[rgba(109,74,235,0.06)] dark:bg-purple-500/10 border border-[rgba(109,74,235,0.2)] dark:border-purple-500/30 text-[#6D4AEB] dark:text-purple-300 font-mono text-[11px]">
              {ltvDisplay}
            </span>
          </div>

          {capsule.createdAt && (
            <span className="font-mono text-[#9599AD] dark:text-gray-500 text-[11px]">
              {new Date(capsule.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {/* Sentiment Progression Arc */}
        <div className="bg-[rgba(255,255,255,0.5)] dark:bg-black/30 rounded-xl p-3 border border-white/90 dark:border-white/5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] uppercase tracking-wider text-[#6B6E85] dark:text-gray-400 font-medium">Sentiment Progression Arc</p>
            <span className="text-[10px] font-mono text-[#9599AD] dark:text-gray-500">Turn-by-turn trajectory</span>
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
                        ? 'bg-[rgba(225,29,72,0.08)] dark:bg-rose-500/20 border-[rgba(225,29,72,0.2)] dark:border-rose-500/40 text-[#E11D48] dark:text-rose-300 shadow-[0_0_10px_rgba(225,29,72,0.15)] dark:shadow-[0_0_10px_rgba(244,63,94,0.15)]'
                        : 'bg-[rgba(255,255,255,0.7)] dark:bg-white/5 border-white/90 dark:border-white/10 text-[#6B6E85] dark:text-gray-400'
                    }`}
                  >
                    <span className="text-base">{info.emoji}</span>
                    <span className="font-mono text-[11px]">{v > 0 ? `+${v.toFixed(1)}` : v.toFixed(1)}</span>
                  </div>
                  {i < capsule.sentimentTrend.length - 1 && (
                    <ArrowRight size={12} className="text-[#9599AD] dark:text-gray-600 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Root Cause Analysis */}
        <div>
          <p className="text-[11px] uppercase tracking-wider text-[#6B6E85] font-medium mb-1.5">Corroborated Root Cause</p>
          <p className="text-sm text-[#1B1D2A] dark:text-gray-200 leading-relaxed bg-[rgba(255,255,255,0.5)] dark:bg-white/[0.03] border border-white/90 dark:border-white/5 rounded-xl p-3">
            {capsule.rootCause}
          </p>
        </div>

        {/* What AURA Already Executed */}
        <div>
          <p className="text-[11px] uppercase tracking-wider text-[#6B6E85] dark:text-gray-400 font-medium mb-1.5 flex items-center gap-1.5">
            <Zap size={13} className="text-[#6D4AEB] dark:text-violet-400" /> Automated Interventions Executed
          </p>
          <div className="space-y-1.5">
            {capsule.attemptedActions.slice(0, 4).map((a, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-xs text-[#1B1D2A] dark:text-gray-300 bg-[rgba(255,255,255,0.5)] dark:bg-black/20 rounded-lg p-2 border border-white/90 dark:border-white/5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#6D4AEB] dark:bg-violet-400 mt-1.5 shrink-0" />
                <span>{a}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Action */}
        <div className="flex items-start gap-2.5 bg-[rgba(109,74,235,0.06)] dark:bg-gradient-to-r dark:from-violet-500/10 dark:to-indigo-500/10 border border-[rgba(109,74,235,0.25)] dark:border-violet-500/30 rounded-xl p-3.5 shadow-[0_0_15px_rgba(109,74,235,0.05)] dark:shadow-[0_0_15px_rgba(139,92,246,0.1)]">
          <AlertTriangle size={18} className="text-[#6D4AEB] dark:text-violet-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-[#6D4AEB] dark:text-violet-200 uppercase tracking-wide">
              Recommended Autonomous Resolution
            </p>
            <p className="text-sm text-[#1B1D2A] dark:text-violet-100 mt-0.5">{capsule.recommendedAction}</p>
          </div>
        </div>

        {/* One-Click Resolution Presets */}
        {!resolving && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-[11px] text-[#6B6E85] dark:text-gray-400">
              <span>Fast Dispatch Presets:</span>
              <span className="text-[#6D4AEB] dark:text-violet-400">1-click draft</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => applyPreset('Approved full credit adjustment + complimentary 1-month service waiver.')}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-[rgba(255,255,255,0.7)] hover:bg-[rgba(109,74,235,0.1)] border border-white/90 hover:border-[rgba(109,74,235,0.3)] text-[#6B6E85] hover:text-[#6D4AEB] dark:bg-white/5 dark:hover:bg-violet-500/15 dark:border-white/10 dark:hover:border-violet-500/30 dark:text-gray-300 dark:hover:text-violet-300 transition"
              >
                💳 Credit Adjustment
              </button>
              <button
                onClick={() =>
                  applyPreset('Expedited overnight carrier replacement dispatched via tier-1 priority queue.')
                }
                className="text-[11px] px-2.5 py-1 rounded-lg bg-[rgba(255,255,255,0.7)] hover:bg-[rgba(109,74,235,0.1)] border border-white/90 hover:border-[rgba(109,74,235,0.3)] text-[#6B6E85] hover:text-[#6D4AEB] dark:bg-white/5 dark:hover:bg-violet-500/15 dark:border-white/10 dark:hover:border-violet-500/30 dark:text-gray-300 dark:hover:text-violet-300 transition"
              >
                📦 Expedite Dispatch
              </button>
              <button
                onClick={() =>
                  applyPreset(
                    'Applied 25% annual retention discount and assigned dedicated enterprise account engineer.'
                  )
                }
                className="text-[11px] px-2.5 py-1 rounded-lg bg-[rgba(255,255,255,0.7)] hover:bg-[rgba(109,74,235,0.1)] border border-white/90 hover:border-[rgba(109,74,235,0.3)] text-[#6B6E85] hover:text-[#6D4AEB] dark:bg-white/5 dark:hover:bg-violet-500/15 dark:border-white/10 dark:hover:border-violet-500/30 dark:text-gray-300 dark:hover:text-violet-300 transition"
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
            className="w-full py-2.5 rounded-xl bg-[rgba(255,255,255,0.7)] hover:bg-[rgba(109,74,235,0.1)] border border-white/90 dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/10 transition text-sm font-semibold text-[#6D4AEB] dark:text-white flex items-center justify-center gap-2 shadow-sm"
          >
            Resolve this case &amp; Update KB
          </button>
        ) : (
          <div className="space-y-3 bg-[rgba(255,255,255,0.5)] dark:bg-black/40 border border-white/90 dark:border-white/10 rounded-xl p-3.5 animate-fadeIn">
            <label className="text-xs font-medium text-[#1B1D2A] dark:text-gray-300 flex items-center justify-between">
              <span>Resolution Rationale</span>
              <span className="text-[10px] text-[#6D4AEB] dark:text-violet-400 font-mono">Feeds Self-Learning Loop</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Document corrective actions taken. This will automatically draft a permanent Knowledge Base article..."
              className="w-full bg-[rgba(255,255,255,0.7)] dark:bg-black/50 border border-white/90 dark:border-white/10 rounded-xl p-3 text-sm text-[#1B1D2A] dark:text-gray-100 placeholder-[#9599AD] dark:placeholder-gray-500 focus:outline-none focus:border-[#6D4AEB] dark:focus:border-violet-400 resize-none transition"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setResolving(false)}
                className="px-3 py-2 rounded-xl bg-[rgba(255,255,255,0.7)] hover:bg-white border border-white/90 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 text-xs text-[#6B6E85] dark:text-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => onResolve(capsule.id, note || 'Standard enterprise remediation protocol executed.')}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#6EE7C8] via-[#B69CFF] to-[#FFAFD1] hover:opacity-95 text-[#1B1D2A] transition text-xs font-semibold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(109,74,235,0.2)]"
              >
                <CheckCircle2 size={15} /> Confirm Resolution &amp; Synthesize Article
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Printable Executive Incident Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card p-6 max-w-2xl w-full bg-white dark:bg-[#0F1424] border-[rgba(109,74,235,0.3)] space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[rgba(109,74,235,0.1)] dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[#6D4AEB] dark:text-violet-400" />
                <div>
                  <h3 className="font-bold text-[#1B1D2A] dark:text-white text-base">Executive Incident Brief</h3>
                  <p className="text-xs text-[#9599AD] dark:text-gray-400 font-mono">INC-{capsule.id.slice(0, 10).toUpperCase()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-[rgba(109,74,235,0.1)] text-[#6D4AEB] border border-[rgba(109,74,235,0.3)] dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/40 text-xs font-semibold flex items-center gap-1.5 hover:bg-[rgba(109,74,235,0.2)] dark:hover:bg-violet-500/30 transition"
                >
                  <Printer size={13} /> Print Brief
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-1.5 rounded-lg bg-[rgba(255,255,255,0.5)] hover:bg-white dark:bg-white/5 dark:hover:bg-white/10 text-[#6B6E85] hover:text-[#1B1D2A] dark:text-gray-400 dark:hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[rgba(255,255,255,0.5)] dark:bg-black/40 p-3 rounded-xl border border-white/90 dark:border-white/5">
                <div>
                  <span className="text-[#6B6E85] dark:text-gray-500 block">Customer</span>
                  <strong className="text-[#1B1D2A] dark:text-white">{capsule.customerName}</strong>
                </div>
                <div>
                  <span className="text-[#6B6E85] dark:text-gray-500 block">Tier / Value</span>
                  <strong className="text-[#6D4AEB] dark:text-purple-300">{capsule.customerTier} ({ltvDisplay})</strong>
                </div>
                <div>
                  <span className="text-[#6B6E85] dark:text-gray-500 block">SLA Priority</span>
                  <strong className="text-[#E11D48] dark:text-rose-400">{capsule.urgency} Urgency</strong>
                </div>
                <div>
                  <span className="text-[#6B6E85] dark:text-gray-500 block">Root-Cause Confidence</span>
                  <strong className="text-[#0E9C74] dark:text-emerald-400">{Math.round(capsule.confidence * 100)}%</strong>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[#6B6E85] dark:text-gray-300 uppercase tracking-wider text-[11px] mb-1">
                  Customer Incident Message
                </h4>
                <p className="text-[#1B1D2A] dark:text-gray-200 bg-[rgba(255,255,255,0.5)] dark:bg-white/5 p-2.5 rounded-lg border border-white/90 dark:border-white/5 italic">
                  &ldquo;{capsule.originalMessage}&rdquo;
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#6B6E85] dark:text-gray-300 uppercase tracking-wider text-[11px] mb-1">
                  Corroborated Systemic Root Cause
                </h4>
                <p className="text-[#1B1D2A] dark:text-gray-200 bg-[rgba(255,255,255,0.5)] dark:bg-white/5 p-2.5 rounded-lg border border-white/90 dark:border-white/5">
                  {capsule.rootCause}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#6B6E85] dark:text-gray-300 uppercase tracking-wider text-[11px] mb-1">
                  Pre-Escalation Automated Checks
                </h4>
                <ul className="space-y-1 list-disc list-inside text-[#1B1D2A] dark:text-gray-300 bg-[rgba(255,255,255,0.5)] dark:bg-white/5 p-2.5 rounded-lg border border-white/90 dark:border-white/5">
                  {capsule.attemptedActions.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-[rgba(109,74,235,0.06)] dark:bg-violet-500/10 border border-[rgba(109,74,235,0.25)] dark:border-violet-500/30 rounded-xl p-3">
                <h4 className="font-bold text-[#6D4AEB] dark:text-violet-300 uppercase tracking-wider text-[11px] mb-0.5">
                  Remediation Protocol
                </h4>
                <p className="text-[#1B1D2A] dark:text-violet-100">{capsule.recommendedAction}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-[rgba(109,74,235,0.1)] dark:border-white/10 flex justify-end">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.7)] dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 border border-white/90 dark:border-transparent text-[#1B1D2A] dark:text-white text-xs font-semibold"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
