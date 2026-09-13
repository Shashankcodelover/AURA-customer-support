'use client';

import { useState } from 'react';
import { ReasoningStep } from '@/lib/types';
import { User, Package, History, BookOpen, CheckCircle2, Loader2, ChevronDown, ChevronUp, Database } from 'lucide-react';

interface SourceDef {
  key: string;
  label: string;
  icon: any;
  match: (text: string) => boolean;
  extractSnippet: (text: string) => string;
}

const SOURCES: SourceDef[] = [
  {
    key: 'customer',
    label: 'Customer Profile',
    icon: User,
    match: (t) => t.includes('matched customer profile'),
    extractSnippet: (t) => {
      const match = t.match(/matched customer profile:\s*([^.]+)/i);
      return match ? match[1].trim() : 'Customer metadata verified';
    },
  },
  {
    key: 'order',
    label: 'Order Records',
    icon: Package,
    match: (t) => t.includes('order records') || t.includes('billing ledger') || t.includes('ord-'),
    extractSnippet: (t) => {
      const match = t.match(/(ord-\d+[^.]+)/i);
      return match ? match[1].trim() : 'Order ledger ledger confirmed';
    },
  },
  {
    key: 'ticket',
    label: 'Ticket History',
    icon: History,
    match: (t) => t.includes('ticket history') || t.includes('prior related ticket') || t.includes('open ticket'),
    extractSnippet: (t) => {
      const match = t.match(/(\d+\s*prior[^.]+|\d+\s*open ticket[^.]+)/i);
      return match ? match[1].trim() : 'Historical precedents referenced';
    },
  },
  {
    key: 'kb',
    label: 'Knowledge Base',
    icon: BookOpen,
    match: (t) => t.includes('knowledge base') || t.includes('retrieved relevant'),
    extractSnippet: (t) => {
      const match = t.match(/article:\s*([^.]+)/i);
      return match ? match[1].replace(/["']/g, '').trim() : 'Enterprise SOP & policy matched';
    },
  },
];

export default function EvidencePanel({ revealedSteps }: { revealedSteps: ReasoningStep[] }) {
  const [expanded, setExpanded] = useState(false);
  const combinedText = revealedSteps.map((s) => s.text).join(' | ');

  const activeMatches = SOURCES.filter(s => s.match(combinedText.toLowerCase()));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-gray-400 px-1">
        <span className="flex items-center gap-1.5 font-medium">
          <Database size={13} className="text-cyan-400" />
          Cross-Source Evidence Corroboration ({activeMatches.length}/{SOURCES.length} sources confirmed)
        </span>
        {activeMatches.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {expanded ? 'Collapse Dossier' : 'Inspect Evidence'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {SOURCES.map((source) => {
          const isFound = source.match(combinedText.toLowerCase());
          const snippet = isFound ? source.extractSnippet(combinedText) : null;
          const Icon = source.icon;

          return (
            <div
              key={source.key}
              className={`flex flex-col p-3 rounded-xl border transition-all duration-300 ${
                isFound
                  ? 'border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 to-cyan-500/5 text-emerald-100 shadow-sm shadow-emerald-500/10'
                  : 'border-white/10 bg-white/[0.02] text-gray-500'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 font-medium text-xs">
                  <Icon size={14} className={isFound ? 'text-emerald-400' : 'text-gray-500'} />
                  <span className={isFound ? 'text-white' : 'text-gray-400'}>{source.label}</span>
                </div>
                {isFound ? (
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                ) : (
                  <Loader2 size={13} className="text-gray-600 animate-spin shrink-0" />
                )}
              </div>

              <div className="text-[11px] leading-tight text-gray-400 mt-0.5">
                {isFound ? (
                  <span className="text-emerald-300 font-mono font-medium truncate block" title={snippet || ''}>
                    {snippet}
                  </span>
                ) : (
                  <span className="text-gray-600">Pending query...</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded Dossier Drawer */}
      {expanded && activeMatches.length > 0 && (
        <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-[#090e1a] text-xs font-mono text-gray-300 space-y-2 animate-fadeIn">
          <div className="text-gray-400 uppercase tracking-wider text-[10px] font-bold border-b border-white/5 pb-1">
            Corroborated Telemetry Proofs
          </div>
          {revealedSteps
            .filter(s => s.agent === 'Billing' || s.agent === 'Order' || s.agent === 'Technical' || s.agent === 'Account')
            .map((s, idx) => (
              <div key={idx} className="flex gap-2 items-start text-[11px]">
                <span className="text-cyan-400 shrink-0">[{s.agent}]</span>
                <span className="text-gray-300">{s.text}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
