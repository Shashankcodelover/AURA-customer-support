'use client';

import { useState, useMemo } from 'react';
import { useAppState } from '@/lib/context/AppStateContext';
import ContextCapsuleCard from '@/components/ContextCapsuleCard';
import {
  ShieldAlert,
  CheckCircle2,
  BookOpen,
  Search,
  Sparkles,
  Zap,
  Filter,
  RefreshCw,
  PlusCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  X,
  Edit3,
} from 'lucide-react';
import { ContextCapsule } from '@/lib/types';

export default function DashboardPage() {
  const { capsules, resolvedCapsules, kbArticles, resolveCapsule, addCapsule, resetDemo, addKbArticle } =
    useAppState();
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'High' | 'Enterprise' | 'Billing'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [kbSearch, setKbSearch] = useState('');
  const [expandedKb, setExpandedKb] = useState<string | null>(null);

  // New Article Authoring State
  const [newArticleModalOpen, setNewArticleModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'Billing' | 'Technical' | 'Order' | 'Account'>('Billing');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');

  const handleCreateArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    addKbArticle({
      id: `kb-manual-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      content: newContent.trim(),
      tags: newTags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
    });
    setNewTitle('');
    setNewContent('');
    setNewTags('');
    setNewArticleModalOpen(false);
  };

  // Filtered capsules
  const filteredCapsules = useMemo(() => {
    return capsules.filter((c) => {
      const matchesSearch =
        c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.rootCause.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedFilter === 'High') return c.urgency === 'High';
      if (selectedFilter === 'Enterprise') return c.customerTier === 'Enterprise';
      if (selectedFilter === 'Billing') return c.category === 'Billing';
      return true;
    });
  }, [capsules, searchQuery, selectedFilter]);

  // Filtered KB articles
  const filteredKb = useMemo(() => {
    return kbArticles.filter(
      (a) =>
        a.title.toLowerCase().includes(kbSearch.toLowerCase()) ||
        a.content.toLowerCase().includes(kbSearch.toLowerCase()) ||
        a.category.toLowerCase().includes(kbSearch.toLowerCase()) ||
        a.tags.some((t) => t.toLowerCase().includes(kbSearch.toLowerCase()))
    );
  }, [kbArticles, kbSearch]);

  const handleSeedDemoCapsule = () => {
    const sampleCapsule: ContextCapsule = {
      id: `capsule-demo-${Date.now()}`,
      customerName: 'AeroDynamics Global Corp',
      customerTier: 'Enterprise',
      category: 'Billing',
      urgency: 'High',
      sentimentTrend: [0.1, -0.3, -0.8],
      rootCause:
        'Automated recurring payment gateway triggered double authorization ($1,840.00 x2) due to webhook timeout during AWS us-east-1 gateway failover.',
      confidence: 0.94,
      attemptedActions: [
        'Queried Stripe telemetry logs: Confirmed duplicate idempotency key mismatch',
        'Cross-referenced SLA agreement: Customer has Tier-1 VIP guaranteed uptime and 1-hour resolution policy',
        'Staged autonomous credit refund of $1,840.00 to balance ledger',
      ],
      recommendedAction:
        'Immediate executive manual sign-off required to disburse credit override > $1,000 threshold and notify Enterprise Success Director.',
      originalMessage:
        'URGENT: We were billed twice for invoice INV-99023 this morning! Our CFO is demanding an immediate refund or we freeze our contract renewal.',
      createdAt: new Date().toISOString(),
    };
    addCapsule(sampleCapsule);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              Human-in-the-Loop Operations
            </span>
            <span className="text-gray-600 text-xs">·</span>
            <span className="text-xs text-gray-400">EnterPro Supervisor Hub</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">
            Agent Operational Dashboard
          </h1>
          <p className="text-gray-400 text-sm mt-1 max-w-2xl">
            Autonomous escalations synthesized into compact Context Capsules. Zero manual ticket triage or repetitive
            customer re-prompting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSeedDemoCapsule}
            className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-medium transition flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles size={14} /> Seed VIP Enterprise Case
          </button>
          <button
            onClick={resetDemo}
            title="Reset to Baseline Seed"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition text-xs"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* KPI Status Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Active Queue</span>
            <ShieldAlert size={16} className="text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-bold text-white">{capsules.length}</span>
            <span className="text-xs text-amber-400/90 font-medium">pending sign-off</span>
          </div>
        </div>

        <div className="glass-card p-4 border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Resolved Today</span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-bold text-white">{resolvedCapsules.length}</span>
            <span className="text-xs text-emerald-400/90 font-medium">completed</span>
          </div>
        </div>

        <div className="glass-card p-4 border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Self-Learning KB</span>
            <BookOpen size={16} className="text-violet-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-bold text-white">{kbArticles.length}</span>
            <span className="text-xs text-violet-400/90 font-medium">articles indexed</span>
          </div>
        </div>

        <div className="glass-card p-4 border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Mean Escalation SLA</span>
            <Clock size={16} className="text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-bold text-white">1.8m</span>
            <span className="text-xs text-cyan-400/90 font-medium">94% within target</span>
          </div>
        </div>
      </div>

      {/* Main Queue Section */}
      <div className="space-y-4">
        {/* Controls: Search & Filter Chips */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {(['All', 'High', 'Enterprise', 'Billing'] as const).map((filter) => {
              const active = selectedFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap border ${
                    active
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                      : 'bg-white/5 hover:bg-white/10 text-gray-400 border-white/10'
                  }`}
                >
                  {filter === 'All'
                    ? `All Cases (${capsules.length})`
                    : filter === 'High'
                    ? 'High Urgency'
                    : filter === 'Enterprise'
                    ? 'Enterprise Tier'
                    : 'Billing'}
                </button>
              );
            })}
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer, issue, or cause..."
              className="w-full sm:w-64 pl-8 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>
        </div>

        {/* Capsule Cards Grid or Empty State */}
        {filteredCapsules.length === 0 ? (
          <div className="glass-card p-10 text-center space-y-4 border border-dashed border-white/10">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-white">No Escalated Cases In Queue</h3>
              <p className="text-gray-400 text-xs max-w-md mx-auto mt-1">
                Trigger scenarios like <span className="text-cyan-400">Cancel Subscription</span> or{' '}
                <span className="text-cyan-400">Delayed Shipment</span> on the chat page, or seed a sample VIP enterprise
                incident right now.
              </p>
            </div>
            <button
              onClick={handleSeedDemoCapsule}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:opacity-95 text-white text-xs font-semibold shadow-[0_0_15px_rgba(6,182,212,0.2)] transition"
            >
              <Sparkles size={14} /> Pre-populate Enterprise Escalation Capsule
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {filteredCapsules.map((c) => (
              <ContextCapsuleCard key={c.id} capsule={c} onResolve={resolveCapsule} />
            ))}
          </div>
        )}
      </div>

      {/* Enterprise Knowledge Base Library */}
      <div className="glass-card p-5 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-semibold text-lg text-white flex items-center gap-2">
                <BookOpen size={18} className="text-cyan-400" />
                Adaptive Knowledge Base Index
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400 font-mono">
                {kbArticles.length} entries
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Real-time synthesized organizational memory. Human resolutions auto-draft new articles to permanently prevent
              future escalations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setNewArticleModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-violet-500/20 text-violet-300 border border-violet-500/40 text-xs font-semibold flex items-center gap-1.5 hover:bg-violet-500/30 transition shadow-sm whitespace-nowrap"
            >
              <Edit3 size={13} /> Author Article
            </button>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={kbSearch}
                onChange={(e) => setKbSearch(e.target.value)}
                placeholder="Search knowledge base..."
                className="w-full sm:w-60 pl-8 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
          </div>
        </div>

        {resolvedCapsules.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
            <span>
              Autonomous flywheel active: <strong>{resolvedCapsules.length}</strong> new case(s) resolved and synthesized into vector storage during this active session.
            </span>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
          {filteredKb.map((a) => {
            const isExpanded = expandedKb === a.id;
            return (
              <div
                key={a.id}
                onClick={() => setExpandedKb(isExpanded ? null : a.id)}
                className="p-3.5 rounded-xl bg-black/20 hover:bg-black/40 border border-white/5 hover:border-white/10 cursor-pointer transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {a.category}
                    </span>
                    <span className="text-gray-500 text-xs group-hover:text-cyan-400 transition">
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium text-gray-100 group-hover:text-white transition line-clamp-1">
                    {a.title}
                  </h4>
                  <p
                    className={`text-xs text-gray-400 mt-1 leading-relaxed ${
                      isExpanded ? 'line-clamp-none' : 'line-clamp-2'
                    }`}
                  >
                    {a.content}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-white/5">
                  {a.tags?.map((t) => (
                    <span key={t} className="text-[10px] text-gray-500 font-mono">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Author KB Article Modal */}
      {newArticleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateArticle}
            className="glass-card p-6 max-w-xl w-full bg-[#0a0f1d] border border-violet-500/40 space-y-4 animate-fadeIn"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 size={18} className="text-violet-400" />
                <h3 className="font-bold text-white text-base">Author Knowledge Base Article</h3>
              </div>
              <button
                type="button"
                onClick={() => setNewArticleModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-gray-400 mb-1 block">Article Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Multi-Region Gateway Timeout Policy"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-400 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 mb-1 block">Category Domain</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-400 text-xs"
                  >
                    <option value="Billing">Billing</option>
                    <option value="Technical">Technical</option>
                    <option value="Order">Order</option>
                    <option value="Account">Account</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 mb-1 block">Search Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="gateway, retry, refund"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-400 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 mb-1 block">Standard Operating Procedure / Resolution Body</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Document the exact technical diagnosis and step-by-step remediation protocol..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-violet-400 text-xs resize-none"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setNewArticleModalOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 hover:opacity-95 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-violet-500/25"
              >
                <PlusCircle size={13} /> Save Article to Memory
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
