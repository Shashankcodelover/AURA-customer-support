'use client';

import { useMemo, useState, ChangeEvent } from 'react';
import { useAppState } from '@/lib/context/AppStateContext';
import ReasoningTimeline from '@/components/ReasoningTimeline';
import AgentNetworkDiagram from '@/components/AgentNetworkDiagram';
import EvidencePanel from '@/components/EvidencePanel';
import ConfidenceGauge from '@/components/ConfidenceGauge';
import { InvestigationResult, ReasoningStep, ConversationTurn } from '@/lib/types';
import { Send, Sparkles, Paperclip, X, MessageSquareText, RotateCcw } from 'lucide-react';

const SCENARIOS = [
  {
    id: 'duplicate-charge',
    label: '💳 Duplicate Charge',
    message: 'I was charged twice for my subscription renewal, order ORD-4521! This is unacceptable, please fix it now.',
  },
  {
    id: 'delayed-shipment',
    label: '📦 Delayed Shipment',
    message: 'My order ORD-4522 has been stuck in transit for days, where is my keyboard?!',
  },
  {
    id: 'login-issue',
    label: '🔐 Login Issue',
    message: "I reset my password but I still can't log in to my account.",
  },
  {
    id: 'cancel-subscription',
    label: '⚠️ Cancel Subscription',
    message: "I'm extremely frustrated with the constant billing issues, I want to cancel my enterprise subscription immediately.",
  },
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

  const stats = useMemo(() => {
    const total = tickets.length;
    const resolved = tickets.filter((t) => t.status === 'Resolved').length;
    const escalated = tickets.filter((t) => t.status === 'Escalated').length;
    const rate = total ? Math.round((resolved / total) * 100) : 0;
    return { total, resolved, escalated, rate };
  }, [tickets]);

  async function runCase(payload: { message?: string; scenarioId?: string; imageDataUrl?: string }) {
    setLoading(true);
    setShowFinal(false);
    setResult(null);
    setRevealedSteps([]);
    try {
      // Scenario buttons are deterministic, self-contained demo cases and
      // intentionally don't carry thread history. Free-text messages do —
      // this is the real multi-turn conversation memory feature: the full
      // running thread is sent so the agent can reference earlier turns.
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
      addCapsule(finished.contextCapsule);
    } else {
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
    const reader = new FileReader();
    reader.onload = () => setAttachedImage(reader.result as string);
    reader.readAsDataURL(file);
    if (!input.trim()) setInput('I attached a screenshot of the error I keep running into.');
  }

  function send() {
    if (!input.trim() && !attachedImage) return;
    setActiveScenario(null);
    const outgoing = input || 'Screenshot attached — please investigate.';
    runCase({ message: outgoing, imageDataUrl: attachedImage ?? undefined });
    setInput('');
    setAttachedImage(null);
  }

  return (
    <div className="space-y-8">
      <section className="text-center space-y-3 py-6">
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          Support that <span className="gradient-text">investigates</span>, not just replies.
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Try a sample case below and watch AURA&apos;s specialist agents investigate in real time.
        </p>
      </section>

      {/* System Pulse — live impact stats computed from actual session data */}
      <div className="glass-card px-5 py-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs text-gray-400">
        <span>
          📋 <span className="text-white font-medium">{stats.total}</span> cases handled
        </span>
        <span>
          ✅ <span className="text-emerald-300 font-medium">{stats.resolved}</span> auto-resolved
        </span>
        <span>
          🤝 <span className="text-amber-300 font-medium">{stats.escalated}</span> escalated with context
        </span>
        <span>
          🎯 <span className="text-cyan-300 font-medium">{stats.rate}%</span> auto-resolve rate
        </span>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              setActiveScenario(s.id);
              setInput(s.message);
              setAttachedImage(null);
              runCase({ scenarioId: s.id });
            }}
            className={`px-3 py-2 rounded-xl text-sm border transition ${
              activeScenario === s.id ? 'bg-white/15 border-white/30' : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {conversation.length > 0 && (
        <div className="glass-card p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <MessageSquareText size={14} className="text-cyan-400" />
              Conversation memory — {conversation.filter((c) => c.role === 'customer').length} message(s) in this thread
            </span>
            <button
              onClick={resetConversation}
              className="flex items-center gap-1 hover:text-white transition"
              title="Clear conversation and start fresh"
            >
              <RotateCcw size={12} /> New conversation
            </button>
          </div>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {conversation.map((turn, i) => (
              <div
                key={i}
                className={`text-sm px-3 py-2 rounded-xl max-w-[85%] ${
                  turn.role === 'customer'
                    ? 'bg-white/10 ml-auto text-right'
                    : 'bg-cyan-500/10 border border-cyan-500/20 text-gray-200'
                }`}
              >
                {turn.message}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass-card p-4 space-y-3">
        {attachedImage && (
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={attachedImage} alt="Attached screenshot" className="h-20 rounded-lg border border-white/10" />
            <button
              onClick={() => setAttachedImage(null)}
              className="absolute -top-2 -right-2 bg-black/70 rounded-full p-1 hover:bg-black"
            >
              <X size={12} />
            </button>
          </div>
        )}
        <div className="flex gap-2 items-center">
          <label
            className="p-2 rounded-xl hover:bg-white/10 cursor-pointer text-gray-400 hover:text-white transition shrink-0"
            title="Attach a screenshot"
          >
            <Paperclip size={16} />
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Or type your own support message..."
            className="flex-1 bg-transparent focus:outline-none text-sm px-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') send();
            }}
          />
          <button
            onClick={send}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-sm font-medium flex items-center gap-2 shrink-0"
          >
            <Send size={14} /> Send
          </button>
        </div>
      </div>

      {(loading || result) && (
        <div className="glass-card p-6 space-y-6 animate-glow">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Sparkles size={16} className="text-cyan-400" />
            Live Agent Reasoning
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

      {showFinal && result && (
        <div className="glass-card p-6 flex flex-col sm:flex-row gap-4 sm:items-center animate-fadeIn">
          <ConfidenceGauge value={result.confidence} />
          <div className="space-y-2 flex-1">
            <p className="text-gray-100">{result.resolutionMessage}</p>
            {result.isFollowUp && (
              <span className="inline-block text-xs px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 mr-2">
                🧵 Responded with conversation memory
              </span>
            )}
            {result.decision === 'auto-resolve' ? (
              <span className="inline-block text-xs px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                ✅ Auto-resolved
              </span>
            ) : (
              <span className="inline-block text-xs px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                🤝 Escalated with full Context Capsule — see Agent Dashboard
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
