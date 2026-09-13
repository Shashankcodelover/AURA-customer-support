'use client';

import { ReasoningStep } from '@/lib/types';
import { Radio, CreditCard, Wrench, Package, UserCog, Brain, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

const SPECIALISTS = [
  { name: 'Billing', role: 'Payment & Webhooks', icon: CreditCard, color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-300' },
  { name: 'Technical', role: 'Bugs & Auth API', icon: Wrench, color: 'from-fuchsia-500/20 to-pink-500/20 border-fuchsia-500/40 text-fuchsia-300' },
  { name: 'Order', role: 'Fulfillment & Logistics', icon: Package, color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-300' },
  { name: 'Account', role: 'Identity & Access', icon: UserCog, color: 'from-violet-500/20 to-indigo-500/20 border-violet-500/40 text-violet-300' },
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
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-violet-500/5 to-emerald-500/5 rounded-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-3">
        
        {/* Tier 1: Router Agent */}
        <div className="w-full max-w-sm flex flex-col items-center">
          <div
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl border transition-all duration-300 ${
              routerStatus === 'active'
                ? 'border-cyan-400 bg-cyan-500/20 text-white shadow-[0_0_25px_rgba(6,182,212,0.4)] scale-[1.02]'
                : routerStatus === 'done'
                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200'
                : 'border-white/10 bg-white/[0.03] text-gray-500'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`p-1.5 rounded-lg ${routerStatus === 'active' ? 'bg-cyan-400 text-black animate-pulse' : 'bg-white/10 text-gray-400'}`}>
                <Radio size={15} />
              </div>
              <div>
                <div className="font-semibold text-xs text-white flex items-center gap-2">
                  Router Agent <span className="text-[10px] text-gray-400 font-mono font-normal">#qwen-intent</span>
                </div>
                <div className="text-[10px] text-gray-400">Classifies intent, sentiment, and urgency</div>
              </div>
            </div>
            {routerStatus === 'active' && <span className="text-[10px] font-mono font-bold text-cyan-300 animate-pulse">CLASSIFYING...</span>}
            {routerStatus === 'done' && <CheckCircle size={14} className="text-emerald-400" />}
          </div>
        </div>

        {/* SVG Connector Pipe Tier 1 -> Tier 2 */}
        <div className="w-full max-w-md h-6 flex justify-center items-center">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 300 24">
            <line x1="150" y1="0" x2="150" y2="24" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
            <line x1="50" y1="24" x2="250" y2="24" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
            {routerStatus === 'done' && (
              <line x1="150" y1="0" x2="150" y2="24" stroke="#06b6d4" strokeWidth="2" className="anim-beam" />
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
                    ? `border-cyan-400 bg-gradient-to-br ${s.color} shadow-[0_0_20px_rgba(6,182,212,0.35)] scale-105`
                    : status === 'done'
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200'
                    : 'border-white/10 bg-white/[0.02] text-gray-500 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Icon size={16} className={status === 'active' ? 'text-cyan-300 animate-bounce' : status === 'done' ? 'text-emerald-400' : 'text-gray-500'} />
                  {status === 'active' ? (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  ) : status === 'done' ? (
                    <CheckCircle size={12} className="text-emerald-400" />
                  ) : (
                    <Clock size={12} className="text-gray-600" />
                  )}
                </div>
                <div className="text-xs font-bold text-white">{s.name} Agent</div>
                <div className="text-[10px] text-gray-400 leading-tight mt-0.5">{s.role}</div>
              </div>
            );
          })}
        </div>

        {/* SVG Connector Pipe Tier 2 -> Tier 3 */}
        <div className="w-full max-w-md h-6 flex justify-center items-center">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 300 24">
            <line x1="50" y1="0" x2="250" y2="0" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
            <line x1="150" y1="0" x2="150" y2="24" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
            {reasoningStatus !== 'idle' && (
              <line x1="150" y1="0" x2="150" y2="24" stroke="#8b5cf6" strokeWidth="2" className="anim-beam" />
            )}
          </svg>
        </div>

        {/* Tier 3: Reasoning Engine */}
        <div className="w-full max-w-sm">
          <div
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl border transition-all duration-300 ${
              reasoningStatus === 'active'
                ? 'border-purple-400 bg-purple-500/20 text-white shadow-[0_0_25px_rgba(168,85,247,0.4)] scale-[1.02]'
                : reasoningStatus === 'done'
                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200'
                : 'border-white/10 bg-white/[0.03] text-gray-500'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`p-1.5 rounded-lg ${reasoningStatus === 'active' ? 'bg-purple-500 text-white animate-pulse' : 'bg-white/10 text-gray-400'}`}>
                <Brain size={15} />
              </div>
              <div>
                <div className="font-semibold text-xs text-white flex items-center gap-2">
                  Root-Cause Detective <span className="text-[10px] text-gray-400 font-mono font-normal">#cross-source-synth</span>
                </div>
                <div className="text-[10px] text-gray-400">Traces symptoms to systemic root causes</div>
              </div>
            </div>
            {reasoningStatus === 'active' && <span className="text-[10px] font-mono font-bold text-purple-300 animate-pulse">SYNTHESIZING...</span>}
            {reasoningStatus === 'done' && <CheckCircle size={14} className="text-emerald-400" />}
          </div>
        </div>

        {/* Connector Pipe Tier 3 -> Tier 4 */}
        <div className="w-px h-4 bg-white/15" />

        {/* Tier 4: Escalation & Auto-Resolution Node */}
        <div className="w-full max-w-sm">
          <div
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl border transition-all duration-300 ${
              escalationStatus === 'active'
                ? 'border-amber-400 bg-amber-500/20 text-white shadow-[0_0_25px_rgba(245,158,11,0.4)] scale-[1.02]'
                : escalationStatus === 'done'
                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200'
                : 'border-white/10 bg-white/[0.03] text-gray-500'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`p-1.5 rounded-lg ${escalationStatus === 'active' ? 'bg-amber-500 text-black animate-pulse' : 'bg-white/10 text-gray-400'}`}>
                <ShieldAlert size={15} />
              </div>
              <div>
                <div className="font-semibold text-xs text-white flex items-center gap-2">
                  Decision Engine <span className="text-[10px] text-gray-400 font-mono font-normal">#confidence-gate</span>
                </div>
                <div className="text-[10px] text-gray-400">Auto-Resolve (&ge;70%) vs Context Capsule Handoff</div>
              </div>
            </div>
            {escalationStatus === 'active' && <span className="text-[10px] font-mono font-bold text-amber-300 animate-pulse">EVALUATING...</span>}
            {escalationStatus === 'done' && <CheckCircle size={14} className="text-emerald-400" />}
          </div>
        </div>

      </div>
    </div>
  );
}
