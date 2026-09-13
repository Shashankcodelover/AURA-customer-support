'use client';

import { useMemo, useState, ChangeEvent, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAppState } from '@/lib/context/AppStateContext';
import ReasoningTimeline from '@/components/ReasoningTimeline';
import AgentNetworkDiagram from '@/components/AgentNetworkDiagram';
import EvidencePanel from '@/components/EvidencePanel';
import ConfidenceGauge from '@/components/ConfidenceGauge';
import { InvestigationResult, ReasoningStep, ConversationTurn } from '@/lib/types';
import {
  Send,
  Sparkles,
  Paperclip,
  X,
  MessageSquareText,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Bot,
  Copy,
  Check,
  Download,
} from 'lucide-react';
import { playSendSound, playSuccessSound, playAlertSound, playClickSound } from '@/lib/audio/soundEffects';

const SCENARIOS = [
  {
    id: 'duplicate-charge',
    label: '💳 Duplicate Charge',
    category: 'Billing',
    badge: 'Auto-Refund',
    badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    message: 'I was charged twice for my subscription renewal, order ORD-4521! This is unacceptable, please fix it now.',
    expected: 'Auto-resolved with immediate refund',
  },
  {
    id: 'delayed-shipment',
    label: '📦 Delayed Shipment',
    category: 'Logistics',
    badge: 'Carrier Trace',
    badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    message: 'My order ORD-4522 has been stuck in transit for days, where is my keyboard?!',
    expected: 'Escalated to human agent with context capsule',
  },
  {
    id: 'login-issue',
    label: '🔐 Login Loop',
    category: 'Auth / Tech',
    badge: 'Self-Service',
    badgeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    message: "I reset my password but I still can't log in to my account.",
    expected: 'Auto-resolved with session cache instructions',
  },
  {
    id: 'cancel-subscription',
    label: '⚠️ Cancel Enterprise',
    category: 'Churn Risk',
    badge: 'High Value SLA',
    badgeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    message: "I'm extremely frustrated with the constant billing issues, I want to cancel my enterprise subscription immediately.",
    expected: 'Escalated with Churn Risk Capsule ($4,800/yr)',
  },
];

const SUGGESTIONS = [
  'Where is my order ORD-4522?',
  'I see two identical charges on my credit card',
  'Password reset link redirects to error page',
  'Need SLA reimbursement for downtime outage',
];

export default function Home() {
  const { addCapsule, addTicketRecord, pushToast, tickets } = useAppState();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InvestigationResult | null>(null);
  const [showFinal, setShowFinal] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [revealedSteps, setRevealedSteps] = useState<ReasoningStep[]>([]);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [copiedDossier, setCopiedDossier] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const stats = useMemo(() => {
    const total = tickets.length;
    const resolved = tickets.filter((t) => t.status === 'Resolved').length;
    const escalated = tickets.filter((t) => t.status === 'Escalated').length;
    const rate = total ? Math.round((resolved / total) * 100) : 63;
    return { total, resolved, escalated, rate };
  }, [tickets]);

  // Keyboard shortcut '/' to focus input
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  async function runCase(payload: { message?: string; scenarioId?: string; imageDataUrl?: string }) {
    setLoading(true);
    setShowFinal(false);
    setResult(null);
    setRevealedSteps([]);
    try {
      const body = payload.scenarioId ? payload : { ...payload, history: conversation };
      const res = await fetch('/api/investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data: InvestigationResult = await res.json();
      setResult(data);
      if (!payload.scenarioId && payload.message) {
        const now = new Date().toISOString();
        setConversation((prev) => [
          ...prev,
          { role: 'customer', message: payload.message!, timestamp: now },
          { role: 'agent', message: data.resolutionMessage, category: data.category, timestamp: now },
        ]);
      }
    } catch (e) {
      console.error(e);
      pushToast('⚠️ Investigation failed — please try again.', 'warning');
    } finally {
      setLoading(false);
    }
  }

  function handleTimelineComplete(finished: InvestigationResult) {
    setShowFinal(true);
    if (finished.contextCapsule) {
      playAlertSound();
      addCapsule(finished.contextCapsule);
    } else {
      playSuccessSound();
      pushToast('✅ Action executed automatically — resolution sent to customer.', 'success');
    }
    addTicketRecord({
      id: `TCK-${Date.now()}`,
      customerId: finished.contextCapsule ? finished.contextCapsule.customerName : 'session-customer',
      category: finished.category as any,
      subject: finished.rootCause.slice(0, 60),
      status: finished.decision === 'auto-resolve' ? 'Resolved' : 'Escalated',
      date: new Date().toISOString().slice(0, 10),
      sentiment: finished.sentiment as any,
    });
  }

  function resetConversation() {
    playClickSound();
    setConversation([]);
    setResult(null);
    setShowFinal(false);
    setInput('');
    setAttachedImage(null);
    pushToast('🧵 Conversation memory cleared — starting a fresh thread.', 'info');
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    playClickSound();
    const reader = new FileReader();
    reader.onload = () => setAttachedImage(reader.result as string);
    reader.readAsDataURL(file);
    if (!input.trim()) setInput('I attached a screenshot of the error I keep running into.');
  }

  function send() {
    if (!input.trim() && !attachedImage) return;
    playSendSound();
    setActiveScenario(null);
    const outgoing = input || 'Screenshot attached — please investigate.';
    runCase({ message: outgoing, imageDataUrl: attachedImage ?? undefined });
    setInput('');
    setAttachedImage(null);
  }

  function handleCopyDossier() {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopiedDossier(true);
    pushToast('📋 Investigation dossier copied to clipboard', 'info');
    setTimeout(() => setCopiedDossier(false), 2000);
  }

  function handleDownloadDossier() {
    if (!result) return;
    const data = JSON.stringify(result, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura-dossier-${result.category.toLowerCase()}-${Date.now()}.json`;
    a.click();
    pushToast('📥 Downloaded investigation audit JSON', 'success');
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <section className="text-center space-y-4 pt-4 pb-2 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300">
          <Sparkles size={13} />
          <span>AUTONOMOUS MULTI-AGENT RESOLUTION ENGINE</span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
          Support that <span className="gradient-text">investigates</span>, not just replies.
        </h1>

        <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
          AURA coordinates specialized agent nodes across billing, logistics, auth, and knowledge bases to uncover systemic
          root causes in under 2 seconds.
        </p>
      </section>

      {/* System Pulse Banner */}
      <div className="glass-card p-4 grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-white/5">
        <div className="flex flex-col items-center justify-center p-2 text-center">
          <span className="text-2xl font-bold font-mono text-white">{stats.total}</span>
          <span className="text-xs text-gray-400 uppercase tracking-wider font-medium mt-0.5">Cases Handled</span>
        </div>
        <div className="flex flex-col items-center justify-center p-2 text-center">
          <span className="text-2xl font-bold font-mono text-emerald-400">{stats.resolved}</span>
          <span className="text-xs text-emerald-400/80 uppercase tracking-wider font-medium mt-0.5">Auto-Resolved</span>
        </div>
        <div className="flex flex-col items-center justify-center p-2 text-center">
          <span className="text-2xl font-bold font-mono text-amber-400">{stats.escalated}</span>
          <span className="text-xs text-amber-400/80 uppercase tracking-wider font-medium mt-0.5">Escalated w/ Capsule</span>
        </div>
        <div className="flex flex-col items-center justify-center p-2 text-center">
          <span className="text-2xl font-bold font-mono text-cyan-400">{stats.rate}%</span>
          <span className="text-xs text-cyan-400/80 uppercase tracking-wider font-medium mt-0.5">Auto-Resolve Rate</span>
        </div>
      </div>

      {/* Scenario Launchpad */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-gray-400 px-1">
          <span className="font-semibold uppercase tracking-wider">Sample Test Scenarios (Flagship Demo):</span>
          <span className="text-[11px] text-gray-500">Click any card to trigger live multi-agent investigation</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                playClickSound();
                setActiveScenario(s.id);
                setInput(s.message);
                setAttachedImage(null);
                runCase({ scenarioId: s.id });
              }}
              className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between gap-3 transition-all duration-300 relative overflow-hidden ${
                activeScenario === s.id
                  ? 'border-cyan-400 bg-cyan-500/15 shadow-[0_0_20px_rgba(6,182,212,0.3)] scale-[1.02]'
                  : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-sm font-bold text-white">{s.label}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${s.badgeColor}`}>
                    {s.badge}
                  </span>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{s.message}</p>
              </div>

              <div className="text-[10px] text-cyan-300 font-medium flex items-center gap-1">
                <span>{s.expected}</span>
                <ArrowRight size={10} className="shrink-0" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Active Conversation History (if multi-turn) */}
      {conversation.length > 0 && (
        <div className="glass-card p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-400 border-b border-white/5 pb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <MessageSquareText size={14} className="text-cyan-400" />
              Multi-Turn Conversation Memory ({conversation.filter((c) => c.role === 'customer').length} user messages)
            </span>
            <button
              onClick={resetConversation}
              className="flex items-center gap-1 text-gray-400 hover:text-white transition text-xs font-mono"
              title="Clear conversation and start fresh"
            >
              <RotateCcw size={12} /> Clear thread
            </button>
          </div>
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {conversation.map((turn, i) => (
              <div
                key={i}
                className={`text-xs px-3.5 py-2.5 rounded-2xl max-w-[85%] leading-relaxed ${
                  turn.role === 'customer'
                    ? 'bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-500/30 ml-auto text-right text-cyan-100'
                    : 'bg-white/[0.04] border border-white/10 text-gray-200'
                }`}
              >
                {turn.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Intelligent Omnibar / Chat Input */}
      <div className="glass-card p-3.5 space-y-3 focus-within:border-cyan-400/50 focus-within:shadow-[0_0_25px_rgba(6,182,212,0.15)] transition">
        {attachedImage && (
          <div className="relative inline-block ml-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={attachedImage} alt="Attached screenshot" className="h-16 rounded-lg border border-cyan-500/40" />
            <button
              onClick={() => setAttachedImage(null)}
              className="absolute -top-1.5 -right-1.5 bg-black/80 rounded-full p-1 text-white hover:bg-rose-500 transition"
            >
              <X size={10} />
            </button>
          </div>
        )}

        <div className="flex gap-2 items-center">
          <label
            className="p-2 rounded-xl hover:bg-white/10 cursor-pointer text-gray-400 hover:text-white transition shrink-0"
            title="Attach screenshot (multimodal vision analysis)"
          >
            <Paperclip size={18} />
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>

          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type any customer issue or ask AURA to investigate... (Press / to focus)"
            className="flex-1 bg-transparent focus:outline-none text-sm px-2 text-white placeholder-gray-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') send();
            }}
          />

          <button
            onClick={send}
            disabled={loading || (!input.trim() && !attachedImage)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:opacity-90 disabled:opacity-40 text-sm font-semibold flex items-center gap-2 shrink-0 shadow-lg shadow-cyan-500/25 transition"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Investigating</span>
              </span>
            ) : (
              <>
                <Send size={14} /> Send
              </>
            )}
          </button>
        </div>

        {/* Dynamic Suggestion Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-[11px] text-gray-400 border-t border-white/5">
          <span className="text-gray-500 shrink-0">Try asking:</span>
          {SUGGESTIONS.map((sug) => (
            <button
              key={sug}
              onClick={() => {
                playClickSound();
                setInput(sug);
                inputRef.current?.focus();
              }}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-cyan-300 transition whitespace-nowrap border border-white/5"
            >
              &ldquo;{sug}&rdquo;
            </button>
          ))}
        </div>
      </div>

      {/* Live Investigation Pipeline Panel */}
      {(loading || result) && (
        <div className="glass-card p-6 space-y-6 border-cyan-500/30 animate-glow">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Bot size={18} className="text-cyan-400" />
              <span>Autonomous Agent Investigation Stream</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>DAG EXECUTING</span>
            </div>
          </div>

          <AgentNetworkDiagram revealedSteps={revealedSteps} />
          <EvidencePanel revealedSteps={revealedSteps} />

          {result && (
            <ReasoningTimeline
              steps={result.steps}
              onProgress={setRevealedSteps}
              onComplete={() => handleTimelineComplete(result)}
            />
          )}
        </div>
      )}

      {/* Resolution & Context Capsule Showcase Card */}
      {showFinal && result && (
        <div
          className={`glass-card p-6 border-2 animate-fadeIn ${
            result.decision === 'auto-resolve'
              ? 'border-emerald-500/50 bg-emerald-950/20'
              : 'border-amber-500/50 bg-amber-950/20'
          }`}
        >
          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
            <div className="flex items-center gap-4">
              <ConfidenceGauge value={result.confidence} />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                      result.decision === 'auto-resolve'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {result.decision === 'auto-resolve' ? '✔ AUTO-RESOLVED' : '🤝 HUMAN ESCALATION REQUIRED'}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">Category: {result.category}</span>
                </div>
                <h3 className="font-display text-lg font-bold text-white">{result.rootCause}</h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyDossier}
                title="Copy Investigation JSON"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition text-xs flex items-center gap-1"
              >
                {copiedDossier ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>

              <button
                onClick={handleDownloadDossier}
                title="Download Investigation Audit Dossier"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition text-xs flex items-center gap-1"
              >
                <Download size={14} />
              </button>

              {result.decision !== 'auto-resolve' && (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition shrink-0"
                >
                  <span>View Capsule on Dashboard</span>
                  <ArrowRight size={13} />
                </Link>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 text-sm leading-relaxed text-gray-200 bg-black/20 p-3.5 rounded-xl">
            <div className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-1">
              Customer Message Dispatched:
            </div>
            <p className="text-gray-100">{result.resolutionMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
