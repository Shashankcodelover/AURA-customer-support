import { getWorkflowDefinition } from '@/lib/workflow/workflowEngine';
import { Workflow, ArrowRight, GitBranch } from 'lucide-react';

const TYPE_STYLES: Record<string, string> = {
  agent: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200',
  branch: 'border-violet-500/30 bg-violet-500/10 text-violet-200',
  decision: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  action: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  human_task: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
};

export default function WorkflowPage() {
  const def = getWorkflowDefinition();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold mb-1 flex items-center gap-2">
          <Workflow size={22} className="text-cyan-400" /> Registered Workflow Definition
        </h1>
        <p className="text-gray-400 text-sm max-w-2xl">{def.description}</p>
      </div>

      <div className="glass-card p-5 flex flex-wrap items-center gap-4 text-sm">
        <span className="text-gray-400">
          Workflow: <span className="text-white font-mono">{def.workflow}</span>
        </span>
        <span className="text-gray-400">
          Version: <span className="text-white font-mono">{def.version}</span>
        </span>
        <span
          className={`px-2.5 py-1 rounded-full text-xs border ${
            def.deployment.status === 'pending-sponsor-credentials'
              ? 'border-amber-500/30 bg-amber-500/10 text-amber-200'
              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
          }`}
        >
          Deployment target: {def.deployment.target} · {def.deployment.status}
        </span>
      </div>

      <div className="glass-card p-5 space-y-3">
        <h2 className="font-display font-semibold flex items-center gap-2 mb-2">
          <GitBranch size={16} className="text-gray-400" /> Node Graph
        </h2>
        {def.nodes.map((node) => (
          <div key={node.id} className="border-b border-white/5 pb-3 last:border-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`text-xs px-2 py-0.5 rounded-full border ${TYPE_STYLES[node.type] ?? 'border-white/10 text-gray-400'}`}>
                {node.type}
              </span>
              <span className="font-medium text-gray-100">{node.name}</span>
              <span className="text-xs text-gray-500 font-mono">#{node.id}</span>
              {node.engine && <span className="text-xs text-gray-500">engine: {node.engine}</span>}
            </div>
            {node.action && <p className="text-xs text-gray-500 ml-1">action: {node.action}</p>}
            {node.condition && <p className="text-xs text-gray-500 ml-1">condition: {node.condition}</p>}
            {node.branches && (
              <div className="flex flex-wrap gap-2 mt-1 ml-1">
                {Object.entries(node.branches).map(([label, target]) => (
                  <span key={label} className="text-xs text-gray-400 flex items-center gap-1">
                    {label} <ArrowRight size={10} /> {target}
                  </span>
                ))}
              </div>
            )}
            {node.next && (
              <p className="text-xs text-gray-500 ml-1 flex items-center gap-1 mt-1">
                <ArrowRight size={10} /> {node.next.join(', ')}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="glass-card p-5 text-sm text-gray-400">
        <p className="mb-2 text-gray-300 font-medium">{def.deployment.note}</p>
        <p className="text-xs text-gray-500">
          See <code className="text-gray-400">lib/workflow/workflowEngine.ts</code> for the integration seam this graph runs through.
        </p>
      </div>
    </div>
  );
}
