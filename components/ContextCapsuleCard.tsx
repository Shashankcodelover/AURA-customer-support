'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContextCapsule } from '@/lib/types';
import {
  AlertTriangle,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import CapsuleHeader from './capsule/CapsuleHeader';
import CapsuleSentimentArc from './capsule/CapsuleSentimentArc';
import CapsuleReportModal from './capsule/CapsuleReportModal';

const URGENCY_STYLES: Record<string, { badge: string; border: string; glow: string }> = {
  High: {
    badge: 'bg-[color-mix(in_srgb,var(--rose)_8%,transparent)] text-[#E11D48] border-[color-mix(in_srgb,var(--rose)_20%,transparent)] dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30',
    border: 'border-[color-mix(in_srgb,var(--rose)_20%,transparent)] hover:border-[color-mix(in_srgb,var(--rose)_40%,transparent)] dark:border-rose-500/30 dark:hover:border-rose-500/50',
    glow: 'from-[color-mix(in_srgb,var(--rose)_4%,transparent)] via-transparent to-transparent dark:from-rose-500/10 dark:via-transparent dark:to-transparent',
  },
  Medium: {
    badge: 'bg-[color-mix(in_srgb,var(--amber)_8%,transparent)] text-[#C97A00] border-[color-mix(in_srgb,var(--amber)_20%,transparent)] dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
    border: 'border-[color-mix(in_srgb,var(--amber)_20%,transparent)] hover:border-[color-mix(in_srgb,var(--amber)_40%,transparent)] dark:border-amber-500/30 dark:hover:border-amber-500/50',
    glow: 'from-[color-mix(in_srgb,var(--amber)_4%,transparent)] via-transparent to-transparent dark:from-amber-500/10 dark:via-transparent dark:to-transparent',
  },
  Low: {
    badge: 'bg-[color-mix(in_srgb,var(--mint)_8%,transparent)] text-[#0E9C74] border-[color-mix(in_srgb,var(--mint)_20%,transparent)] dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
    border: 'border-[color-mix(in_srgb,var(--mint)_20%,transparent)] hover:border-[color-mix(in_srgb,var(--mint)_40%,transparent)] dark:border-emerald-500/30 dark:hover:border-emerald-500/50',
    glow: 'from-[color-mix(in_srgb,var(--mint)_4%,transparent)] via-transparent to-transparent dark:from-emerald-500/10 dark:via-transparent dark:to-transparent',
  },
};

const TIER_BADGES: Record<string, string> = {
  Enterprise: 'bg-[color-mix(in_srgb,var(--violet)_8%,transparent)] text-[#6D4AEB] border-[color-mix(in_srgb,var(--violet)_25%,transparent)] dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/40 shadow-[0_0_12px_color-mix(in_srgb,var(--violet)_10%,transparent)] dark:shadow-[0_0_12px_rgba(168,85,247,0.2)]',
  Pro: 'bg-[color-mix(in_srgb,var(--mint)_8%,transparent)] text-[#0E9C74] border-[color-mix(in_srgb,var(--mint)_25%,transparent)] dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40 shadow-[0_0_12px_color-mix(in_srgb,var(--mint)_10%,transparent)] dark:shadow-[0_0_12px_rgba(16,185,129,0.2)]',
  Free: 'bg-[rgba(107,110,133,0.08)] text-slate-700 dark:text-slate-300 border-[rgba(107,110,133,0.2)] dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/30',
};

export default function ContextCapsuleCard({
  capsule,
  onResolve,
  onDelete,
}: {
  capsule: ContextCapsule;
  onResolve: (id: string, note: string) => void;
  onDelete?: (id: string) => void;
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
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className={`glass-card p-5 space-y-5 relative overflow-hidden border transition-all duration-300 bg-gradient-to-b ${urgencyConfig.glow} ${urgencyConfig.border}`}
      >
        <CapsuleHeader
          capsule={capsule}
          urgencyConfig={urgencyConfig}
          tierClass={tierClass}
          onShowReport={() => setShowReportModal(true)}
          onCopyPayload={handleCopyPayload}
          copied={copied}
          onDelete={onDelete}
        />

        {/* Category, LTV & Time Meta */}
        <div className="flex flex-wrap items-center justify-between text-xs border-y border-[color-mix(in_srgb,var(--violet)_8%,transparent)] dark:border-white/5 py-2.5 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 dark:text-slate-400">Domain:</span>
            <span className="px-2 py-0.5 rounded-md bg-[rgba(255,255,255,0.5)] dark:bg-white/5 border border-white/90 dark:border-white/10 text-[#1B1D2A] dark:text-gray-200 font-medium">
              {capsule.category}
            </span>
            <span className="text-slate-600 dark:text-slate-400">·</span>
            <span className="text-slate-600 dark:text-slate-400">Account Exposure:</span>
            <span className="px-2 py-0.5 rounded-md bg-[color-mix(in_srgb,var(--violet)_6%,transparent)] dark:bg-blue-500/10 border border-[color-mix(in_srgb,var(--violet)_20%,transparent)] dark:border-blue-500/30 text-[#6D4AEB] dark:text-blue-300 font-mono text-[11px]">
              {ltvDisplay}
            </span>
          </div>

          {capsule.createdAt && (
            <span className="font-mono text-slate-600 dark:text-slate-400 dark:text-gray-500 text-[11px]">
              {new Date(capsule.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        <CapsuleSentimentArc sentimentTrend={capsule.sentimentTrend} />

        {/* Root Cause Analysis */}
        <div>
          <p className="text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-300 font-medium mb-1.5">Corroborated Root Cause</p>
          <p className="text-sm text-[#1B1D2A] dark:text-gray-200 leading-relaxed bg-[rgba(255,255,255,0.5)] dark:bg-white/[0.03] border border-white/90 dark:border-white/5 rounded-xl p-3">
            {capsule.rootCause}
          </p>
        </div>

        {/* What AURA Already Executed */}
        <div>
          <p className="text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-300 dark:text-gray-400 font-medium mb-1.5 flex items-center gap-1.5">
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
        <div className="flex items-start gap-2.5 bg-[color-mix(in_srgb,var(--violet)_6%,transparent)] dark:bg-gradient-to-r dark:from-violet-500/10 dark:to-indigo-500/10 border border-[color-mix(in_srgb,var(--violet)_25%,transparent)] dark:border-violet-500/30 rounded-xl p-3.5 shadow-[0_0_15px_color-mix(in_srgb,var(--violet)_5%,transparent)] dark:shadow-[0_0_15px_rgba(139,92,246,0.1)]">
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
            <div className="flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-300 dark:text-gray-400">
              <span>Fast Dispatch Presets:</span>
              <span className="text-[#6D4AEB] dark:text-violet-400">1-click draft</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => applyPreset('Approved full credit adjustment + complimentary 1-month service waiver.')}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-[rgba(255,255,255,0.7)] hover:bg-[color-mix(in_srgb,var(--violet)_10%,transparent)] border border-white/90 hover:border-[color-mix(in_srgb,var(--violet)_30%,transparent)] text-slate-700 dark:text-slate-300 hover:text-[#6D4AEB] dark:bg-white/5 dark:hover:bg-violet-500/15 dark:border-white/10 dark:hover:border-violet-500/30 dark:text-gray-300 dark:hover:text-violet-300 transition focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none"
              >
                💳 Credit Adjustment
              </button>
              <button
                onClick={() =>
                  applyPreset('Expedited overnight carrier replacement dispatched via tier-1 priority queue.')
                }
                className="text-[11px] px-2.5 py-1 rounded-lg bg-[rgba(255,255,255,0.7)] hover:bg-[color-mix(in_srgb,var(--violet)_10%,transparent)] border border-white/90 hover:border-[color-mix(in_srgb,var(--violet)_30%,transparent)] text-slate-700 dark:text-slate-300 hover:text-[#6D4AEB] dark:bg-white/5 dark:hover:bg-violet-500/15 dark:border-white/10 dark:hover:border-violet-500/30 dark:text-gray-300 dark:hover:text-violet-300 transition focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none"
              >
                📦 Expedite Dispatch
              </button>
              <button
                onClick={() =>
                  applyPreset(
                    'Applied 25% annual retention discount and assigned dedicated enterprise account engineer.'
                  )
                }
                className="text-[11px] px-2.5 py-1 rounded-lg bg-[rgba(255,255,255,0.7)] hover:bg-[color-mix(in_srgb,var(--violet)_10%,transparent)] border border-white/90 hover:border-[color-mix(in_srgb,var(--violet)_30%,transparent)] text-slate-700 dark:text-slate-300 hover:text-[#6D4AEB] dark:bg-white/5 dark:hover:bg-violet-500/15 dark:border-white/10 dark:hover:border-violet-500/30 dark:text-gray-300 dark:hover:text-violet-300 transition focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none"
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
            className="w-full py-2.5 rounded-xl bg-[rgba(255,255,255,0.7)] hover:bg-[color-mix(in_srgb,var(--violet)_10%,transparent)] border border-white/90 dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/10 transition focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none text-sm font-semibold text-[#6D4AEB] dark:text-white flex items-center justify-center gap-2 shadow-sm"
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
              className="w-full bg-[rgba(255,255,255,0.7)] dark:bg-black/50 border border-white/90 dark:border-white/10 rounded-xl p-3 text-sm text-[#1B1D2A] dark:text-gray-100 placeholder-[#9599AD] dark:placeholder-gray-500 focus:outline-none focus:border-[#6D4AEB] dark:focus:border-violet-400 resize-none transition focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setResolving(false)}
                className="px-3 py-2 rounded-xl bg-[rgba(255,255,255,0.7)] hover:bg-white border border-white/90 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300 dark:text-gray-400 transition focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={() => onResolve(capsule.id, note || 'Standard enterprise remediation protocol executed.')}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#6EE7C8] via-[#B69CFF] to-[#FFAFD1] hover:opacity-95 text-[#1B1D2A] transition focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none text-xs font-semibold flex items-center justify-center gap-2 shadow-[0_0_15px_color-mix(in_srgb,var(--violet)_20%,transparent)]"
              >
                <CheckCircle2 size={15} /> Confirm Resolution &amp; Synthesize Article
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Printable Executive Incident Report Modal */}
      {showReportModal && (
        <CapsuleReportModal
          capsule={capsule}
          ltvDisplay={ltvDisplay}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </>
  );
}
