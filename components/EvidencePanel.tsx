'use client';

import { ReasoningStep } from '@/lib/types';
import { User, Package, History, BookOpen, CheckCircle2, Loader2 } from 'lucide-react';

interface SourceDef {
  key: string;
  label: string;
  icon: any;
  match: (text: string) => boolean;
}

const SOURCES: SourceDef[] = [
  { key: 'customer', label: 'Customer Profile', icon: User, match: (t) => t.includes('matched customer profile') },
  {
    key: 'order',
    label: 'Order Records',
    icon: Package,
    match: (t) => t.includes('order records') || t.includes('billing ledger'),
  },
  { key: 'ticket', label: 'Ticket History', icon: History, match: (t) => t.includes('ticket history') },
  { key: 'kb', label: 'Knowledge Base', icon: BookOpen, match: (t) => t.includes('knowledge base') },
];

export default function EvidencePanel({ revealedSteps }: { revealedSteps: ReasoningStep[] }) {
  const combinedText = revealedSteps.map((s) => s.text.toLowerCase()).join(' | ');

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {SOURCES.map((source) => {
        const found = source.match(combinedText);
        const Icon = source.icon;
        return (
          <div
            key={source.key}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs transition ${
              found
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                : 'border-white/10 bg-white/5 text-gray-500'
            }`}
          >
            <Icon size={14} className="shrink-0" />
            <span className="flex-1">{source.label}</span>
            {found ? (
              <CheckCircle2 size={14} className="shrink-0" />
            ) : (
              <Loader2 size={14} className="shrink-0 opacity-40" />
            )}
          </div>
        );
      })}
    </div>
  );
}
