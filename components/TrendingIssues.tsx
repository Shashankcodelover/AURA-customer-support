'use client';

import { Ticket } from '@/lib/types';
import { TrendingUp } from 'lucide-react';

const STOPWORDS = new Set([
  'the', 'a', 'an', 'to', 'for', 'of', 'in', 'on', 'my', 'is', 'was', 'and',
  'with', 'after', 'i', 'about', 'this', 'that', 'it', 'am', 'be', 'as',
]);

export default function TrendingIssues({ tickets }: { tickets: Ticket[] }) {
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
    .slice(0, 8);

  return (
    <div className="glass-card p-5">
      <h3 className="font-display font-semibold mb-1 flex items-center gap-2">
        <TrendingUp size={16} className="text-cyan-400" /> Emerging Complaint Signals
      </h3>
      <p className="text-xs text-gray-500 mb-4">Terms appearing across multiple tickets — potential systemic issues before they trend.</p>

      {trending.length === 0 ? (
        <p className="text-sm text-gray-500">No repeated terms detected yet — generate a few more cases to see patterns emerge.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {trending.map(([word, count]) => (
            <span
              key={word}
              className="px-3 py-1.5 rounded-full text-xs border border-amber-500/30 bg-amber-500/10 text-amber-200"
              style={{ fontSize: `${11 + Math.min(count, 5)}px` }}
            >
              {word} · {count}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
