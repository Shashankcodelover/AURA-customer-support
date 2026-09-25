'use client';

import { useAppState } from '@/lib/context/AppStateContext';
import { X } from 'lucide-react';

const TONE_STYLES: Record<string, string> = {
  success: 'border-[rgba(14,156,116,0.3)] bg-[rgba(14,156,116,0.06)] text-[#0E9C74] dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100',
  warning: 'border-[rgba(201,122,0,0.3)] bg-[rgba(201,122,0,0.06)] text-[#C97A00] dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100',
  info: 'border-[rgba(109,74,235,0.3)] bg-[rgba(109,74,235,0.06)] text-[#6D4AEB] dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-100',
};

export default function ToastStack() {
  const { toasts, dismissToast } = useAppState();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`glass-card border px-4 py-3 text-sm flex items-start justify-between gap-3 animate-fadeIn ${TONE_STYLES[t.tone]}`}
        >
          <span>{t.message}</span>
          <button onClick={() => dismissToast(t.id)} className="shrink-0 opacity-60 hover:opacity-100 transition focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
