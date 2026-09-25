'use client';

import { ReasoningStep } from '@/lib/types';
import { Radio, CreditCard, Wrench, Package, UserCog, Brain, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

const SPECIALISTS = [
  { name: 'Billing', role: 'Payment & Webhooks', icon: CreditCard, color: 'from-[rgba(201,122,0,0.08)] to-[rgba(234,179,8,0.08)] border-[rgba(201,122,0,0.3)] text-[#C97A00] dark:from-amber-500/20 dark:to-orange-500/20 dark:border-amber-500/40 dark:text-amber-300' },
  { name: 'Technical', role: 'Bugs & Auth API', icon: Wrench, color: 'from-fuchsia-500/[0.08] to-pink-500/[0.08] border-fuchsia-500/30 text-fuchsia-600 dark:from-fuchsia-500/20 dark:to-pink-500/20 dark:border-fuchsia-500/40 dark:text-fuchsia-300' },
  { name: 'Order', role: 'Fulfillment & Logistics', icon: Package, color: 'from-[rgba(14,156,116,0.08)] to-[rgba(20,184,166,0.08)] border-[rgba(14,156,116,0.3)] text-[#0E9C74] dark:from-emerald-500/20 dark:to-teal-500/20 dark:border-emerald-500/40 dark:text-emerald-300' },
  { name: 'Account', role: 'Identity & Access', icon: UserCog, color: 'from-[rgba(109,74,235,0.08)] to-[rgba(99,102,241,0.08)] border-[rgba(109,74,235,0.3)] text-[#6D4AEB] dark:from-violet-500/20 dark:to-indigo-500/20 dark:border-violet-500/40 dark:text-violet-300' },
];

function nodeStatus(name: string, visitedAgents: Set<string>, activeAgent: string | null) {
  if (activeAgent === name) return 'active';
  if (visitedAgents.has(name)) return 'done';
  return 'idle';
}

export default function AgentNetworkDiagram({ revealedSteps }: { revealedSteps: ReasoningStep[] }) {
  const visitedAgents = new Set(revealedSteps.map((s) => s.agent));
  const activeAgent = revealedSteps.length ? revealedSteps[revealedSteps.length - 1].agent : null;

  const routerStatus = nodeStatus('Router', visitedAgents, activeAgent);
  const reasoningStatus = nodeStatus('Reasoning', visitedAgents, activeAgent);
  const escalationStatus = nodeStatus('Escalation', visitedAgents, activeAgent);

  return (
    <div className="relative py-4 px-2 select-none overflow-hidden">
      
      {/* Background Pipeline Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(109,74,235,0.03)] via-[rgba(14,156,116,0.03)] to-[rgba(14,156,116,0.03)] dark:from-cyan-500/5 dark:via-violet-500/5 dark:to-emerald-500/5 rounded-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-3">
        
        {/* Tier 1: Router Agent */}
        <div className="w-full max-w-sm flex flex-col items-center">
          <div
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl border transition-all duration-300 ${
              routerStatus === 'active'
                ? 'border-[#6D4AEB] bg-[rgba(109,74,235,0.08)] dark:border-cyan-400 dark:bg-violet-500/20 text-[#1B1D2A] dark:text-white shadow-[0_0_25px_rgba(109,74,235,0.2)] scale-[1.02]'
                : routerStatus === 'done'
                ? 'border-[rgba(14,156,116,0.4)] dark:border-emerald-500/50 bg-[rgba(14,156,116,0.06)] dark:bg-emerald-500/10 text-[#0E9C74] dark:text-emerald-200'
                : 'border-white/90 dark:border-white/10 bg-[rgba(255,255,255,0.5)] dark:bg-white/[0.03] text-slate-600 dark:text-slate-400 dark:text-gray-500'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`p-1.5 rounded-lg ${routerStatus === 'active' ? 'bg-[#6D4AEB] text-white dark:bg-cyan-400 dark:text-black animate-pulse' : 'bg-black/5 dark:bg-white/10 text-slate-600 dark:text-slate-400 dark:text-gray-400'}`}>
                <Radio size={15} />
              </div>
              <div>
                <div className={`font-semibold text-xs flex items-center gap-2 ${routerStatus === 'active' ? 'text-[#1B1D2A] dark:text-white' : 'text-[#1B1D2A] dark:text-white'}`}>
                  Router Agent <span className="text-[10px] text-slate-700 dark:text-slate-300 dark:text-gray-400 font-mono font-normal">#qwen-intent</span>
                </div>
                <div className="text-[10px] text-slate-700 dark:text-slate-300 dark:text-gray-400">Classifies intent, sentiment, and urgency</div>
              </div>
            </div>
            {routerStatus === 'active' && <span className="text-[10px] font-mono font-bold text-[#6D4AEB] dark:text-violet-300 animate-pulse">CLASSIFYING...</span>}
            {routerStatus === 'done' && <CheckCircle size={14} className="text-[#0E9C74] dark:text-emerald-400" />}
          </div>
        </div>

        {/* SVG Connector Pipe Tier 1 -> Tier 2 */}
        <div className="w-full max-w-md h-6 flex justify-center items-center">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 300 24">
            <line x1="150" y1="0" x2="150" y2="24" stroke="rgba(109,74,235,0.1)" className="dark:stroke-white/15" strokeWidth="2" />
            <line x1="50" y1="24" x2="250" y2="24" stroke="rgba(109,74,235,0.1)" className="dark:stroke-white/15" strokeWidth="2" />
            {routerStatus === 'done' && (
              <line x1="150" y1="0" x2="150" y2="24" stroke="#6D4AEB" strokeWidth="2" className="anim-beam dark:stroke-cyan-400" />
            )}
          </svg>
        </div>

        {/* Tier 2: Specialized Sub-Agents Cluster */}
        <div className="w-full max-w-2xl grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {SPECIALISTS.map((s) => {
            const status = nodeStatus(s.name, visitedAgents, activeAgent);
            const Icon = s.icon;
            const isTarget = visitedAgents.has(s.name) || activeAgent === s.name;

            return (
              <div
                key={s.name}
                className={`flex flex-col p-3 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                  status === 'active'
                    ? `bg-gradient-to-br ${s.color} shadow-[0_0_20px_rgba(109,74,235,0.2)] dark:shadow-[0_0_20px_rgba(6,182,212,0.35)] scale-105`
                    : status === 'done'
                    ? 'border-[rgba(14,156,116,0.4)] dark:border-emerald-500/50 bg-[rgba(14,156,116,0.06)] dark:bg-emerald-500/10 text-[#0E9C74] dark:text-emerald-200'
                    : 'border-white/90 dark:border-white/10 bg-[rgba(255,255,255,0.5)] dark:bg-white/[0.02] text-slate-600 dark:text-slate-400 dark:text-gray-500 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Icon size={16} className={status === 'active' ? 'animate-bounce' : status === 'done' ? 'text-[#0E9C74] dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400 dark:text-gray-500'} />
                  {status === 'active' ? (
                    <span className="w-2 h-2 rounded-full bg-[#6D4AEB] dark:bg-violet-400 animate-ping" />
                  ) : status === 'done' ? (
                    <CheckCircle size={12} className="text-[#0E9C74] dark:text-emerald-400" />
                  ) : (
                    <Clock size={12} className="text-slate-600 dark:text-slate-400 dark:text-gray-600" />
                  )}
                </div>
                <div className="text-xs font-bold text-[#1B1D2A] dark:text-white">{s.name} Agent</div>
                <div className="text-[10px] text-slate-700 dark:text-slate-300 dark:text-gray-400 leading-tight mt-0.5">{s.role}</div>
              </div>
            );
          })}
        </div>

        {/* SVG Connector Pipe Tier 2 -> Tier 3 */}
        <div className="w-full max-w-md h-6 flex justify-center items-center">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 300 24">
            <line x1="50" y1="0" x2="250" y2="0" stroke="rgba(109,74,235,0.1)" className="dark:stroke-white/15" strokeWidth="2" />
            <line x1="150" y1="0" x2="150" y2="24" stroke="rgba(109,74,235,0.1)" className="dark:stroke-white/15" strokeWidth="2" />
            {reasoningStatus !== 'idle' && (
              <line x1="150" y1="0" x2="150" y2="24" stroke="#6D4AEB" strokeWidth="2" className="anim-beam dark:stroke-blue-400" />
            )}
          </svg>
        </div>

        {/* Tier 3: Reasoning Engine */}
        <div className="w-full max-w-sm">
          <div
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl border transition-all duration-300 ${
              reasoningStatus === 'active'
                ? 'border-[#6D4AEB] bg-[rgba(109,74,235,0.08)] dark:border-blue-400 dark:bg-blue-500/20 text-[#1B1D2A] dark:text-white shadow-[0_0_25px_rgba(109,74,235,0.2)] dark:shadow-[0_0_25px_rgba(168,85,247,0.4)] scale-[1.02]'
                : reasoningStatus === 'done'
                ? 'border-[rgba(14,156,116,0.4)] dark:border-emerald-500/50 bg-[rgba(14,156,116,0.06)] dark:bg-emerald-500/10 text-[#0E9C74] dark:text-emerald-200'
                : 'border-white/90 dark:border-white/10 bg-[rgba(255,255,255,0.5)] dark:bg-white/[0.03] text-slate-600 dark:text-slate-400 dark:text-gray-500'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`p-1.5 rounded-lg ${reasoningStatus === 'active' ? 'bg-[#6D4AEB] text-white dark:bg-blue-500 animate-pulse' : 'bg-black/5 dark:bg-white/10 text-slate-600 dark:text-slate-400 dark:text-gray-400'}`}>
                <Brain size={15} />
              </div>
              <div>
                <div className="font-semibold text-xs text-[#1B1D2A] dark:text-white flex items-center gap-2">
                  Root-Cause Detective <span className="text-[10px] text-slate-700 dark:text-slate-300 dark:text-gray-400 font-mono font-normal">#cross-source-synth</span>
                </div>
                <div className="text-[10px] text-slate-700 dark:text-slate-300 dark:text-gray-400">Traces symptoms to systemic root causes</div>
              </div>
            </div>
            {reasoningStatus === 'active' && <span className="text-[10px] font-mono font-bold text-[#6D4AEB] dark:text-blue-300 animate-pulse">SYNTHESIZING...</span>}
            {reasoningStatus === 'done' && <CheckCircle size={14} className="text-[#0E9C74] dark:text-emerald-400" />}
          </div>
        </div>

        {/* Connector Pipe Tier 3 -> Tier 4 */}
        <div className="w-px h-4 bg-[rgba(109,74,235,0.1)] dark:bg-white/15" />

        {/* Tier 4: Escalation & Auto-Resolution Node */}
        <div className="w-full max-w-sm">
          <div
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl border transition-all duration-300 ${
              escalationStatus === 'active'
                ? 'border-[#C97A00] bg-[rgba(201,122,0,0.08)] dark:border-amber-400 dark:bg-amber-500/20 text-[#1B1D2A] dark:text-white shadow-[0_0_25px_rgba(201,122,0,0.2)] dark:shadow-[0_0_25px_rgba(245,158,11,0.4)] scale-[1.02]'
                : escalationStatus === 'done'
                ? 'border-[rgba(14,156,116,0.4)] dark:border-emerald-500/50 bg-[rgba(14,156,116,0.06)] dark:bg-emerald-500/10 text-[#0E9C74] dark:text-emerald-200'
                : 'border-white/90 dark:border-white/10 bg-[rgba(255,255,255,0.5)] dark:bg-white/[0.03] text-slate-600 dark:text-slate-400 dark:text-gray-500'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`p-1.5 rounded-lg ${escalationStatus === 'active' ? 'bg-[#C97A00] text-white dark:bg-amber-500 dark:text-black animate-pulse' : 'bg-black/5 dark:bg-white/10 text-slate-600 dark:text-slate-400 dark:text-gray-400'}`}>
                <ShieldAlert size={15} />
              </div>
              <div>
                <div className="font-semibold text-xs text-[#1B1D2A] dark:text-white flex items-center gap-2">
                  Decision Engine <span className="text-[10px] text-slate-700 dark:text-slate-300 dark:text-gray-400 font-mono font-normal">#confidence-gate</span>
                </div>
                <div className="text-[10px] text-slate-700 dark:text-slate-300 dark:text-gray-400">Auto-Resolve (&ge;70%) vs Context Capsule Handoff</div>
              </div>
            </div>
            {escalationStatus === 'active' && <span className="text-[10px] font-mono font-bold text-[#C97A00] dark:text-amber-300 animate-pulse">EVALUATING...</span>}
            {escalationStatus === 'done' && <CheckCircle size={14} className="text-[#0E9C74] dark:text-emerald-400" />}
          </div>
        </div>

      </div>
    </div>
  );
}
