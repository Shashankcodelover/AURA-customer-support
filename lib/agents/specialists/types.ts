import { Customer, Order, Ticket, ReasoningStep } from '@/lib/types';
import { RetrievalMatch } from '../reasoningEngine';

/**
 * Shared contract every specialist agent module implements. Each specialist
 * is an independently importable/callable/testable function in its own file
 * — this is what makes the multi-agent claim genuine rather than one
 * function branching internally: you can call, test, or swap out
 * `investigate()` from billingAgent.ts without touching technicalAgent.ts,
 * orderAgent.ts, or accountAgent.ts at all.
 */
export interface SpecialistContext {
  message: string;
  customer: Customer;
  customerOrders: Order[];
  customerTickets: Ticket[];
  sameCategoryTickets: Ticket[];
  retrieval: RetrievalMatch[];
  isFollowUp: boolean;
  priorContactCount: number;
}

export interface SpecialistOutput {
  /** Reasoning-trace steps this specialist contributes, tagged with its own agent name. */
  steps: ReasoningStep[];
  /** Extra instruction folded into the root-cause / resolution prompts sent to Qwen. */
  focusHint: string;
  /** Additive/subtractive nudge to the confidence score (domain-specific risk signal). */
  riskAdjustment: number;
}

export interface Specialist {
  agentName: 'Billing' | 'Technical' | 'Order' | 'Account';
  investigate(ctx: SpecialistContext): Promise<SpecialistOutput>;
}
