'use client';

import { useEffect, useState } from 'react';
import { ReasoningStep } from '@/lib/types';

const AGENT_COLOR: Record<string, string> = {
  Router: 'text-cyan-400',
  Billing: 'text-amber-400',
  Technical: 'text-fuchsia-400',
  Order: 'text-emerald-400',
  Account: 'text-violet-400',
  Escalation: 'text-rose-400',
  Reasoning: 'text-blue-400',
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
    }, 750);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps]);

  return (
    <div className="space-y-3 font-mono text-sm">
      {steps.slice(0, visible).map((s, idx) => {
        const isLast = idx === visible - 1;
        return (
          <div key={idx} className="flex gap-3 items-start animate-fadeIn">
            <span
              className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${isLast ? 'animate-pulse bg-cyan-400' : 'bg-gray-600'}`}
            />
            <div>
              <span className={`text-xs font-semibold uppercase tracking-wide mr-2 ${AGENT_COLOR[s.agent] ?? 'text-gray-400'}`}>
                [{s.agent}]
              </span>
              <span className="text-gray-200">{s.text}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
