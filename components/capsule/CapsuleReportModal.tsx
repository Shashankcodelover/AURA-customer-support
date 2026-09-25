import { FileText, Printer, X } from 'lucide-react';
import { ContextCapsule } from '@/lib/types';

interface CapsuleReportModalProps {
  capsule: ContextCapsule;
  ltvDisplay: string;
  onClose: () => void;
}

export default function CapsuleReportModal({ capsule, ltvDisplay, onClose }: CapsuleReportModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-card p-4 sm:p-5 max-w-2xl w-full bg-white dark:bg-[#0F1424] border-[color-mix(in_srgb,var(--violet)_30%,transparent)] space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[color-mix(in_srgb,var(--violet)_10%,transparent)] dark:border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-[#6D4AEB] dark:text-violet-400" />
            <div>
              <h3 className="font-bold text-[#1B1D2A] dark:text-white text-base">Executive Incident Brief</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 dark:text-gray-400 font-mono">INC-{capsule.id.slice(0, 10).toUpperCase()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl bg-[color-mix(in_srgb,var(--violet)_10%,transparent)] text-[#6D4AEB] border border-[color-mix(in_srgb,var(--violet)_30%,transparent)] dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/40 text-xs font-semibold flex items-center gap-1.5 hover:bg-[color-mix(in_srgb,var(--violet)_20%,transparent)] dark:hover:bg-violet-500/30 transition focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none"
            >
              <Printer size={13} /> Print Brief
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[rgba(255,255,255,0.5)] hover:bg-white dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-[#1B1D2A] dark:text-gray-400 dark:hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[rgba(255,255,255,0.5)] dark:bg-black/40 p-3 rounded-xl border border-white/90 dark:border-white/5">
            <div>
              <span className="text-slate-700 dark:text-slate-300 dark:text-gray-500 block">Customer</span>
              <strong className="text-[#1B1D2A] dark:text-white">{capsule.customerName}</strong>
            </div>
            <div>
              <span className="text-slate-700 dark:text-slate-300 dark:text-gray-500 block">Tier / Value</span>
              <strong className="text-[#6D4AEB] dark:text-blue-300">{capsule.customerTier} ({ltvDisplay})</strong>
            </div>
            <div>
              <span className="text-slate-700 dark:text-slate-300 dark:text-gray-500 block">SLA Priority</span>
              <strong className="text-[#E11D48] dark:text-rose-400">{capsule.urgency} Urgency</strong>
            </div>
            <div>
              <span className="text-slate-700 dark:text-slate-300 dark:text-gray-500 block">Root-Cause Confidence</span>
              <strong className="text-[#0E9C74] dark:text-emerald-400">{Math.round(capsule.confidence * 100)}%</strong>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-700 dark:text-slate-300 dark:text-gray-300 uppercase tracking-wider text-[11px] mb-1">
              Customer Incident Message
            </h4>
            <p className="text-[#1B1D2A] dark:text-gray-200 bg-[rgba(255,255,255,0.5)] dark:bg-white/5 p-2.5 rounded-lg border border-white/90 dark:border-white/5 italic">
              &ldquo;{capsule.originalMessage}&rdquo;
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-700 dark:text-slate-300 dark:text-gray-300 uppercase tracking-wider text-[11px] mb-1">
              Corroborated Systemic Root Cause
            </h4>
            <p className="text-[#1B1D2A] dark:text-gray-200 bg-[rgba(255,255,255,0.5)] dark:bg-white/5 p-2.5 rounded-lg border border-white/90 dark:border-white/5">
              {capsule.rootCause}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-700 dark:text-slate-300 dark:text-gray-300 uppercase tracking-wider text-[11px] mb-1">
              Pre-Escalation Automated Checks
            </h4>
            <ul className="space-y-1 list-disc list-inside text-[#1B1D2A] dark:text-gray-300 bg-[rgba(255,255,255,0.5)] dark:bg-white/5 p-2.5 rounded-lg border border-white/90 dark:border-white/5">
              {capsule.attemptedActions.map((act, i) => (
                <li key={i}>{act}</li>
              ))}
            </ul>
          </div>

          <div className="bg-[color-mix(in_srgb,var(--violet)_6%,transparent)] dark:bg-violet-500/10 border border-[color-mix(in_srgb,var(--violet)_25%,transparent)] dark:border-violet-500/30 rounded-xl p-3">
            <h4 className="font-bold text-[#6D4AEB] dark:text-violet-300 uppercase tracking-wider text-[11px] mb-0.5">
              Remediation Protocol
            </h4>
            <p className="text-[#1B1D2A] dark:text-violet-100">{capsule.recommendedAction}</p>
          </div>
        </div>

        <div className="pt-2 border-t border-[color-mix(in_srgb,var(--violet)_10%,transparent)] dark:border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.7)] dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 border border-white/90 dark:border-transparent text-[#1B1D2A] dark:text-white text-xs font-semibold"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
