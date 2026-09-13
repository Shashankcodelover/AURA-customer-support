import workflowDefinition from './enterpro.workflow.json';

/**
 * ── EnterPro INTEGRATION SEAM ───────────────────────────────────────
 * This is the single file that changes when real EnterPro credentials
 * and SDK docs become available. Every other file in the app only ever
 * imports from here — never from a hypothetical EnterPro SDK directly —
 * so wiring in the real platform is a localized change, not a rewrite.
 *
 * Today: `getWorkflowDefinition()` reads the local, portable workflow
 * graph in `enterpro.workflow.json`, and the actual node logic runs via
 * the hand-written pipeline in `lib/agents/investigate.ts` (Router ->
 * Specialist -> Reasoning -> Escalation), which mirrors this graph
 * exactly - every node id in the JSON has a matching step in that file.
 *
 * Once you have EnterPro's docs, this is the checklist:
 *   1. npm install <enterpro-sdk-package>
 *   2. Replace the body of `getWorkflowDefinition()` to register/fetch
 *      this same graph from EnterPro instead of reading the local file.
 *   3. Replace `runNode()` so each node id dispatches to EnterPro's
 *      execution API instead of calling the local function directly.
 *   4. Everything downstream (UI, API routes, types) is unaffected -
 *      they only ever call the functions exported from this file.
 */

export interface WorkflowNode {
  id: string;
  type: string;
  name: string;
  engine?: string;
  action?: string;
  next?: string[];
  branches?: Record<string, string>;
  condition?: string;
  onTrue?: string;
  onFalse?: string;
  reads?: string[];
}

export function getWorkflowDefinition() {
  return workflowDefinition as {
    workflow: string;
    version: string;
    description: string;
    nodes: WorkflowNode[];
    deployment: { target: string; status: string; note: string };
  };
}

export function describeNode(nodeId: string): WorkflowNode | null {
  const def = getWorkflowDefinition();
  return def.nodes.find((n) => n.id === nodeId) ?? null;
}

/** Human-readable one-line summary of the graph, used in the live reasoning trace. */
export function getWorkflowSummary(): string {
  const def = getWorkflowDefinition();
  return `${def.workflow} v${def.version}`;
}
