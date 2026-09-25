'use client';

import { useState } from 'react';
import { Ticket } from '@/lib/types';
import { TrendingUp, AlertCircle, ShieldAlert, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import { useAppState } from '@/lib/context/AppStateContext';

const STOPWORDS = new Set([
  'the', 'a', 'an', 'to', 'for', 'of', 'in', 'on', 'my', 'is', 'was', 'and',
  'with', 'after', 'i', 'about', 'this', 'that', 'it', 'am', 'be', 'as', 'our',
  'we', 'have', 'has', 'not', 'can', 'cannot', 'cant', 'from', 'but', 'by',
]);

export default function TrendingIssues({ tickets }: { tickets: Ticket[] }) {
  const { pushToast } = useAppState();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const freq: Record<string, number> = {};

  tickets.forEach((t) => {
    const words = t.subject
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOPWORDS.has(w));
    words.forEach((w) => {
      freq[w] = (freq[w] || 0) + 1;
    });
  });

  const trending = Object.entries(freq)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Tickets matching the selected tag
  const matchingTickets = selectedTag
    ? tickets.filter((t) => t.subject.toLowerCase().includes(selectedTag))
    : [];

  const handleCreateRule = (tag: string) => {
    pushToast(`🛡️ Created automated routing heuristic for "${tag}" — routed to Priority Triage`, 'success');
  };

  return (
    <div className="glass-card p-5 md:p-4 sm:p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgba(109,74,235,0.08)] dark:border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display font-semibold text-lg text-[#1B1D2A] dark:text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-[#6D4AEB] dark:text-violet-400" />
              Emerging Complaint Signals &amp; Heuristics
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[rgba(109,74,235,0.06)] text-[#6D4AEB] border border-[rgba(109,74,235,0.15)] dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/20">
              NLP Cluster Analyzer
            </span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 dark:text-gray-400">
            Algorithmic detection of repeated terms across active tickets — surface systemic outages and merchant bugs
            before they escalate into public brand risk.
          </p>
        </div>

        {selectedTag && (
          <button
            onClick={() => setSelectedTag(null)}
            className="self-start sm:self-auto text-xs px-2.5 py-1 rounded-full bg-[rgba(255,255,255,0.7)] hover:bg-white text-slate-700 dark:text-slate-300 hover:text-[#1B1D2A] border border-white/90 transition focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none flex items-center gap-1 dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-400 dark:hover:text-white dark:border-white/10"
          >
            Clear filter: <span className="text-[#6D4AEB] dark:text-violet-400 font-mono">#{selectedTag}</span>
          </button>
        )}
      </div>

      {trending.length === 0 ? (
        <div className="p-8 text-center text-slate-700 dark:text-slate-300 dark:text-gray-400 text-xs border border-dashed border-[rgba(109,74,235,0.15)] dark:border-white/10 rounded-xl">
          <p>No high-frequency repeated terms detected yet in the current ticket window.</p>
          <p className="text-slate-600 dark:text-slate-400 dark:text-gray-500 mt-1">Run scenarios on the Customer Chat page to simulate incoming ticket volume.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2.5">
            {trending.map(([word, count], idx) => {
              const isSelected = selectedTag === word;
              const isHighSurge = count >= 3 || idx < 2;

              return (
                <div
                  key={word}
                  onClick={() => setSelectedTag(isSelected ? null : word)}
                  className={`group relative px-3.5 py-2 rounded-xl text-xs border transition focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[rgba(109,74,235,0.1)] border-[rgba(109,74,235,0.35)] text-[#6D4AEB] shadow-[0_0_15px_rgba(109,74,235,0.15)] dark:bg-violet-500/20 dark:border-violet-500/50 dark:text-violet-200'
                      : isHighSurge
                      ? 'bg-[rgba(201,122,0,0.06)] border-[rgba(201,122,0,0.2)] text-[#C97A00] hover:bg-[rgba(201,122,0,0.12)] dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-200 dark:hover:bg-amber-500/20'
                      : 'bg-[rgba(255,255,255,0.7)] border-white/90 text-slate-700 dark:text-slate-300 hover:bg-white dark:bg-white/5 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10'
                  }`}
                >
                  <span className="font-medium">#{word}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                      isHighSurge ? 'bg-[rgba(201,122,0,0.1)] text-[#C97A00] dark:bg-amber-500/20 dark:text-amber-300' : 'bg-[rgba(255,255,255,0.5)] text-slate-600 dark:text-slate-400 dark:bg-white/10 dark:text-gray-400'
                    }`}
                  >
                    {count}x
                  </span>
                  {isHighSurge && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C97A00] dark:bg-amber-400 animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Detailed View if Tag Clicked */}
          {selectedTag && (
            <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.5)] dark:bg-black/40 border border-[rgba(109,74,235,0.2)] dark:border-violet-500/30 animate-fadeIn space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-[#6D4AEB] dark:text-violet-400" />
                  <span className="text-xs font-semibold text-[#1B1D2A] dark:text-white">
                    Tickets Correlated with <span className="text-[#6D4AEB] dark:text-violet-400">#{selectedTag}</span> ({matchingTickets.length})
                  </span>
                </div>
                <button
                  onClick={() => handleCreateRule(selectedTag)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-[rgba(109,74,235,0.08)] hover:bg-[rgba(109,74,235,0.15)] border border-[rgba(109,74,235,0.25)] text-[#6D4AEB] transition focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none flex items-center gap-1.5 dark:bg-violet-500/15 dark:hover:bg-violet-500/25 dark:border-violet-500/30 dark:text-violet-300"
                >
                  <ShieldAlert size={12} /> Auto-Route Inbound
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {matchingTickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-2.5 rounded-lg bg-[rgba(255,255,255,0.5)] dark:bg-white/5 border border-white/90 dark:border-white/5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <p className="text-[#1B1D2A] dark:text-gray-200 font-medium">{t.subject}</p>
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 dark:text-gray-500 font-mono">
                        Ticket: {t.id} · Customer: {t.customerId}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                        t.sentiment === 'Negative'
                          ? 'bg-[rgba(225,29,72,0.1)] text-[#E11D48] border-[rgba(225,29,72,0.3)] dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30'
                          : 'bg-[rgba(255,255,255,0.7)] text-slate-700 dark:text-slate-300 border-white/90 dark:bg-slate-500/15 dark:text-slate-300 dark:border-slate-500/30'
                      }`}
                    >
                      {t.sentiment}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
