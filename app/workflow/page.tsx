'use client';

import { useState, useEffect } from 'react';
import { getWorkflowDefinition, WorkflowNode } from '@/lib/workflow/workflowEngine';
import {
  Workflow,
  ArrowRight,
  GitBranch,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  Database,
  ExternalLink,
  Code2,
  Copy,
  Check,
  RotateCcw,
  Gauge,
} from 'lucide-react';
import { playStepSound, playSuccessSound, playClickSound } from '@/lib/audio/soundEffects';

const TYPE_CONFIG: Record<
  string,
  { label: string; badge: string; border: string; bg: string; iconColor: string }
> = {
  agent: {
    label: 'LLM Agent',
    badge: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200',
    border: 'border-cyan-500/40',
    bg: 'from-cyan-500/10 via-slate-900/80 to-slate-950',
    iconColor: 'text-cyan-400',
  },
  branch: {
    label: 'Conditional Branch',
    badge: 'border-violet-500/30 bg-violet-500/10 text-violet-200',
    border: 'border-violet-500/40',
    bg: 'from-violet-500/10 via-slate-900/80 to-slate-950',
    iconColor: 'text-violet-400',
  },
  decision: {
    label: 'Heuristic Gate',
    badge: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
    border: 'border-amber-500/40',
    bg: 'from-amber-500/10 via-slate-900/80 to-slate-950',
    iconColor: 'text-amber-400',
  },
  action: {
    label: 'Deterministic Action',
    badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
    border: 'border-emerald-500/40',
    bg: 'from-emerald-500/10 via-slate-900/80 to-slate-950',
    iconColor: 'text-emerald-400',
  },
  human_task: {
    label: 'Human-In-The-Loop',
    badge: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
    border: 'border-rose-500/40',
    bg: 'from-rose-500/10 via-slate-900/80 to-slate-950',
    iconColor: 'text-rose-400',
  },
};

export default function WorkflowPage() {
  const def = getWorkflowDefinition();
  const [selectedNodeId, setSelectedNodeId] = useState<string>('router');
  const [activeSimStep, setActiveSimStep] = useState<number>(-1);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [copied, setCopied] = useState(false);
  const [mobileWorkflowView, setMobileWorkflowView] = useState<'graph' | 'inspector'>('graph');

  const selectedNode = def.nodes.find((n) => n.id === selectedNodeId) || def.nodes[0];

  // Simulation execution path
  const simSequence = [
    'router',
    'specialist_dispatch',
    'billing_agent',
    'reasoning',
    'escalation_decision',
    'build_context_capsule',
    'human_handoff',
    'self_learning_loop',
  ];

  // Auto-advance loop when simulating and not paused
  useEffect(() => {
    if (!isSimulating || isPaused) return;

    const delay = Math.round(900 / simSpeed);
    const timer = setTimeout(() => {
      if (activeSimStep < simSequence.length - 1) {
        const nextStep = activeSimStep + 1;
        setActiveSimStep(nextStep);
        setSelectedNodeId(simSequence[nextStep]);
        playStepSound();
      } else {
        playSuccessSound();
        setIsSimulating(false);
        setIsPaused(false);
        setTimeout(() => {
          setActiveSimStep(-1);
        }, 1200);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [isSimulating, isPaused, activeSimStep, simSpeed, simSequence]);

  const startSimulation = () => {
    playClickSound();
    setIsSimulating(true);
    setIsPaused(false);
    setActiveSimStep(0);
    setSelectedNodeId(simSequence[0]);
    playStepSound();
  };

  const togglePause = () => {
    playClickSound();
    setIsPaused((prev) => !prev);
  };

  const stepForward = () => {
    playClickSound();
    if (!isSimulating) {
      setIsSimulating(true);
      setIsPaused(true);
      setActiveSimStep(0);
      setSelectedNodeId(simSequence[0]);
      playStepSound();
      return;
    }
    if (activeSimStep < simSequence.length - 1) {
      const nextStep = activeSimStep + 1;
      setActiveSimStep(nextStep);
      setSelectedNodeId(simSequence[nextStep]);
      playStepSound();
    } else {
      playSuccessSound();
    }
  };

  const stepBackward = () => {
    playClickSound();
    if (activeSimStep > 0) {
      const prevStep = activeSimStep - 1;
      setActiveSimStep(prevStep);
      setSelectedNodeId(simSequence[prevStep]);
      playStepSound();
    }
  };

  const resetSimulation = () => {
    playClickSound();
    setIsSimulating(false);
    setIsPaused(false);
    setActiveSimStep(-1);
    setSelectedNodeId('router');
  };

  const handleCopyManifest = () => {
    navigator.clipboard.writeText(JSON.stringify(def, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header & Meta */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center gap-1.5">
              <Cpu size={12} className="text-cyan-400" /> EnterPro Orchestration Runtime
            </span>
            <span className="text-gray-600 text-xs">·</span>
            <span className="text-xs text-gray-400">Declarative DAG Manifest v{def.version}</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Workflow className="text-cyan-400" size={28} />
            Registered Multi-Agent Graph Architecture
          </h1>
          <p className="text-gray-400 text-sm mt-1 max-w-2xl">
            Portable enterprise directed acyclic graph. Every node corresponds 1:1 with an intelligent micro-agent or
            deterministic rule execution gate.
          </p>
        </div>

        {/* Interactive Debugger Controls & Speed Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Speed Selector */}
          <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-1 text-xs">
            <span className="px-2 text-gray-500 font-mono text-[11px] hidden sm:inline">Speed:</span>
            {[0.5, 1, 2].map((speed) => (
              <button
                key={speed}
                onClick={() => setSimSpeed(speed)}
                className={`px-2 py-0.5 rounded-lg font-mono font-medium transition ${
                  simSpeed === speed
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Stepper Buttons (Prev, Play/Pause, Next, Reset) */}
          <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-xl p-1">
            <button
              onClick={stepBackward}
              disabled={activeSimStep <= 0}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
              title="Previous Step"
            >
              <SkipBack size={15} />
            </button>

            {!isSimulating ? (
              <button
                onClick={startSimulation}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-600 hover:opacity-95 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-[0_0_16px_rgba(6,182,212,0.3)]"
              >
                <Play size={13} fill="currentColor" /> Simulate Flow
              </button>
            ) : (
              <button
                onClick={togglePause}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400 text-cyan-200 font-semibold text-xs transition flex items-center gap-1.5"
              >
                {isPaused ? <Play size={13} fill="currentColor" /> : <Pause size={13} />}
                {isPaused ? 'Resume' : `Step ${activeSimStep + 1}/${simSequence.length}`}
              </button>
            )}

            <button
              onClick={stepForward}
              disabled={activeSimStep >= simSequence.length - 1 && isSimulating}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
              title="Next Step"
            >
              <SkipForward size={15} />
            </button>

            {isSimulating && (
              <button
                onClick={resetSimulation}
                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 transition"
                title="Reset Simulation"
              >
                <RotateCcw size={14} />
              </button>
            )}
          </div>

          <button
            onClick={handleCopyManifest}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition text-xs flex items-center gap-1.5"
            title="Copy DAG JSON"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* Deployment & Environment Status Strip */}
      <div className="glass-card p-4 border border-white/5 bg-gradient-to-r from-cyan-500/5 via-violet-500/5 to-transparent flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4 text-gray-300">
          <span className="flex items-center gap-1.5">
            <span className="text-gray-500 font-medium">Pipeline:</span>
            <span className="font-mono text-cyan-300 font-semibold">{def.workflow}</span>
          </span>
          <span className="text-gray-600">·</span>
          <span className="flex items-center gap-1.5">
            <span className="text-gray-500 font-medium">Nodes:</span>
            <span className="font-mono text-white font-medium">{def.nodes.length} registered</span>
          </span>
          <span className="text-gray-600">·</span>
          <span className="flex items-center gap-1.5">
            <span className="text-gray-500 font-medium">Target:</span>
            <span className="font-mono text-violet-300 font-semibold uppercase">{def.deployment.target}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active Seam: lib/workflow/workflowEngine.ts
          </span>
        </div>
      </div>

      {/* Live Simulation Debugger Banner */}
      {isSimulating && (
        <div className="p-3.5 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/60 via-slate-900/80 to-cyan-950/60 flex flex-wrap items-center justify-between gap-3 shadow-[0_0_20px_rgba(6,182,212,0.15)] animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-300">
                  STEP {activeSimStep + 1} OF {simSequence.length}:
                </span>
                <span className="text-xs font-semibold text-white">
                  {selectedNode.name}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-gray-300">
                  {selectedNode.id}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {isPaused
                  ? 'Simulation paused. Use Step Forward / Backward to inspect graph propagation.'
                  : `Propagating execution context at ${simSpeed}x playback rate...`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2 py-1 rounded bg-black/40 border border-white/10 text-cyan-300">
              Type: {selectedNode.type}
            </span>
            <span className="px-2 py-1 rounded bg-black/40 border border-white/10 text-emerald-300">
              Latency: ~{Math.round(220 / simSpeed)}ms
            </span>
          </div>
        </div>
      )}

      {/* Mobile DAG View Switcher (Eliminates mobile scroll fatigue) */}
      <div className="lg:hidden flex items-center bg-black/40 border border-white/10 rounded-xl p-1 text-xs gap-1">
        <button
          onClick={() => setMobileWorkflowView('graph')}
          className={`flex-1 py-2 rounded-lg font-medium transition text-center flex items-center justify-center gap-1.5 ${
            mobileWorkflowView === 'graph'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <GitBranch size={13} className="text-cyan-400" />
          <span>DAG Nodes ({def.nodes.length})</span>
        </button>
        <button
          onClick={() => setMobileWorkflowView('inspector')}
          className={`flex-1 py-2 rounded-lg font-medium transition text-center flex items-center justify-center gap-1.5 ${
            mobileWorkflowView === 'inspector'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Sparkles size={13} className="text-violet-400" />
          <span className="truncate">Inspector: {selectedNode.name}</span>
        </button>
      </div>

      {/* Visual Interactive Graph & Node Inspector Grid */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left (7 cols): Interactive Visual Node Graph */}
        <div className={`lg:col-span-7 glass-card p-5 md:p-6 space-y-4 border border-white/5 ${mobileWorkflowView === 'graph' ? 'block' : 'hidden lg:block'}`}>
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h2 className="font-display font-semibold text-white flex items-center gap-2">
              <GitBranch size={16} className="text-cyan-400" />
              Interactive DAG Visualizer
            </h2>
            <span className="text-xs text-gray-500">Click any node to inspect execution schema</span>
          </div>

          <div className="space-y-3">
            {def.nodes.map((node, index) => {
              const config = TYPE_CONFIG[node.type] || TYPE_CONFIG.agent;
              const isSelected = selectedNodeId === node.id;
              const isSimActive = isSimulating && simSequence[activeSimStep] === node.id;

              return (
                <div
                  key={node.id}
                  onClick={() => {
                    setSelectedNodeId(node.id);
                    if (window.innerWidth < 1024) {
                      setMobileWorkflowView('inspector');
                    }
                  }}
                  className={`p-3.5 rounded-xl border transition-all duration-300 cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? `bg-slate-900 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/50`
                      : 'bg-black/30 border-white/5 hover:border-white/20 hover:bg-black/50'
                  } ${isSimActive ? 'ring-2 ring-emerald-400 animate-pulse' : ''}`}
                >
                  {isSimActive && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-500 animate-shimmer" />
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs text-gray-400">
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-white">{node.name}</h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${config.badge}`}>
                            {config.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">#{node.id}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {node.engine && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-300 font-mono">
                          {node.engine}
                        </span>
                      )}
                      <ArrowRight size={14} className={isSelected ? 'text-cyan-400' : 'text-gray-600'} />
                    </div>
                  </div>

                  {node.branches && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-white/5">
                      {Object.entries(node.branches).map(([branchLabel, targetId]) => (
                        <span
                          key={branchLabel}
                          className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300 flex items-center gap-1 font-mono"
                        >
                          <span className="text-cyan-400 font-semibold">{branchLabel}</span>
                          <ArrowRight size={9} />
                          <span>{targetId}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {node.condition && (
                    <div className="mt-2 text-[11px] font-mono text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-1">
                      if ({node.condition})
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right (5 cols): Deep Node Execution Inspector */}
        <div className={`lg:col-span-5 glass-card p-5 md:p-6 space-y-5 sticky top-24 border border-cyan-500/30 bg-gradient-to-b from-slate-900/90 via-slate-950 to-black shadow-2xl ${mobileWorkflowView === 'inspector' ? 'block' : 'hidden lg:block'}`}>
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
                <Sparkles size={12} /> Execution Node Telemetry
              </span>
              <h2 className="text-lg font-bold text-white mt-0.5">{selectedNode.name}</h2>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full border ${
                (TYPE_CONFIG[selectedNode.type] || TYPE_CONFIG.agent).badge
              }`}
            >
              {selectedNode.type}
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-1">Node Identifier</p>
              <p className="font-mono text-cyan-300 bg-black/40 border border-white/10 rounded-lg p-2.5 select-all">
                {selectedNode.id}
              </p>
            </div>

            {selectedNode.action && (
              <div>
                <p className="text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-1">Action Hook</p>
                <p className="font-mono text-emerald-300 bg-black/40 border border-white/10 rounded-lg p-2.5 select-all">
                  {selectedNode.action}
                </p>
              </div>
            )}

            {selectedNode.reads && (
              <div>
                <p className="text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-1 flex items-center gap-1.5">
                  <Database size={12} className="text-cyan-400" /> Corroborated Data Feeds
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNode.reads.map((r) => (
                    <span
                      key={r}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-mono text-[11px]"
                    >
                      @{r}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedNode.condition && (
              <div>
                <p className="text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-1">Gate Expression</p>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5 text-amber-200 font-mono leading-relaxed">
                  {selectedNode.condition}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-[11px]">
                  <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                    true ➔ {selectedNode.onTrue}
                  </div>
                  <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300">
                    false ➔ {selectedNode.onFalse}
                  </div>
                </div>
              </div>
            )}

            <div>
              <p className="text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-1">Next Edge Transition</p>
              <div className="bg-black/40 border border-white/10 rounded-lg p-2.5 font-mono text-gray-300">
                {selectedNode.next ? (
                  <span className="text-cyan-400">{selectedNode.next.join(', ')}</span>
                ) : selectedNode.branches ? (
                  <span>Dynamic Branch Table ({Object.keys(selectedNode.branches).length} routes)</span>
                ) : selectedNode.onTrue ? (
                  <span>Conditional branching</span>
                ) : (
                  <span className="text-emerald-400">Terminal Leaf Node</span>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-white/10">
              <div className="flex items-center justify-between text-[11px] text-gray-400 mb-2">
                <span>Production Runtime Hook</span>
                <span className="text-emerald-400 font-semibold">100% Non-Breaking Seam</span>
              </div>
              <p className="text-gray-500 text-[11px] leading-relaxed">
                When swapping to live EnterPro endpoints, invoke{' '}
                <code className="text-gray-300 font-mono">enterpro.dispatch(&quot;{selectedNode.id}&quot;)</code> inside{' '}
                <code className="text-gray-300 font-mono">lib/workflow/workflowEngine.ts</code>. All other layers remain
                untouched.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
