import { ArrowRight } from 'lucide-react';

export function sentimentEmoji(v: number) {
  if (v <= -0.4) return { emoji: '😠', label: 'Frustrated', color: 'text-[#E11D48] dark:text-rose-400' };
  if (v <= 0) return { emoji: '😐', label: 'Neutral', color: 'text-[#C97A00] dark:text-amber-400' };
  return { emoji: '🙂', label: 'Satisfied', color: 'text-[#0E9C74] dark:text-emerald-400' };
}

interface CapsuleSentimentArcProps {
  sentimentTrend: number[];
}

export default function CapsuleSentimentArc({ sentimentTrend }: CapsuleSentimentArcProps) {
  return (
    <div className="bg-[rgba(255,255,255,0.5)] dark:bg-black/30 rounded-xl p-3 border border-white/90 dark:border-white/5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-300 dark:text-gray-400 font-medium">Sentiment Progression Arc</p>
        <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 dark:text-gray-500">Turn-by-turn trajectory</span>
      </div>
      <div className="flex items-center gap-2">
        {sentimentTrend.map((v, i) => {
          const info = sentimentEmoji(v);
          const isLast = i === sentimentTrend.length - 1;
          return (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-all ${
                  isLast
                    ? 'bg-[color-mix(in_srgb,var(--rose)_8%,transparent)] dark:bg-rose-500/20 border-[color-mix(in_srgb,var(--rose)_20%,transparent)] dark:border-rose-500/40 text-[#E11D48] dark:text-rose-300 shadow-[0_0_10px_color-mix(in_srgb,var(--rose)_15%,transparent)] dark:shadow-[0_0_10px_rgba(244,63,94,0.15)]'
                    : 'bg-[rgba(255,255,255,0.7)] dark:bg-white/5 border-white/90 dark:border-white/10 text-slate-700 dark:text-slate-300 dark:text-gray-400'
                }`}
              >
                <span className="text-base">{info.emoji}</span>
                <span className="font-mono text-[11px]">{v > 0 ? `+${v.toFixed(1)}` : v.toFixed(1)}</span>
              </div>
              {i < sentimentTrend.length - 1 && (
                <ArrowRight size={12} className="text-slate-600 dark:text-slate-400 dark:text-gray-600 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
