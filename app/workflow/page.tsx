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
  { label: string; badge: string; iconColor: string }
> = {
  agent: {
    label: 'LLM Agent',
    badge: 'border-[rgba(14,156,116,0.2)] bg-[rgba(14,156,116,0.06)] text-[#0E9C74]',
    iconColor: 'text-[#0E9C74]',
  },
  branch: {
    label: 'Conditional Branch',
    badge: 'border-[rgba(109,74,235,0.2)] bg-[rgba(109,74,235,0.06)] text-[#6D4AEB]',
    iconColor: 'text-[#6D4AEB]',
  },
  decision: {
    label: 'Heuristic Gate',
    badge: 'border-[rgba(201,122,0,0.2)] bg-[rgba(201,122,0,0.06)] text-[#C97A00]',
    iconColor: 'text-[#C97A00]',
  },
  action: {
    label: 'Deterministic Action',
    badge: 'border-[rgba(5,150,105,0.2)] bg-[rgba(5,150,105,0.06)] text-[#059669]',
    iconColor: 'text-[#059669]',
  },
  human_task: {
    label: 'Human-In-The-Loop',
    badge: 'border-[rgba(225,29,72,0.2)] bg-[rgba(225,29,72,0.06)] text-[#E11D48]',
    iconColor: 'text-[#E11D48]',
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
            <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full border-[rgba(14,156,116,0.2)] bg-[rgba(14,156,116,0.06)] text-[#0E9C74] flex items-center gap-1.5">
              <Cpu size={12} className="text-[#0E9C74]" /> Orchestration runtime
            </span>
            <span className="text-[#6B6E85] dark:text-[#8B8FA3] text-xs">·</span>
            <span className="text-xs text-[#6B6E85] dark:text-[#8B8FA3]">Declarative DAG Manifest v{def.version}</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-[#1B1D2A] dark:text-white tracking-tight flex items-center gap-2.5">
            <Workflow className="text-[#6D4AEB]" size={28} />
            Registered Multi-Agent Graph Architecture
          </h1>
          <p className="text-[#6B6E85] dark:text-[#8B8FA3] text-sm mt-1 max-w-2xl">
            Portable enterprise directed acyclic graph. Every node corresponds 1:1 with an intelligent micro-agent or
            deterministic rule execution gate.
          </p>
        </div>

        {/* Interactive Debugger Controls & Speed Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Speed Selector */}
          <div className="flex items-center bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(15,20,35,0.72)] border border-white/90 dark:border-white/10 rounded-xl p-1 text-xs">
            <span className="px-2 text-[#6B6E85] dark:text-[#8B8FA3] font-mono text-[11px] hidden sm:inline">Speed:</span>
            {[0.5, 1, 2].map((speed) => (
              <button
                key={speed}
                onClick={() => setSimSpeed(speed)}
                className={`px-2 py-0.5 rounded-lg font-mono font-medium transition ${
                  simSpeed === speed
                    ? 'bg-[rgba(109,74,235,0.12)] text-[#6D4AEB] border-[rgba(109,74,235,0.3)]'
                    : 'text-[#6B6E85] dark:text-[#8B8FA3] hover:text-[#1B1D2A] dark:hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Stepper Buttons (Prev, Play/Pause, Next, Reset) */}
          <div className="flex items-center gap-1.5 bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(15,20,35,0.72)] border border-white/90 dark:border-white/10 rounded-xl p-1">
            <button
              onClick={stepBackward}
              disabled={activeSimStep <= 0}
              className="p-1.5 rounded-lg text-[#6B6E85] dark:text-[#8B8FA3] hover:text-[#1B1D2A] dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
              title="Previous Step"
            >
              <SkipBack size={15} />
            </button>

            {!isSimulating ? (
              <button
                onClick={startSimulation}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#6EE7C8] via-[#B69CFF] to-[#FFAFD1] hover:opacity-95 text-[#1B1D2A] font-semibold text-xs transition flex items-center gap-1.5 shadow-[0_8px_30px_rgba(109,74,235,0.12)]"
              >
                <Play size={13} fill="currentColor" /> Simulate Flow
              </button>
            ) : (
              <button
                onClick={togglePause}
                className="px-3 py-1.5 rounded-lg bg-[rgba(109,74,235,0.15)] border border-[#6D4AEB] text-[#6D4AEB] font-semibold text-xs transition flex items-center gap-1.5"
              >
                {isPaused ? <Play size={13} fill="currentColor" /> : <Pause size={13} />}
                {isPaused ? 'Resume' : `Step ${activeSimStep + 1}/${simSequence.length}`}
              </button>
            )}

            <button
              onClick={stepForward}
              disabled={activeSimStep >= simSequence.length - 1 && isSimulating}
              className="p-1.5 rounded-lg text-[#6B6E85] dark:text-[#8B8FA3] hover:text-[#1B1D2A] dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
              title="Next Step"
            >
              <SkipForward size={15} />
            </button>

            {isSimulating && (
              <button
                onClick={resetSimulation}
                className="p-1.5 rounded-lg text-[#6B6E85] dark:text-[#8B8FA3] hover:text-[#E11D48] transition"
                title="Reset Simulation"
              >
                <RotateCcw size={14} />
              </button>
            )}
          </div>

          <button
            onClick={handleCopyManifest}
            className="p-2 rounded-xl bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 border border-white/90 dark:border-white/10 text-[#6B6E85] dark:text-[#8B8FA3] hover:text-[#1B1D2A] dark:hover:text-white transition text-xs flex items-center gap-1.5"
            title="Copy DAG JSON"
          >
            {copied ? <Check size={14} className="text-[#0E9C74]" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* Deployment & Environment Status Strip */}
      <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4 text-[#6B6E85] dark:text-[#8B8FA3]">
          <span className="flex items-center gap-1.5">
            <span className="font-medium">Pipeline:</span>
            <span className="font-mono text-[#6D4AEB] font-semibold">{def.workflow}</span>
          </span>
          <span>·</span>
          <span className="flex items-center gap-1.5">
            <span className="font-medium">Nodes:</span>
            <span className="font-mono text-[#1B1D2A] dark:text-[#E8EAF0] font-medium">{def.nodes.length} registered</span>
          </span>
          <span>·</span>
          <span className="flex items-center gap-1.5">
            <span className="font-medium">Target:</span>
            <span className="font-mono text-[#6D4AEB] font-semibold uppercase">{def.deployment.target}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full border border-[rgba(14,156,116,0.2)] bg-[rgba(14,156,116,0.06)] text-[#0E9C74] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0E9C74] animate-pulse" />
            Active Seam: lib/workflow/workflowEngine.ts
          </span>
        </div>
      </div>

      {/* Live Simulation Debugger Banner */}
      {isSimulating && (
        <div className="p-3.5 rounded-xl border border-[rgba(109,74,235,0.3)] bg-[rgba(109,74,235,0.04)] flex flex-wrap items-center justify-between gap-3 shadow-[0_8px_30px_rgba(109,74,235,0.12)] animate-fadeIn glass-card">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0E9C74] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#0E9C74]"></span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#6D4AEB]">
                  STEP {activeSimStep + 1} OF {simSequence.length}:
                </span>
                <span className="text-xs font-semibold text-[#1B1D2A] dark:text-white">
                  {selectedNode.name}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[rgba(109,74,235,0.06)] text-[#6D4AEB] border border-[rgba(109,74,235,0.15)]">
                  {selectedNode.id}
                </span>
              </div>
              <p className="text-[11px] text-[#6B6E85] dark:text-[#8B8FA3] mt-0.5">
                {isPaused
                  ? 'Simulation paused. Use Step Forward / Backward to inspect graph propagation.'
                  : `Propagating execution context at ${simSpeed}x playback rate...`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2 py-1 rounded bg-[rgba(255,255,255,0.68)] dark:bg-[rgba(15,20,35,0.72)] border border-white/90 dark:border-white/10 text-[#6D4AEB] shadow-sm">
              Type: {selectedNode.type}
            </span>
            <span className="px-2 py-1 rounded bg-[rgba(255,255,255,0.68)] dark:bg-[rgba(15,20,35,0.72)] border border-white/90 dark:border-white/10 text-[#0E9C74] shadow-sm">
              Latency: ~{Math.round(220 / simSpeed)}ms
            </span>
          </div>
        </div>
      )}

      {/* Mobile DAG View Switcher */}
      <div className="lg:hidden flex items-center bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(15,20,35,0.72)] border border-white/90 dark:border-white/10 rounded-xl p-1 text-xs gap-1">
        <button
          onClick={() => setMobileWorkflowView('graph')}
          className={`flex-1 py-2 rounded-lg font-medium transition text-center flex items-center justify-center gap-1.5 ${
            mobileWorkflowView === 'graph'
              ? 'bg-[#1B1D2A] text-white shadow-sm'
              : 'text-[#6B6E85] dark:text-[#8B8FA3] hover:text-[#1B1D2A] dark:hover:text-white'
          }`}
        >
          <GitBranch size={13} className={mobileWorkflowView === 'graph' ? 'text-white' : 'text-[#6D4AEB]'} />
          <span>DAG Nodes ({def.nodes.length})</span>
        </button>
        <button
          onClick={() => setMobileWorkflowView('inspector')}
          className={`flex-1 py-2 rounded-lg font-medium transition text-center flex items-center justify-center gap-1.5 ${
            mobileWorkflowView === 'inspector'
              ? 'bg-[#1B1D2A] text-white shadow-sm'
              : 'text-[#6B6E85] dark:text-[#8B8FA3] hover:text-[#1B1D2A] dark:hover:text-white'
          }`}
        >
          <Sparkles size={13} className={mobileWorkflowView === 'inspector' ? 'text-white' : 'text-[#6D4AEB]'} />
          <span className="truncate">Inspector: {selectedNode.name}</span>
        </button>
      </div>

      {/* Visual Interactive Graph & Node Inspector Grid */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left (7 cols): Interactive Visual Node Graph */}
        <div className={`lg:col-span-7 glass-card p-5 md:p-6 space-y-4 ${mobileWorkflowView === 'graph' ? 'block' : 'hidden lg:block'}`}>
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 pb-3">
            <h2 className="font-display font-semibold text-[#1B1D2A] dark:text-white flex items-center gap-2">
              <GitBranch size={16} className="text-[#6D4AEB]" />
              Interactive DAG Visualizer
            </h2>
            <span className="text-xs text-[#6B6E85] dark:text-[#8B8FA3]">Click any node to inspect execution schema</span>
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
                  className={`p-3.5 rounded-xl transition-all duration-200 cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? `bg-[rgba(109,74,235,0.04)] border-[#6D4AEB] shadow-[0_0_20px_rgba(109,74,235,0.1)] ring-1 ring-[rgba(109,74,235,0.2)]`
                      : 'bg-[rgba(255,255,255,0.68)] dark:bg-[rgba(15,20,35,0.72)] border border-white/90 dark:border-white/10 hover:border-[rgba(109,74,235,0.15)] dark:hover:border-[rgba(109,74,235,0.3)]'
                  } ${isSimActive ? 'ring-2 ring-[#0E9C74] animate-pulse' : ''}`}
                >
                  {isSimActive && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#0E9C74] to-[#6D4AEB] animate-shimmer" />
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[rgba(255,255,255,0.7)] dark:bg-white/5 border border-white/90 dark:border-white/10 flex items-center justify-center font-mono text-xs text-[#6B6E85] dark:text-[#8B8FA3] font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-[#1B1D2A] dark:text-white">{node.name}</h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${config.badge}`}>
                            {config.label}
                          </span>
                        </div>
                        <p className="text-xs text-[#6B6E85] dark:text-[#8B8FA3] font-mono mt-0.5">#{node.id}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {node.engine && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[rgba(109,74,235,0.06)] text-[#6D4AEB] border border-[rgba(109,74,235,0.15)] font-mono font-medium">
                          {node.engine}
                        </span>
                      )}
                      <ArrowRight size={14} className={isSelected ? 'text-[#6D4AEB]' : 'text-[#6B6E85] dark:text-[#8B8FA3]'} />
                    </div>
                  </div>

                  {node.branches && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-gray-200 dark:border-white/10">
                      {Object.entries(node.branches).map(([branchLabel, targetId]) => (
                        <span
                          key={branchLabel}
                          className="text-[10px] px-2 py-0.5 rounded bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(15,20,35,0.5)] border border-white/90 dark:border-white/10 text-[#6B6E85] dark:text-[#8B8FA3] flex items-center gap-1 font-mono shadow-sm"
                        >
                          <span className="text-[#6D4AEB] font-semibold">{branchLabel}</span>
                          <ArrowRight size={9} />
                          <span>{targetId}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {node.condition && (
                    <div className="mt-2 text-[11px] font-mono text-[#C97A00] bg-[rgba(201,122,0,0.06)] border border-[rgba(201,122,0,0.15)] rounded px-2 py-1">
                      if ({node.condition})
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right (5 cols): Deep Node Execution Inspector */}
        <div className={`lg:col-span-5 glass-card bg-[rgba(255,255,255,0.85)] dark:bg-[rgba(15,20,35,0.9)] p-5 md:p-6 space-y-5 sticky top-24 border border-[rgba(109,74,235,0.25)] ${mobileWorkflowView === 'inspector' ? 'block' : 'hidden lg:block'}`}>
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#6D4AEB] font-semibold flex items-center gap-1.5">
                <Sparkles size={12} /> Execution Node Telemetry
              </span>
              <h2 className="text-lg font-bold text-[#1B1D2A] dark:text-white mt-0.5">{selectedNode.name}</h2>
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
              <p className="text-[11px] uppercase tracking-wider text-[#6B6E85] dark:text-[#8B8FA3] font-medium mb-1">Node Identifier</p>
              <p className="font-mono text-[#6D4AEB] bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(0,0,0,0.3)] border border-white/90 dark:border-white/10 rounded-lg p-2.5 select-all">
                {selectedNode.id}
              </p>
            </div>

            {selectedNode.action && (
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#6B6E85] dark:text-[#8B8FA3] font-medium mb-1">Action Hook</p>
                <p className="font-mono text-[#0E9C74] bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(0,0,0,0.3)] border border-white/90 dark:border-white/10 rounded-lg p-2.5 select-all">
                  {selectedNode.action}
                </p>
              </div>
            )}

            {selectedNode.reads && (
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#6B6E85] dark:text-[#8B8FA3] font-medium mb-1 flex items-center gap-1.5">
                  <Database size={12} className="text-[#6D4AEB]" /> Corroborated Data Feeds
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNode.reads.map((r) => (
                    <span
                      key={r}
                      className="px-2.5 py-1 rounded-lg bg-[rgba(14,156,116,0.06)] border border-[rgba(14,156,116,0.15)] text-[#0E9C74] font-mono text-[11px]"
                    >
                      @{r}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedNode.condition && (
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#6B6E85] dark:text-[#8B8FA3] font-medium mb-1">Gate Expression</p>
                <div className="bg-[rgba(201,122,0,0.06)] border border-[rgba(201,122,0,0.15)] rounded-lg p-2.5 text-[#C97A00] font-mono leading-relaxed">
                  {selectedNode.condition}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-[11px]">
                  <div className="p-2 rounded bg-[rgba(14,156,116,0.06)] border border-[rgba(14,156,116,0.15)] text-[#0E9C74]">
                    true ➔ {selectedNode.onTrue}
                  </div>
                  <div className="p-2 rounded bg-[rgba(225,29,72,0.06)] border border-[rgba(225,29,72,0.15)] text-[#E11D48]">
                    false ➔ {selectedNode.onFalse}
                  </div>
                </div>
              </div>
            )}

            <div>
              <p className="text-[11px] uppercase tracking-wider text-[#6B6E85] dark:text-[#8B8FA3] font-medium mb-1">Next Edge Transition</p>
              <div className="bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(0,0,0,0.3)] border border-white/90 dark:border-white/10 rounded-lg p-2.5 font-mono text-[#6B6E85] dark:text-[#8B8FA3]">
                {selectedNode.next ? (
                  <span className="text-[#6D4AEB]">{selectedNode.next.join(', ')}</span>
                ) : selectedNode.branches ? (
                  <span>Dynamic Branch Table ({Object.keys(selectedNode.branches).length} routes)</span>
                ) : selectedNode.onTrue ? (
                  <span>Conditional branching</span>
                ) : (
                  <span className="text-[#0E9C74]">Terminal Leaf Node</span>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200 dark:border-white/10">
              <div className="flex items-center justify-between text-[11px] text-[#6B6E85] dark:text-[#8B8FA3] mb-2">
                <span>Production Runtime Hook</span>
                <span className="text-[#0E9C74] font-semibold">100% Non-Breaking Seam</span>
              </div>
              <p className="text-[#9599AD] text-[11px] leading-relaxed">
                When swapping to live Orchestration endpoints, invoke{' '}
                <code className="text-[#6D4AEB] font-mono">enterpro.dispatch(&quot;{selectedNode.id}&quot;)</code> inside{' '}
                <code className="text-[#6D4AEB] font-mono">lib/workflow/workflowEngine.ts</code>. All other layers remain
                untouched.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
