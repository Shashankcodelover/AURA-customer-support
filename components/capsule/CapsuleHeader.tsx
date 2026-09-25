import { ShieldAlert, Sparkles, FileText, Check, Copy, Trash2 } from 'lucide-react';
import ConfidenceGauge from '../ConfidenceGauge';
import { ContextCapsule } from '@/lib/types';

interface CapsuleHeaderProps {
  capsule: ContextCapsule;
  urgencyConfig: { badge: string; border: string; glow: string };
  tierClass: string;
  onShowReport: () => void;
  onCopyPayload: () => void;
  copied: boolean;
  onDelete?: (id: string) => void;
}

export default function CapsuleHeader({
  capsule,
  urgencyConfig,
  tierClass,
  onShowReport,
  onCopyPayload,
  copied,
  onDelete,
}: CapsuleHeaderProps) {
  return (
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
            <span className="text-slate-600 dark:text-slate-400 text-xs">·</span>
            <span className="text-[11px] text-slate-600 dark:text-slate-400 dark:text-gray-400 font-mono">ID: {capsule.id.slice(0, 8)}</span>
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
          onClick={onShowReport}
          title="Generate Executive Incident Brief"
          className="p-1.5 rounded-lg bg-[rgba(255,255,255,0.7)] hover:bg-[color-mix(in_srgb,var(--violet)_10%,transparent)] border border-white/90 hover:border-[color-mix(in_srgb,var(--violet)_30%,transparent)] text-slate-700 dark:text-slate-300 hover:text-[#6D4AEB] dark:bg-white/5 dark:hover:bg-violet-500/20 dark:border-white/10 dark:hover:border-violet-500/40 dark:text-gray-400 dark:hover:text-violet-300 transition focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none text-xs flex items-center gap-1"
        >
          <FileText size={13} />
        </button>

        <button
          onClick={onCopyPayload}
          title="Copy JSON Payload"
          className="p-1.5 rounded-lg bg-[rgba(255,255,255,0.7)] hover:bg-[color-mix(in_srgb,var(--violet)_10%,transparent)] border border-white/90 hover:border-[color-mix(in_srgb,var(--violet)_30%,transparent)] text-slate-700 dark:text-slate-300 hover:text-[#6D4AEB] dark:bg-white/5 dark:hover:bg-violet-500/20 dark:border-white/10 dark:hover:border-violet-500/40 dark:text-gray-400 dark:hover:text-violet-300 transition focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none text-xs flex items-center gap-1"
        >
          {copied ? <Check size={13} className="text-[#0E9C74] dark:text-emerald-400" /> : <Copy size={13} />}
        </button>

        {onDelete && (
          <button
            onClick={() => {
              if (confirm(`Permanently delete Context Capsule for ${capsule.customerName}?`)) {
                onDelete(capsule.id);
              }
            }}
            title="Permanently Delete Capsule"
            className="p-1.5 rounded-lg bg-[rgba(255,255,255,0.7)] hover:bg-[color-mix(in_srgb,var(--rose)_10%,transparent)] border border-white/90 hover:border-[color-mix(in_srgb,var(--rose)_30%,transparent)] text-slate-700 dark:text-slate-300 hover:text-[#E11D48] dark:bg-white/5 dark:hover:bg-rose-500/20 dark:border-white/10 dark:hover:border-rose-500/40 dark:text-gray-400 dark:hover:text-rose-400 transition focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none text-xs flex items-center gap-1"
          >
            <Trash2 size={13} />
          </button>
        )}

        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${urgencyConfig.badge}`}>
          {capsule.urgency} urgency
        </span>
      </div>
    </div>
  );
}
