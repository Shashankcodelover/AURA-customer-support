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
  Trash2,
} from 'lucide-react';
import { ContextCapsule } from '@/lib/types';

export default function DashboardPage() {
  const {
    capsules,
    resolvedCapsules,
    kbArticles,
    resolveCapsule,
    deleteCapsule,
    deleteKbArticle,
    addCapsule,
    resetDemo,
    addKbArticle,
  } = useAppState();
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
            <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-[rgba(14,156,116,0.08)] border border-[rgba(14,156,116,0.2)] text-[#0E9C74] dark:bg-[rgba(14,156,116,0.15)] dark:border-[rgba(14,156,116,0.3)] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0E9C74]" />
              Human-in-the-Loop Operations
            </span>
            <span className="text-[#6B6E85] dark:text-[#8B8FA3] text-xs">·</span>
            <span className="text-xs text-[#6B6E85] dark:text-[#8B8FA3]">Operations center</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-[#1B1D2A] dark:text-white tracking-tight">
            Agent Operational Dashboard
          </h1>
          <p className="text-[#6B6E85] dark:text-[#8B8FA3] text-sm mt-1 max-w-2xl">
            Autonomous escalations synthesized into compact Context Capsules. Zero manual ticket triage or repetitive
            customer re-prompting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSeedDemoCapsule}
            className="px-3.5 py-2 rounded-xl bg-[rgba(109,74,235,0.08)] border border-[rgba(109,74,235,0.2)] text-[#6D4AEB] hover:bg-[rgba(109,74,235,0.15)] dark:bg-[rgba(109,74,235,0.15)] dark:text-[#B69CFF] dark:hover:bg-[rgba(109,74,235,0.25)] text-xs font-medium transition flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles size={14} /> Seed VIP Enterprise Case
          </button>
          <button
            onClick={resetDemo}
            title="Reset to Baseline Seed"
            className="p-2 rounded-xl bg-[rgba(255,255,255,0.5)] border border-white/90 text-[#6B6E85] hover:text-[#1B1D2A] hover:bg-white dark:bg-[rgba(15,20,35,0.72)] dark:border-white/10 dark:text-[#8B8FA3] dark:hover:text-white transition text-xs"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* KPI Status Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card glass-hero-stat p-4">
          <div className="flex items-center justify-between text-[#6B6E85] dark:text-[#8B8FA3] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Active Queue</span>
            <ShieldAlert size={16} className="text-[#C97A00]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-bold text-[#1B1D2A] dark:text-white">{capsules.length}</span>
            <span className="text-xs text-[#C97A00] font-medium">pending sign-off</span>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between text-[#6B6E85] dark:text-[#8B8FA3] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Resolved Today</span>
            <CheckCircle2 size={16} className="text-[#0E9C74]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-bold text-[#1B1D2A] dark:text-white">{resolvedCapsules.length}</span>
            <span className="text-xs text-[#0E9C74] font-medium">completed</span>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between text-[#6B6E85] dark:text-[#8B8FA3] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Self-Learning KB</span>
            <BookOpen size={16} className="text-[#6D4AEB] dark:text-[#B69CFF]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-bold text-[#1B1D2A] dark:text-white">{kbArticles.length}</span>
            <span className="text-xs text-[#6D4AEB] dark:text-[#B69CFF] font-medium">articles indexed</span>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between text-[#6B6E85] dark:text-[#8B8FA3] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Mean Escalation SLA</span>
            <Clock size={16} className="text-[#0E9C74]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-bold text-[#1B1D2A] dark:text-white">1.8m</span>
            <span className="text-xs text-[#0E9C74] font-medium">94% within target</span>
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
                      ? 'bg-[rgba(109,74,235,0.1)] text-[#6D4AEB] border-[rgba(109,74,235,0.3)] dark:bg-[rgba(109,74,235,0.2)] dark:text-[#B69CFF] shadow-sm'
                      : 'bg-[rgba(255,255,255,0.7)] text-[#6B6E85] border-white/90 hover:bg-white dark:bg-[rgba(15,20,35,0.72)] dark:text-[#8B8FA3] dark:border-white/10 dark:hover:bg-white/5'
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
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9599AD]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer, issue, or cause..."
              className="w-full sm:w-64 pl-8 pr-3 py-1.5 rounded-xl bg-[rgba(255,255,255,0.5)] border border-white/90 text-[#1B1D2A] placeholder-[#9599AD] focus:outline-none focus:border-[#6D4AEB] dark:bg-[rgba(0,0,0,0.3)] dark:border-white/10 dark:text-white transition"
            />
          </div>
        </div>

        {/* Capsule Cards Grid or Empty State */}
        {filteredCapsules.length === 0 ? (
          <div className="glass-card p-10 text-center space-y-4 border-dashed border-[rgba(109,74,235,0.2)] dark:border-white/10">
            <div className="w-14 h-14 rounded-2xl bg-[rgba(109,74,235,0.08)] border border-[rgba(109,74,235,0.2)] flex items-center justify-center mx-auto text-[#6D4AEB] dark:text-[#B69CFF] shadow-sm">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-[#1B1D2A] dark:text-white">No Escalated Cases In Queue</h3>
              <p className="text-[#6B6E85] dark:text-[#8B8FA3] text-xs max-w-md mx-auto mt-1">
                Trigger scenarios like <span className="text-[#6D4AEB] dark:text-[#B69CFF]">Cancel Subscription</span> or{' '}
                <span className="text-[#6D4AEB] dark:text-[#B69CFF]">Delayed Shipment</span> on the chat page, or seed a sample VIP enterprise
                incident right now.
              </p>
            </div>
            <button
              onClick={handleSeedDemoCapsule}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6EE7C8] via-[#B69CFF] to-[#FFAFD1] hover:opacity-95 text-[#1B1D2A] text-xs font-semibold shadow-sm transition"
            >
              <Sparkles size={14} /> Pre-populate Enterprise Escalation Capsule
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {filteredCapsules.map((c) => (
              <ContextCapsuleCard key={c.id} capsule={c} onResolve={resolveCapsule} onDelete={deleteCapsule} />
            ))}
          </div>
        )}
      </div>

      {/* Enterprise Knowledge Base Library */}
      <div className="glass-card p-5 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgba(109,74,235,0.08)] dark:border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-semibold text-lg text-[#1B1D2A] dark:text-white flex items-center gap-2">
                <BookOpen size={18} className="text-[#6D4AEB] dark:text-[#B69CFF]" />
                Adaptive Knowledge Base Index
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[rgba(109,74,235,0.06)] border border-[rgba(109,74,235,0.15)] text-[#6D4AEB] dark:bg-[rgba(109,74,235,0.15)] dark:text-[#B69CFF] font-mono">
                {kbArticles.length} entries
              </span>
            </div>
            <p className="text-xs text-[#6B6E85] dark:text-[#8B8FA3] mt-1">
              Real-time synthesized organizational memory. Human resolutions auto-draft new articles to permanently prevent
              future escalations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setNewArticleModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[rgba(109,74,235,0.1)] text-[#6D4AEB] border border-[rgba(109,74,235,0.25)] dark:bg-[rgba(109,74,235,0.2)] dark:text-[#B69CFF] text-xs font-semibold flex items-center gap-1.5 hover:bg-[rgba(109,74,235,0.15)] transition shadow-sm whitespace-nowrap"
            >
              <Edit3 size={13} /> Author Article
            </button>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9599AD]" />
              <input
                type="text"
                value={kbSearch}
                onChange={(e) => setKbSearch(e.target.value)}
                placeholder="Search knowledge base..."
                className="w-full sm:w-60 pl-8 pr-3 py-1.5 rounded-xl bg-[rgba(255,255,255,0.5)] border border-white/90 text-[#1B1D2A] placeholder-[#9599AD] focus:outline-none focus:border-[#6D4AEB] dark:bg-[rgba(0,0,0,0.3)] dark:border-white/10 dark:text-white transition"
              />
            </div>
          </div>
        </div>

        {resolvedCapsules.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[rgba(109,74,235,0.06)] border border-[rgba(109,74,235,0.15)] text-[#6D4AEB] dark:bg-[rgba(109,74,235,0.15)] dark:text-[#B69CFF] text-xs">
            <span className="w-2 h-2 rounded-full bg-[#6D4AEB] dark:bg-[#B69CFF]" />
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
                className="p-3.5 rounded-xl bg-[rgba(255,255,255,0.8)] border border-white/90 hover:border-[rgba(109,74,235,0.2)] shadow-sm dark:bg-[rgba(15,20,35,0.72)] dark:border-white/10 dark:hover:border-[rgba(109,74,235,0.3)] cursor-pointer transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[rgba(109,74,235,0.06)] text-[#6D4AEB] border border-[rgba(109,74,235,0.15)] dark:bg-[rgba(109,74,235,0.15)] dark:text-[#B69CFF] font-semibold">
                      {a.category}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Permanently delete KB article "${a.title}"?`)) {
                            deleteKbArticle(a.id);
                          }
                        }}
                        className="p-1 rounded text-[#9599AD] hover:text-[#E11D48] hover:bg-[rgba(225,29,72,0.1)] transition"
                        title="Delete Article"
                      >
                        <Trash2 size={13} />
                      </button>
                      <span className="text-[#9599AD] group-hover:text-[#6D4AEB] dark:group-hover:text-[#B69CFF] transition">
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </span>
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-[#1B1D2A] dark:text-white group-hover:text-[#6D4AEB] dark:group-hover:text-[#B69CFF] transition line-clamp-1">
                    {a.title}
                  </h4>
                  <p
                    className={`text-xs text-[#6B6E85] dark:text-[#8B8FA3] mt-1 leading-relaxed ${
                      isExpanded ? 'line-clamp-none' : 'line-clamp-2'
                    }`}
                  >
                    {a.content}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-[rgba(109,74,235,0.08)] dark:border-white/5">
                  {a.tags?.map((t) => (
                    <span key={t} className="text-[10px] text-[#9599AD] font-mono">
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateArticle}
            className="glass-card p-6 max-w-xl w-full bg-white dark:bg-[#0F1424] border-[rgba(109,74,235,0.3)] space-y-4 animate-fadeIn"
          >
            <div className="flex items-center justify-between border-b border-[rgba(109,74,235,0.08)] dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 size={18} className="text-[#6D4AEB] dark:text-[#B69CFF]" />
                <h3 className="font-bold text-[#1B1D2A] dark:text-white text-base">Author Knowledge Base Article</h3>
              </div>
              <button
                type="button"
                onClick={() => setNewArticleModalOpen(false)}
                className="p-1.5 rounded-lg bg-[rgba(255,255,255,0.5)] border border-white/90 text-[#6B6E85] hover:text-[#1B1D2A] hover:bg-white dark:bg-[rgba(15,20,35,0.72)] dark:border-white/10 dark:text-[#8B8FA3] dark:hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#6B6E85] dark:text-[#8B8FA3] mb-1 block">Article Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Multi-Region Gateway Timeout Policy"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[rgba(255,255,255,0.5)] border border-white/90 rounded-xl px-3 py-2 text-[#1B1D2A] focus:outline-none focus:border-[#6D4AEB] dark:bg-[rgba(0,0,0,0.3)] dark:border-white/10 dark:text-white dark:focus:border-[#6D4AEB] text-xs transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#6B6E85] dark:text-[#8B8FA3] mb-1 block">Category Domain</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-[rgba(255,255,255,0.5)] border border-white/90 rounded-xl px-3 py-2 text-[#1B1D2A] focus:outline-none focus:border-[#6D4AEB] dark:bg-[rgba(0,0,0,0.3)] dark:border-white/10 dark:text-white dark:focus:border-[#6D4AEB] text-xs transition"
                  >
                    <option value="Billing">Billing</option>
                    <option value="Technical">Technical</option>
                    <option value="Order">Order</option>
                    <option value="Account">Account</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#6B6E85] dark:text-[#8B8FA3] mb-1 block">Search Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="gateway, retry, refund"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className="w-full bg-[rgba(255,255,255,0.5)] border border-white/90 rounded-xl px-3 py-2 text-[#1B1D2A] focus:outline-none focus:border-[#6D4AEB] dark:bg-[rgba(0,0,0,0.3)] dark:border-white/10 dark:text-white dark:focus:border-[#6D4AEB] text-xs transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#6B6E85] dark:text-[#8B8FA3] mb-1 block">Standard Operating Procedure / Resolution Body</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Document the exact technical diagnosis and step-by-step remediation protocol..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-[rgba(255,255,255,0.5)] border border-white/90 rounded-xl p-3 text-[#1B1D2A] focus:outline-none focus:border-[#6D4AEB] dark:bg-[rgba(0,0,0,0.3)] dark:border-white/10 dark:text-white dark:focus:border-[#6D4AEB] text-xs resize-none transition"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[rgba(109,74,235,0.08)] dark:border-white/10 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setNewArticleModalOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-[rgba(255,255,255,0.5)] border border-white/90 text-[#6B6E85] hover:text-[#1B1D2A] hover:bg-white dark:bg-[rgba(15,20,35,0.72)] dark:border-white/10 dark:text-[#8B8FA3] dark:hover:text-white text-xs transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#6EE7C8] via-[#B69CFF] to-[#FFAFD1] hover:opacity-95 text-[#1B1D2A] font-semibold text-xs flex items-center gap-1.5 shadow-sm"
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
