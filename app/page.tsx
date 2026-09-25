'use client';

import { useMemo, useState, ChangeEvent, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
  Sliders,
  Wrench,
} from 'lucide-react';
import { playSendSound, playSuccessSound, playAlertSound, playClickSound } from '@/lib/audio/soundEffects';

const SCENARIOS = [
  {
    id: 'duplicate-charge',
    label: '💳 Duplicate Charge',
    category: 'Billing',
    badge: 'Auto-Refund',
    badgeColor: 'bg-[rgba(14,156,116,0.1)] text-[#0E9C74] border-[rgba(14,156,116,0.2)] dark:bg-[rgba(14,156,116,0.15)] dark:border-[rgba(14,156,116,0.3)] dark:text-emerald-300',
    message: 'I was charged twice for my subscription renewal, order ORD-4521! This is unacceptable, please fix it now.',
    expected: 'Auto-resolved with immediate refund',
  },
  {
    id: 'delayed-shipment',
    label: '📦 Delayed Shipment',
    category: 'Logistics',
    badge: 'Carrier Trace',
    badgeColor: 'bg-[rgba(201,122,0,0.1)] text-[#C97A00] border-[rgba(201,122,0,0.2)] dark:bg-[rgba(201,122,0,0.15)] dark:border-[rgba(201,122,0,0.3)] dark:text-amber-300',
    message: 'My order ORD-4522 has been stuck in transit for days, where is my keyboard?!',
    expected: 'Escalated to human agent with context capsule',
  },
  {
    id: 'login-issue',
    label: '🔐 Login Loop',
    category: 'Auth / Tech',
    badge: 'Self-Service',
    badgeColor: 'bg-[rgba(109,74,235,0.1)] text-[#6D4AEB] border-[rgba(109,74,235,0.2)] dark:bg-[rgba(109,74,235,0.15)] dark:border-[rgba(109,74,235,0.3)] dark:text-violet-300',
    message: "I reset my password but I still can't log in to my account.",
    expected: 'Auto-resolved with session cache instructions',
  },
  {
    id: 'cancel-subscription',
    label: '⚠️ Cancel Enterprise',
    category: 'Churn Risk',
    badge: 'High Value SLA',
    badgeColor: 'bg-[rgba(225,29,72,0.1)] text-[#E11D48] border-[rgba(225,29,72,0.2)] dark:bg-[rgba(225,29,72,0.15)] dark:border-[rgba(225,29,72,0.3)] dark:text-rose-300',
    message: "I'm extremely frustrated with the constant billing issues, I want to cancel my enterprise subscription immediately.",
    expected: 'Escalated with Churn Risk Capsule ($4,800/yr)',
  },
  {
    id: 'api-rate-limit',
    label: '⚡ API 429 Throttle',
    category: 'Developer API',
    badge: 'Auto-Burst',
    badgeColor: 'bg-[rgba(109,74,235,0.1)] text-[#6D4AEB] border-[rgba(109,74,235,0.2)] dark:bg-[rgba(109,74,235,0.15)] dark:border-[rgba(109,74,235,0.3)] dark:text-violet-300',
    message: 'Our production microservices are receiving 429 Too Many Requests on the events endpoint! We are on the Enterprise plan and our SLA guarantees 10,000 req/min.',
    expected: 'Auto-resolved with dynamic token tier upgrade',
  },
  {
    id: 'gdpr-erasure',
    label: '🛡️ GDPR Erasure',
    category: 'Compliance',
    badge: 'Legal Review',
    badgeColor: 'bg-[rgba(225,29,72,0.1)] text-[#E11D48] border-[rgba(225,29,72,0.2)] dark:bg-[rgba(225,29,72,0.15)] dark:border-[rgba(225,29,72,0.3)] dark:text-rose-300',
    message: 'Pursuant to Article 17 of GDPR, we request permanent deletion of all telemetry, order history, and account records for workspace WS-8812.',
    expected: 'Escalated with Legal Privacy Capsule',
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
  const [mobileTab, setMobileTab] = useState<'steps' | 'graph' | 'evidence' | 'resolution'>('steps');

  // Custom Scenario Studio State
  const [studioOpen, setStudioOpen] = useState(false);
  const [customCustomer, setCustomCustomer] = useState('Nexus Cloud Systems');
  const [customTier, setCustomTier] = useState<'Enterprise' | 'Pro' | 'Free'>('Enterprise');
  const [customCategory, setCustomCategory] = useState('Billing');
  const [customUrgency, setCustomUrgency] = useState<'High' | 'Medium' | 'Low'>('High');
  const [customMessage, setCustomMessage] = useState(
    'We noticed an unexpected $3,200 invoice charge for unprovisioned cluster instances.'
  );

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
    setMobileTab('steps');
    try {
      if (!payload.scenarioId && payload.message) {
        setConversation((prev) => [
          ...prev,
          { role: 'customer', message: payload.message!, timestamp: new Date().toISOString() },
        ]);
      }
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
    setMobileTab('resolution');
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

  function dispatchStudioScenario() {
    if (!customMessage.trim()) return;
    playSendSound();
    setStudioOpen(false);
    setActiveScenario('custom-studio');
    const fullMsg = `[Customer: ${customCustomer} · Tier: ${customTier} · Priority: ${customUrgency} · Domain: ${customCategory}] ${customMessage}`;
    setInput(customMessage);
    runCase({ message: fullMsg });
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-8 pb-12 bg-[#F6F6FB] dark:bg-[#0B0F1A] min-h-screen"
    >
      {/* Hero Section */}
      <section className="text-center space-y-4 pt-4 pb-2 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[rgba(14,156,116,0.08)] border border-[rgba(14,156,116,0.2)] text-[#0E9C74] dark:bg-[rgba(14,156,116,0.15)] dark:border-[rgba(14,156,116,0.3)] dark:text-emerald-300 text-xs font-bold">
          <Sparkles size={13} />
          <span>AUTONOMOUS MULTI-AGENT RESOLUTION ENGINE</span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight text-[#1B1D2A] dark:text-white">
          Support that <span className="gradient-text">investigates</span>, not just replies.
        </h1>

        <p className="text-slate-700 dark:text-slate-300 dark:text-[#8B8FA3] text-sm sm:text-base leading-relaxed">
          AURA coordinates specialized agent nodes across billing, logistics, auth, and knowledge bases to uncover systemic
          root causes in under 2 seconds.
        </p>

        {/* Live System Capabilities Ticker */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(14,156,116,0.06)] border border-[rgba(14,156,116,0.15)] text-[#0E9C74] dark:bg-[rgba(14,156,116,0.15)] dark:border-[rgba(14,156,116,0.3)] dark:text-emerald-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#0E9C74] animate-pulse" />
            4 Autonomous Nodes Online
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(14,156,116,0.06)] border border-[rgba(14,156,116,0.15)] text-[#0E9C74] dark:bg-[rgba(14,156,116,0.15)] dark:border-[rgba(14,156,116,0.3)] dark:text-emerald-300 text-xs font-semibold">
            <Zap size={12} />
            1.4s Parallel Consensus
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(109,74,235,0.06)] border border-[rgba(109,74,235,0.15)] text-[#6D4AEB] dark:bg-[rgba(109,74,235,0.15)] dark:border-[rgba(109,74,235,0.3)] dark:text-violet-300 text-xs font-semibold">
            <ShieldCheck size={12} />
            Context Capsule Ready
          </span>
        </div>
      </section>

      {/* System Pulse Banner */}
      <div className="glass-card p-4 grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-[rgba(109,74,235,0.08)] dark:divide-white/5">
        <div className="flex flex-col items-center justify-center p-2 text-center">
          <span className="text-2xl font-bold font-mono text-[#1B1D2A] dark:text-white">{stats.total}</span>
          <span className="text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider font-semibold mt-0.5">Cases Handled</span>
        </div>
        <div className="flex flex-col items-center justify-center p-2 text-center">
          <span className="text-2xl font-bold font-mono text-[#0E9C74]">{stats.resolved}</span>
          <span className="text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider font-semibold mt-0.5">Auto-Resolved</span>
        </div>
        <div className="flex flex-col items-center justify-center p-2 text-center">
          <span className="text-2xl font-bold font-mono text-[#C97A00]">{stats.escalated}</span>
          <span className="text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider font-semibold mt-0.5">Escalated w/ Capsule</span>
        </div>
        <div className="flex flex-col items-center justify-center p-2 text-center">
          <span className="text-2xl font-bold font-mono text-[#6D4AEB]">{stats.rate}%</span>
          <span className="text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider font-semibold mt-0.5">Auto-Resolve Rate</span>
        </div>
      </div>

      {/* Scenario Launchpad */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 px-1 flex-wrap gap-2">
          <span className="font-semibold uppercase tracking-wider">Sample Test Scenarios (Flagship Demo):</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                playClickSound();
                setStudioOpen(!studioOpen);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-[10px] text-xs font-medium border transition focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none ${
                studioOpen
                  ? 'bg-[rgba(109,74,235,0.1)] text-[#6D4AEB] border-[rgba(109,74,235,0.2)] shadow-sm'
                  : 'bg-[rgba(255,255,255,0.5)] dark:bg-white/5 hover:bg-[rgba(255,255,255,0.8)] dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 dark:text-gray-300 border-white/90 dark:border-white/10'
              }`}
            >
              <Sliders size={13} className={studioOpen ? 'text-[#6D4AEB]' : 'text-slate-700 dark:text-slate-300'} />
              <span>{studioOpen ? 'Close Scenario Studio' : 'Custom Scenario Studio'}</span>
            </button>
            <span className="text-[11px] text-slate-600 dark:text-slate-400 hidden sm:inline">
              Click any card to trigger live multi-agent investigation
            </span>
          </div>
        </div>

        {/* Custom Scenario Studio Drawer */}
        {studioOpen && (
          <div className="glass-card border border-[rgba(109,74,235,0.25)] p-5 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[rgba(109,74,235,0.08)] dark:border-white/5 pb-2.5">
              <div className="flex items-center gap-2">
                <Wrench size={16} className="text-[#6D4AEB]" />
                <h3 className="font-semibold text-sm text-[#1B1D2A] dark:text-white">Interactive Scenario Studio</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-[10px] bg-[rgba(109,74,235,0.06)] text-[#6D4AEB] border border-[rgba(109,74,235,0.15)]">
                  Custom Heuristic Testbench
                </span>
              </div>
              <button onClick={() => setStudioOpen(false)} className="text-slate-700 dark:text-slate-300 hover:text-[#1B1D2A] dark:hover:text-white text-xs">
                <X size={15} />
              </button>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-700 dark:text-slate-300 mb-1 block">Customer / Organization</label>
                <input
                  type="text"
                  value={customCustomer}
                  onChange={(e) => setCustomCustomer(e.target.value)}
                  className="w-full bg-[rgba(255,255,255,0.5)] border border-white/90 rounded-[10px] px-3 py-2 text-[#1B1D2A] focus:outline-none focus:border-[#6D4AEB] dark:bg-[rgba(0,0,0,0.3)] dark:border-white/10 dark:text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 mb-1 block">Customer SLA Tier</label>
                <select
                  value={customTier}
                  onChange={(e) => setCustomTier(e.target.value as any)}
                  className="w-full bg-[rgba(255,255,255,0.5)] border border-white/90 rounded-[10px] px-3 py-2 text-[#1B1D2A] focus:outline-none focus:border-[#6D4AEB] dark:bg-[rgba(0,0,0,0.3)] dark:border-white/10 dark:text-white text-xs"
                >
                  <option value="Enterprise">Enterprise Tier ($4,800/yr)</option>
                  <option value="Pro">Pro Tier ($29/mo)</option>
                  <option value="Free">Free Tier ($0/mo)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 mb-1 block">Urgency / Routing Heuristic</label>
                <select
                  value={customUrgency}
                  onChange={(e) => setCustomUrgency(e.target.value as any)}
                  className="w-full bg-[rgba(255,255,255,0.5)] border border-white/90 rounded-[10px] px-3 py-2 text-[#1B1D2A] focus:outline-none focus:border-[#6D4AEB] dark:bg-[rgba(0,0,0,0.3)] dark:border-white/10 dark:text-white text-xs"
                >
                  <option value="High">High Urgency (1-hr SLA)</option>
                  <option value="Medium">Medium Urgency (4-hr SLA)</option>
                  <option value="Low">Low Urgency (Standard)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-700 dark:text-slate-300 mb-1 block text-xs">Incident Description / Customer Message</label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={2}
                className="w-full bg-[rgba(255,255,255,0.5)] border border-white/90 rounded-[10px] p-3 text-[#1B1D2A] focus:outline-none focus:border-[#6D4AEB] dark:bg-[rgba(0,0,0,0.3)] dark:border-white/10 dark:text-white text-xs resize-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setStudioOpen(false)}
                className="px-3 py-1.5 rounded-[10px] bg-[rgba(255,255,255,0.5)] dark:bg-white/5 hover:bg-[rgba(255,255,255,0.8)] dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 dark:text-gray-400 hover:text-[#1B1D2A] dark:hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                onClick={dispatchStudioScenario}
                className="px-4 py-1.5 rounded-[10px] bg-gradient-to-r from-[#6EE7C8] via-[#B69CFF] to-[#FFAFD1] hover:opacity-90 text-[#1B1D2A] font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-[#6D4AEB]/20"
              >
                <Zap size={13} /> Dispatch to Multi-Agent DAG
              </button>
            </div>
          </div>
        )}

        <div className="flex overflow-x-auto pb-2.5 snap-x snap-mandatory gap-3.5 sm:grid sm:grid-cols-2 lg:grid-cols-3 -mx-1 px-1">
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
              className={`p-4 rounded-[16px] text-left flex flex-col justify-between gap-3 transition-all duration-200 relative overflow-hidden min-w-[280px] sm:min-w-0 snap-start shrink-0 sm:shrink ${
                activeScenario === s.id
                  ? 'bg-[rgba(255,255,255,0.68)] backdrop-blur-[22px] border-[rgba(109,74,235,0.4)] shadow-[0_8px_30px_rgba(109,74,235,0.15)] ring-2 ring-[rgba(109,74,235,0.15)] dark:bg-[rgba(15,20,35,0.72)] dark:border-white/8 scale-[1.01]'
                  : 'bg-[rgba(255,255,255,0.68)] backdrop-blur-[22px] border border-white/90 shadow-[0_8px_30px_rgba(109,74,235,0.07)] hover:border-[#6D4AEB]/30 dark:bg-[rgba(15,20,35,0.72)] dark:border-white/8 dark:hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-sm font-bold text-[#1B1D2A] dark:text-white">{s.label}</span>
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-[10px] border shrink-0 ${s.badgeColor}`}>
                    {s.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 dark:text-gray-400 line-clamp-2 leading-relaxed">{s.message}</p>
              </div>

              <div className="text-[11px] text-[#6D4AEB] dark:text-[#B69CFF] font-semibold flex items-center gap-1 mt-1">
                <span className="truncate">{s.expected}</span>
                <ArrowRight size={11} className="shrink-0" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Active Conversation History (if multi-turn) */}
      {conversation.length > 0 && (
        <div className="glass-card p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 border-b border-[rgba(109,74,235,0.08)] dark:border-white/5 pb-2">
            <span className="flex items-center gap-1.5 font-medium text-[#1B1D2A] dark:text-gray-300">
              <MessageSquareText size={14} className="text-[#6D4AEB]" />
              Multi-Turn Conversation Memory ({conversation.filter((c) => c.role === 'customer').length} user messages)
            </span>
            <button
              onClick={resetConversation}
              className="flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:text-[#1B1D2A] dark:hover:text-white transition focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none text-xs font-mono"
              title="Clear conversation and start fresh"
            >
              <RotateCcw size={12} /> Clear thread
            </button>
          </div>
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {conversation.map((turn, i) => (
              <div
                key={i}
                className={`text-xs px-3.5 py-2.5 rounded-[16px] max-w-[85%] leading-relaxed ${
                  turn.role === 'customer'
                    ? 'bg-[#6D4AEB] text-white ml-auto text-right dark:bg-[rgba(109,74,235,0.3)] dark:border dark:border-[rgba(109,74,235,0.3)] dark:text-white shadow-sm'
                    : 'bg-[rgba(255,255,255,0.8)] text-[#1B1D2A] border border-white/90 dark:bg-white/[0.04] dark:border dark:border-white/10 dark:text-gray-200'
                }`}
              >
                {turn.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Intelligent Omnibar / Chat Input */}
      <div className="glass-card p-3.5 space-y-3 focus-within:border-[rgba(109,74,235,0.4)] dark:focus-within:border-[rgba(109,74,235,0.5)] focus-within:shadow-[0_8px_30px_rgba(109,74,235,0.12)] transition focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none">
        {attachedImage && (
          <div className="relative inline-block ml-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={attachedImage} alt="Attached screenshot" className="h-16 rounded-[10px] border border-[#6D4AEB]/40" />
            <button
              onClick={() => setAttachedImage(null)}
              className="absolute -top-1.5 -right-1.5 bg-[#1B1D2A]/80 rounded-full p-1 text-white hover:bg-[#E11D48] transition focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none"
            >
              <X size={10} />
            </button>
          </div>
        )}

        <div className="flex gap-2 items-center">
          <label
            className="p-2 rounded-[10px] hover:bg-[rgba(255,255,255,0.8)] dark:hover:bg-white/10 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-[#1B1D2A] dark:text-gray-400 dark:hover:text-white transition focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none shrink-0"
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
            className="flex-1 bg-transparent focus:outline-none text-sm px-2 text-[#1B1D2A] dark:text-white placeholder-[#9599AD] dark:placeholder-gray-500 font-medium"
            onKeyDown={(e) => {
              if (e.key === 'Enter') send();
            }}
          />

          <button
            onClick={send}
            disabled={loading || (!input.trim() && !attachedImage)}
            className="px-5 py-2.5 rounded-[10px] bg-[#1B1D2A] hover:bg-[#2D2F3E] dark:bg-gradient-to-r dark:from-[#6EE7C8] dark:via-[#B69CFF] dark:to-[#FFAFD1] dark:text-[#1B1D2A] dark:hover:opacity-90 disabled:opacity-40 text-sm font-bold text-white flex items-center gap-2 shrink-0 shadow-md transition focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Investigating</span>
              </span>
            ) : (
              <>
                <Send size={14} />
                <span>Send</span>
              </>
            )}
          </button>
        </div>

        {/* Dynamic Suggestion Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-[11px] text-slate-700 dark:text-slate-300 dark:text-gray-400 border-t border-[rgba(109,74,235,0.08)] dark:border-white/5">
          <span className="text-slate-600 dark:text-slate-400 dark:text-gray-500 shrink-0 font-medium">Try asking:</span>
          {SUGGESTIONS.map((sug) => (
            <button
              key={sug}
              onClick={() => {
                playClickSound();
                setInput(sug);
                inputRef.current?.focus();
              }}
              className="px-2.5 py-1 rounded-[10px] bg-[rgba(255,255,255,0.7)] dark:bg-white/5 hover:bg-[rgba(255,255,255,0.9)] dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 dark:text-gray-300 hover:text-[#1B1D2A] dark:hover:text-white transition focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none whitespace-nowrap border border-white/90 dark:border-white/5 font-medium text-[11px]"
            >
              &ldquo;{sug}&rdquo;
            </button>
          ))}
        </div>
      </div>

      {/* Live Investigation Pipeline Panel */}
      {(loading || result) && (
        <div className="glass-card p-4 sm:p-4 sm:p-5 space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between border-b border-[rgba(109,74,235,0.08)] dark:border-white/5 pb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#1B1D2A] dark:text-white">
              <Bot size={18} className="text-[#6D4AEB]" />
              <span>Autonomous Agent Investigation Stream</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#6D4AEB] dark:text-[#B69CFF]">
              <span className="w-2 h-2 rounded-full bg-[#6D4AEB] dark:bg-[#B69CFF] animate-ping" />
              <span>DAG EXECUTING</span>
            </div>
          </div>

          {/* Mobile Adaptive View Switcher (Eliminates Huge Scrolling) */}
          <div className="md:hidden flex items-center bg-[rgba(255,255,255,0.5)] dark:bg-black/40 border border-white/90 dark:border-white/10 rounded-[10px] p-1 text-xs gap-1 overflow-x-auto">
            <button
              onClick={() => setMobileTab('steps')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none whitespace-nowrap text-center ${
                mobileTab === 'steps'
                  ? 'bg-[#1B1D2A] text-white shadow-sm dark:bg-[rgba(109,74,235,0.2)] dark:text-[#B69CFF] dark:border dark:border-[rgba(109,74,235,0.4)]'
                  : 'text-slate-700 dark:text-slate-300 hover:text-[#1B1D2A] dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              🧠 Steps ({revealedSteps.length})
            </button>
            <button
              onClick={() => setMobileTab('graph')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none whitespace-nowrap text-center ${
                mobileTab === 'graph'
                  ? 'bg-[#1B1D2A] text-white shadow-sm dark:bg-[rgba(109,74,235,0.2)] dark:text-[#B69CFF] dark:border dark:border-[rgba(109,74,235,0.4)]'
                  : 'text-slate-700 dark:text-slate-300 hover:text-[#1B1D2A] dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              🕸️ Graph
            </button>
            <button
              onClick={() => setMobileTab('evidence')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none whitespace-nowrap text-center ${
                mobileTab === 'evidence'
                  ? 'bg-[#1B1D2A] text-white shadow-sm dark:bg-[rgba(109,74,235,0.2)] dark:text-[#B69CFF] dark:border dark:border-[rgba(109,74,235,0.4)]'
                  : 'text-slate-700 dark:text-slate-300 hover:text-[#1B1D2A] dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              📑 Evidence
            </button>
            {showFinal && result && (
              <button
                onClick={() => setMobileTab('resolution')}
                className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none whitespace-nowrap text-center ${
                  mobileTab === 'resolution'
                    ? 'bg-[#0E9C74] text-white shadow-sm dark:bg-[rgba(14,156,116,0.2)] dark:text-[#6EE7C8] dark:border dark:border-[rgba(14,156,116,0.4)]'
                    : 'text-[#0E9C74] hover:text-[#0E9C74]/80 dark:text-[#6EE7C8] dark:hover:text-white'
                }`}
              >
                🎯 Solution
              </button>
            )}
          </div>

          {/* Desktop Expansive Cockpit View */}
          <div className="hidden md:block space-y-6">
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

          {/* Mobile Single-Screen Focused View */}
          <div className="md:hidden">
            {mobileTab === 'graph' && <AgentNetworkDiagram revealedSteps={revealedSteps} />}
            {mobileTab === 'evidence' && <EvidencePanel revealedSteps={revealedSteps} />}
            {mobileTab === 'steps' && result && (
              <ReasoningTimeline
                steps={result.steps}
                onProgress={setRevealedSteps}
                onComplete={() => handleTimelineComplete(result)}
              />
            )}
            {mobileTab === 'resolution' && showFinal && result && (
              <div
                className={`p-4 rounded-[16px] border-2 animate-fadeIn space-y-3 ${
                  result.decision === 'auto-resolve'
                    ? 'border-[rgba(14,156,116,0.4)] bg-[rgba(14,156,116,0.05)]'
                    : 'border-[rgba(201,122,0,0.4)] bg-[rgba(201,122,0,0.05)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ConfidenceGauge value={result.confidence} />
                  <div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                        result.decision === 'auto-resolve'
                          ? 'bg-[rgba(14,156,116,0.1)] text-[#0E9C74] border-[#0E9C74]'
                          : 'bg-[rgba(201,122,0,0.1)] text-[#C97A00] border-[#C97A00]'
                      }`}
                    >
                      {result.decision === 'auto-resolve' ? '✔ AUTO-RESOLVED' : '🤝 ESCALATED'}
                    </span>
                    <h3 className="text-sm font-bold text-[#1B1D2A] dark:text-white mt-1">{result.rootCause}</h3>
                  </div>
                </div>
                <div className="text-xs text-[#1B1D2A] dark:text-gray-200 bg-[rgba(255,255,255,0.8)] dark:bg-black/30 p-3 rounded-[10px] leading-relaxed border border-white/90 dark:border-transparent shadow-sm">
                  <div className="text-[10px] uppercase font-bold text-slate-700 dark:text-slate-300 dark:text-gray-400 mb-1">Dispatched Message:</div>
                  <p>{result.resolutionMessage}</p>
                </div>
                {result.decision !== 'auto-resolve' && (
                  <Link
                    href="/dashboard"
                    className="w-full py-2.5 rounded-[10px] bg-[#C97A00] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:bg-[#C97A00]/90 transition focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none"
                  >
                    <span>Inspect Context Capsule on Dashboard</span>
                    <ArrowRight size={13} />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Desktop Resolution & Context Capsule Showcase Card */}
      {showFinal && result && (
        <div
          className={`hidden md:block glass-card p-4 sm:p-5 border-2 animate-fadeIn ${
            result.decision === 'auto-resolve'
              ? 'border-[rgba(14,156,116,0.4)] bg-[rgba(14,156,116,0.05)]'
              : 'border-[rgba(201,122,0,0.4)] bg-[rgba(201,122,0,0.05)]'
          }`}
        >
          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
            <div className="flex items-center gap-4">
              <ConfidenceGauge value={result.confidence} />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-[10px] font-bold uppercase tracking-wider border ${
                      result.decision === 'auto-resolve'
                        ? 'bg-[rgba(14,156,116,0.1)] text-[#0E9C74] border-[#0E9C74]'
                        : 'bg-[rgba(201,122,0,0.1)] text-[#C97A00] border-[#C97A00]'
                    }`}
                  >
                    {result.decision === 'auto-resolve' ? '✔ AUTO-RESOLVED' : '🤝 HUMAN ESCALATION REQUIRED'}
                  </span>
                  <span className="text-xs text-slate-700 dark:text-slate-300 dark:text-gray-400 font-mono font-medium">Category: {result.category}</span>
                </div>
                <h3 className="font-display text-lg font-bold text-[#1B1D2A] dark:text-white">{result.rootCause}</h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyDossier}
                title="Copy Investigation JSON"
                className="p-2 rounded-[10px] bg-[rgba(255,255,255,0.7)] dark:bg-white/5 hover:bg-[rgba(255,255,255,0.9)] dark:hover:bg-white/10 border border-white/90 dark:border-white/10 text-slate-700 dark:text-slate-300 dark:text-gray-300 hover:text-[#1B1D2A] dark:hover:text-white transition focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none text-xs flex items-center gap-1 shadow-sm"
              >
                {copiedDossier ? <Check size={14} className="text-[#0E9C74] dark:text-emerald-400" /> : <Copy size={14} />}
              </button>

              <button
                onClick={handleDownloadDossier}
                title="Download Investigation Audit Dossier"
                className="p-2 rounded-[10px] bg-[rgba(255,255,255,0.7)] dark:bg-white/5 hover:bg-[rgba(255,255,255,0.9)] dark:hover:bg-white/10 border border-white/90 dark:border-white/10 text-slate-700 dark:text-slate-300 dark:text-gray-300 hover:text-[#1B1D2A] dark:hover:text-white transition focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none text-xs flex items-center gap-1 shadow-sm"
              >
                <Download size={14} />
              </button>

              {result.decision !== 'auto-resolve' && (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-[10px] bg-[#C97A00] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#C97A00]/20 hover:bg-[#C97A00]/90 transition focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none shrink-0"
                >
                  <span>View Capsule on Dashboard</span>
                  <ArrowRight size={13} />
                </Link>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[rgba(109,74,235,0.08)] dark:border-white/10 text-sm leading-relaxed text-[#1B1D2A] dark:text-gray-200 bg-[rgba(255,255,255,0.8)] dark:bg-black/20 p-3.5 rounded-[16px] border border-white/90 dark:border-transparent shadow-sm">
            <div className="text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-300 dark:text-gray-400 font-bold mb-1">
              Customer Message Dispatched:
            </div>
            <p className="text-[#1B1D2A] dark:text-gray-100 font-medium">{result.resolutionMessage}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
