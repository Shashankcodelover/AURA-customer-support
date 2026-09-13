'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  MessageSquare,
  LayoutDashboard,
  LineChart,
  GitGraph,
  Zap,
  Download,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Command,
  LucideIcon,
  Sun,
  Moon,
} from 'lucide-react';
import { useAppState } from '@/lib/context/AppStateContext';
import {
  isSoundEnabled,
  setSoundEnabled,
  playClickSound,
  playSuccessSound,
} from '@/lib/audio/soundEffects';

interface CommandItem {
  id: string;
  category: 'Navigation' | 'Simulate Scenarios' | 'System Actions';
  label: string;
  sublabel: string;
  icon: LucideIcon;
  action: () => void;
  badge?: string;
}

export default function CommandPalette({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { resetDemo, tickets, capsules, resolvedCapsules, theme, toggleTheme } = useAppState();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
      setQuery('');
    }
  }, [isOpen]);

  const items: CommandItem[] = [
    // Navigation
    {
      id: 'nav-chat',
      category: 'Navigation',
      label: 'Customer Chat Terminal',
      sublabel: 'Interactive customer interface with multi-agent consensus live stream',
      icon: MessageSquare,
      action: () => {
        router.push('/');
        onClose();
      },
    },
    {
      id: 'nav-dashboard',
      category: 'Navigation',
      label: 'Operations & Escalation Command',
      sublabel: 'Review warm Context Capsules, agent triage, and incident briefs',
      icon: LayoutDashboard,
      action: () => {
        router.push('/dashboard');
        onClose();
      },
    },
    {
      id: 'nav-analytics',
      category: 'Navigation',
      label: 'Churn Radar & SLA Telemetry',
      sublabel: '24-Hour incident density heatmap and deflection analytics',
      icon: LineChart,
      action: () => {
        router.push('/analytics');
        onClose();
      },
    },
    {
      id: 'nav-workflow',
      category: 'Navigation',
      label: 'EnterPro Workflow DAG',
      sublabel: 'Orchestration architecture graph with step debugger and speed controls',
      icon: GitGraph,
      action: () => {
        router.push('/workflow');
        onClose();
      },
    },

    // Simulations
    {
      id: 'sim-stripe',
      category: 'Simulate Scenarios',
      label: 'Simulate: Stripe Webhook Card Decline (402)',
      sublabel: 'Dispatch invoice failure with proactive churn risk assessment',
      icon: Zap,
      badge: 'Billing Agent',
      action: () => {
        router.push('/?prompt=Payment%20failed%20for%20invoice%20INV-2024-8842%20due%20to%20card_declined');
        onClose();
      },
    },
    {
      id: 'sim-gdpr',
      category: 'Simulate Scenarios',
      label: 'Simulate: GDPR Article 17 Data Erasure',
      sublabel: 'Enterprise compliance verification and human-in-the-loop escalation',
      icon: Sparkles,
      badge: 'Compliance Agent',
      action: () => {
        router.push('/?prompt=Under%20GDPR%20Article%2017%2C%20I%20demand%20immediate%20deletion%20of%20all%20user%20records');
        onClose();
      },
    },
    {
      id: 'sim-rate-limit',
      category: 'Simulate Scenarios',
      label: 'Simulate: API Gateway 429 Throttle Cascade',
      sublabel: 'High-volume bursting diagnosis and temporary quota backoff response',
      icon: Zap,
      badge: 'Technical Agent',
      action: () => {
        router.push('/?prompt=Production%20microservices%20receiving%20HTTP%20429%20Rate%20Limit%20Exceeded');
        onClose();
      },
    },

    // System Actions
    {
      id: 'act-export',
      category: 'System Actions',
      label: 'Export Complete Telemetry Dossier',
      sublabel: 'Download audit ledger JSON of tickets, active capsules, and resolution traces',
      icon: Download,
      action: () => {
        const data = JSON.stringify({ tickets, capsules, resolvedCapsules }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aura-audit-dossier-${Date.now()}.json`;
        a.click();
        playSuccessSound();
        onClose();
      },
    },
    {
      id: 'act-sound',
      category: 'System Actions',
      label: 'Toggle Cybernetic Audio Synthesizer',
      sublabel: 'Enable or disable offline Web Audio UI micro-feedback',
      icon: isSoundEnabled() ? Volume2 : VolumeX,
      action: () => {
        const next = !isSoundEnabled();
        setSoundEnabled(next);
        if (next) playSuccessSound();
        onClose();
      },
    },
    {
      id: 'act-theme',
      category: 'System Actions',
      label: `Switch to ${theme === 'light' ? 'Cybernetic Dark' : 'Executive Light'} Mode`,
      sublabel: `Toggle between pristine light aesthetic and deep cybernetic obsidian interface`,
      icon: theme === 'light' ? Moon : Sun,
      action: () => {
        toggleTheme();
        playSuccessSound();
        onClose();
      },
    },
    {
      id: 'act-reset',
      category: 'System Actions',
      label: 'Reset Demo State to Clean Baseline',
      sublabel: 'Clear current conversation memory and restore initial seed tickets',
      icon: RotateCcw,
      action: () => {
        resetDemo();
        playSuccessSound();
        onClose();
      },
    },
  ];

  const filtered = items.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.sublabel.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
      playClickSound();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
      playClickSound();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        playClickSound();
        filtered[selectedIndex].action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-[#080d1a] border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-white/[0.02]">
          <Search size={18} className="text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, scenario, or navigate... (e.g. 'Stripe', 'Analytics')"
            className="w-full bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none"
          />
          <kbd className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-gray-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
            ESC
          </kbd>
        </div>

        {/* Command Items List */}
        <div className="overflow-y-auto p-2 space-y-1 divide-y divide-white/5">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              <Command size={28} className="mx-auto text-gray-600 mb-2" />
              No commands matching "{query}"
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    playClickSound();
                    item.action();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-500/20 via-violet-500/10 to-transparent border border-cyan-500/40 text-white shadow-sm'
                      : 'hover:bg-white/[0.04] text-gray-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-300'
                          : 'bg-white/5 text-gray-400'
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white truncate">
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">
                        {item.sublabel}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider hidden sm:inline">
                      {item.category}
                    </span>
                    {isSelected && (
                      <ArrowRight size={13} className="text-cyan-400 animate-pulse" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-black/40 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded font-mono text-[9px] text-gray-400">
                ↑↓
              </kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded font-mono text-[9px] text-gray-400">
                ↵
              </kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded font-mono text-[9px] text-gray-400">
                Esc
              </kbd>
              Close
            </span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400">AURA Omnibar</span>
        </div>
      </div>
    </div>
  );
}
