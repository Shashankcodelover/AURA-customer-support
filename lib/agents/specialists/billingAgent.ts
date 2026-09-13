import { Specialist, SpecialistContext, SpecialistOutput } from './types';

/**
 * Billing Agent — independently callable specialist module.
 * Focus: charges, refunds, invoices, subscription changes. Prioritizes
 * order `amount` as a risk signal (high-value disputes get flagged for
 * human approval rather than auto-resolved) and cross-checks billing
 * ticket history for repeat-dispute patterns.
 */
async function investigate(ctx: SpecialistContext): Promise<SpecialistOutput> {
  const { customer, customerOrders, sameCategoryTickets, retrieval, priorContactCount } = ctx;
  const steps: SpecialistOutput['steps'] = [];

  const disputedOrders = customerOrders.filter((o) =>
    /twice|duplicate|dispute|fail|declin/i.test(o.status)
  );
  const highestOrderValue = customerOrders.reduce((max, o) => Math.max(max, o.amount), 0);

  if (disputedOrders.length) {
    steps.push({
      agent: 'Billing',
      text: `Cross-referencing payment records — found ${disputedOrders.length} order(s) with a disputed/duplicate charge status, including ${disputedOrders[0].id} ($${disputedOrders[0].amount.toFixed(2)}).`,
    });
  } else {
    steps.push({
      agent: 'Billing',
      text: `No disputed-charge flags found on ${customer.name}'s payment records — checking invoice and refund policy instead.`,
    });
  }

  if (sameCategoryTickets.length >= 2) {
    steps.push({
      agent: 'Billing',
      text: `Billing dispute pattern check: ${sameCategoryTickets.length} billing tickets logged system-wide recently — evaluating whether this is an isolated case or a systemic payment-processing issue.`,
    });
  }

  const ticketMatch = retrieval.find((r) => r.source === 'Resolved Ticket');
  if (ticketMatch) {
    steps.push({
      agent: 'Billing',
      text: `Found a similar resolved billing ticket for precedent: "${ticketMatch.title}".`,
    });
  }

  let riskAdjustment = 0;
  if (highestOrderValue > 100) {
    riskAdjustment -= 0.15;
    steps.push({
      agent: 'Billing',
      text: `Order value $${highestOrderValue.toFixed(2)} exceeds the $100 auto-resolve threshold — routing toward human approval regardless of confidence.`,
    });
  }
  if (priorContactCount >= 1) {
    riskAdjustment -= 0.05;
  }

  return {
    steps,
    focusHint:
      'Focus on the exact refund/charge amount and policy basis; a billing customer needs a concrete monetary outcome, not a vague apology.',
    riskAdjustment,
  };
}

export const billingAgent: Specialist = { agentName: 'Billing', investigate };
