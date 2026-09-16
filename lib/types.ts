export interface Customer {
  id: string;
  name: string;
  email: string;
  tier: 'Free' | 'Pro' | 'Enterprise';
  joinDate: string;
}

export interface Order {
  id: string;
  customerId: string;
  product: string;
  amount: number;
  status: string;
  date: string;
  notes?: string;
}

export interface Ticket {
  id: string;
  customerId: string;
  category: 'Billing' | 'Technical' | 'Order' | 'Account';
  subject: string;
  status: 'Resolved' | 'Escalated' | 'Open';
  date: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  resolutionSummary?: string;
}

export interface KBArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
}

export interface ReasoningStep {
  agent: string;
  text: string;
}

export type Decision = 'auto-resolve' | 'escalate';

export interface ContextCapsule {
  id: string;
  customerName: string;
  customerTier: string;
  category: string;
  urgency: 'Low' | 'Medium' | 'High';
  sentimentTrend: number[];
  rootCause: string;
  confidence: number;
  attemptedActions: string[];
  recommendedAction: string;
  originalMessage: string;
  createdAt: string;
}

export interface InvestigationResult {
  category: string;
  urgency: 'Low' | 'Medium' | 'High';
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  steps: ReasoningStep[];
  rootCause: string;
  confidence: number;
  decision: Decision;
  resolutionMessage: string;
  contextCapsule?: ContextCapsule;
  /** True when this response was generated with awareness of prior turns in the thread. */
  isFollowUp?: boolean;
}

/**
 * One turn in an ongoing support conversation. The frontend accumulates
 * these client-side (no database — see AppStateContext's architecture
 * note) and sends the running thread back on every request so the agent
 * pipeline can genuinely reference prior turns instead of treating every
 * message as a fresh, context-free case.
 */
export interface AgentCorridor {
  id: string;
  sourceAgent: string;
  targetAgent: string;
  protocol: 'HTTP/REST' | 'gRPC' | 'WebSocket' | 'Neural Stream';
  latencyMs: number;
  slaTargetMs: number;
  status: 'ACTIVE' | 'STANDBY' | 'DEGRADED';
  throughputTokPerSec: number;
  routeTier: 'Enterprise' | 'Pro' | 'Free' | 'Global';
  description?: string;
  createdAt: string;
}

export interface MeshMetrics {
  totalCorridors: number;
  activeCorridors: number;
  standbyCorridors: number;
  degradedCorridors: number;
  averageLatencyMs: number;
  totalThroughputTokSec: number;
  slaAdherencePercent: number;
}

export interface ConversationTurn {
  role: 'customer' | 'agent';
  message: string;
  category?: string;
  timestamp: string;
}
