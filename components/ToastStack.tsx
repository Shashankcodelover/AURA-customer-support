'use client';

import { useAppState } from '@/lib/context/AppStateContext';
import { X } from 'lucide-react';

const TONE_STYLES: Record<string, string> = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-100',
  info: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-100',
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
          <button onClick={() => dismissToast(t.id)} className="shrink-0 opacity-60 hover:opacity-100 transition">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
