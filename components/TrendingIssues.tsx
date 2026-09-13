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
    <div className="glass-card p-5 md:p-6 space-y-5 border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display font-semibold text-lg text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-cyan-400" />
              Emerging Complaint Signals &amp; Heuristics
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              NLP Cluster Analyzer
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Algorithmic detection of repeated terms across active tickets — surface systemic outages and merchant bugs
            before they escalate into public brand risk.
          </p>
        </div>

        {selectedTag && (
          <button
            onClick={() => setSelectedTag(null)}
            className="self-start sm:self-auto text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition flex items-center gap-1"
          >
            Clear filter: <span className="text-cyan-400 font-mono">#{selectedTag}</span>
          </button>
        )}
      </div>

      {trending.length === 0 ? (
        <div className="p-8 text-center text-gray-400 text-xs border border-dashed border-white/10 rounded-xl">
          <p>No high-frequency repeated terms detected yet in the current ticket window.</p>
          <p className="text-gray-500 mt-1">Run scenarios on the Customer Chat page to simulate incoming ticket volume.</p>
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
                  className={`group relative px-3.5 py-2 rounded-xl text-xs border transition cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                      : isHighSurge
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-200 hover:bg-amber-500/20'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <span className="font-medium">#{word}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                      isHighSurge ? 'bg-amber-500/20 text-amber-300' : 'bg-white/10 text-gray-400'
                    }`}
                  >
                    {count}x
                  </span>
                  {isHighSurge && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Detailed View if Tag Clicked */}
          {selectedTag && (
            <div className="p-4 rounded-xl bg-black/40 border border-cyan-500/30 animate-fadeIn space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-cyan-400" />
                  <span className="text-xs font-semibold text-white">
                    Tickets Correlated with <span className="text-cyan-400">#{selectedTag}</span> ({matchingTickets.length})
                  </span>
                </div>
                <button
                  onClick={() => handleCreateRule(selectedTag)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 transition flex items-center gap-1.5"
                >
                  <ShieldAlert size={12} /> Auto-Route Inbound
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {matchingTickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <p className="text-gray-200 font-medium">{t.subject}</p>
                      <span className="text-[11px] text-gray-500 font-mono">
                        Ticket: {t.id} · Customer: {t.customerId}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                        t.sentiment === 'Negative'
                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          : 'bg-slate-500/15 text-slate-300 border-slate-500/30'
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
