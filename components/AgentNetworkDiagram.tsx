'use client';

import { ReasoningStep } from '@/lib/types';
import { Radio, CreditCard, Wrench, Package, UserCog, Brain, ShieldAlert } from 'lucide-react';

const SPECIALISTS = [
  { name: 'Billing', icon: CreditCard },
  { name: 'Technical', icon: Wrench },
  { name: 'Order', icon: Package },
  { name: 'Account', icon: UserCog },
];

function nodeStatus(name: string, visitedAgents: Set<string>, activeAgent: string | null) {
  if (activeAgent === name) return 'active';
  if (visitedAgents.has(name)) return 'done';
  return 'idle';
}

function nodeClasses(status: string) {
  if (status === 'active') return 'border-cyan-400 bg-cyan-400/15 text-cyan-100 animate-pulse shadow-[0_0_20px_rgba(62,198,255,0.35)]';
  if (status === 'done') return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200';
  return 'border-white/10 bg-white/5 text-gray-500';
}

export default function AgentNetworkDiagram({ revealedSteps }: { revealedSteps: ReasoningStep[] }) {
  const visitedAgents = new Set(revealedSteps.map((s) => s.agent));
  const activeAgent = revealedSteps.length ? revealedSteps[revealedSteps.length - 1].agent : null;

  const routerStatus = nodeStatus('Router', visitedAgents, activeAgent);
  const reasoningStatus = nodeStatus('Reasoning', visitedAgents, activeAgent);
  const escalationStatus = nodeStatus('Escalation', visitedAgents, activeAgent);

  return (
    <div className="flex flex-col items-center gap-2 py-2">
      {/* Router */}
      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-medium transition ${nodeClasses(routerStatus)}`}>
        <Radio size={14} /> Router Agent
      </div>
      <div className="w-px h-4 bg-white/15" />

      {/* Specialists */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {SPECIALISTS.map((s) => {
          const status = nodeStatus(s.name, visitedAgents, activeAgent);
          const Icon = s.icon;
          return (
            <div
              key={s.name}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border text-xs font-medium transition ${nodeClasses(status)}`}
            >
              <Icon size={16} />
              {s.name}
            </div>
          );
        })}
      </div>

      <div className="w-px h-4 bg-white/15" />
      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-medium transition ${nodeClasses(reasoningStatus)}`}>
        <Brain size={14} /> Reasoning Engine
      </div>

      <div className="w-px h-4 bg-white/15" />
      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-medium transition ${nodeClasses(escalationStatus)}`}>
        <ShieldAlert size={14} /> Escalation Intelligence
      </div>
    </div>
  );
}
