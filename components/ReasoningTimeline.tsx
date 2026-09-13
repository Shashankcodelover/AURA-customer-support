'use client';

import { useEffect, useState } from 'react';
import { ReasoningStep } from '@/lib/types';
import { Terminal, Cpu, ShieldCheck, Zap } from 'lucide-react';

const AGENT_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  Router: { color: 'text-cyan-300', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  Billing: { color: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  Technical: { color: 'text-fuchsia-300', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/30' },
  Order: { color: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  Account: { color: 'text-violet-300', bg: 'bg-violet-500/10', border: 'border-violet-500/30' },
  Reasoning: { color: 'text-blue-300', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  Escalation: { color: 'text-rose-300', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
};

export default function ReasoningTimeline({
  steps,
  onComplete,
  onProgress,
}: {
  steps: ReasoningStep[];
  onComplete?: () => void;
  onProgress?: (revealedSteps: ReasoningStep[]) => void;
}) {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    setVisible(0);
    onProgress?.([]);
    if (!steps.length) return;

    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setVisible(i);
      onProgress?.(steps.slice(0, i));
      if (i >= steps.length) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 600); // 600ms snappy cadence

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps]);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-xs text-gray-400 border-b border-white/5 pb-2">
        <div className="flex items-center gap-2 font-mono">
          <Terminal size={14} className="text-cyan-400" />
          <span>Chain-of-Thought Stream</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono text-gray-400">
          <span className="flex items-center gap-1 text-cyan-300">
            <Zap size={12} /> 85 tok/s
          </span>
          <span className="text-gray-600">|</span>
          <span className="flex items-center gap-1">
            <Cpu size={12} className="text-violet-400" /> Qwen-Plus
          </span>
        </div>
      </div>

      <div className="space-y-2.5 font-mono text-xs max-h-72 overflow-y-auto pr-1">
        {steps.slice(0, visible).map((s, idx) => {
          const isLast = idx === visible - 1;
          const conf = AGENT_CONFIG[s.agent] || { color: 'text-gray-300', bg: 'bg-white/5', border: 'border-white/10' };
          const timestampOffset = `+${(idx * 0.22).toFixed(2)}s`;

          return (
            <div
              key={idx}
              className={`flex gap-3 items-start p-2.5 rounded-xl border transition-all duration-300 animate-fadeIn ${
                isLast
                  ? 'border-cyan-400/40 bg-gradient-to-r from-cyan-500/10 to-transparent shadow-sm shadow-cyan-500/10'
                  : 'border-white/5 bg-black/20'
              }`}
            >
              <div className="flex flex-col items-center shrink-0 pt-0.5">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isLast ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400/80'
                  }`}
                />
                <span className="text-[10px] text-gray-500 mt-1 font-mono">{timestampOffset}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${conf.bg} ${conf.color} ${conf.border}`}
                  >
                    {s.agent}
                  </span>
                </div>
                <p className="text-gray-200 leading-relaxed break-words">{s.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
