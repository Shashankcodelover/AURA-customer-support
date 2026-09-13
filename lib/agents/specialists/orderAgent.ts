import { Specialist, SpecialistContext, SpecialistOutput } from './types';

/**
 * Order Agent — independently callable specialist module.
 * Focus: shipping, delivery, fulfillment. Prioritizes order `status` and
 * `date` (how stale is the shipment) as its core risk signal — a concern
 * the billing/technical/account agents don't model at all.
 */
async function investigate(ctx: SpecialistContext): Promise<SpecialistOutput> {
  const { customerOrders, retrieval } = ctx;
  const steps: SpecialistOutput['steps'] = [];

  const delayedOrders = customerOrders.filter((o) => /delay|transit|stuck|missing/i.test(o.status));
  if (delayedOrders.length) {
    const order = delayedOrders[0];
    const daysSince = Math.max(0, Math.round((Date.now() - new Date(order.date).getTime()) / 86400000));
    steps.push({
      agent: 'Order',
      text: `Checking carrier/fulfillment status for ${order.id} — flagged "${order.status}", last update ${daysSince} day(s) ago.`,
    });
    if (daysSince >= 3) {
      steps.push({
        agent: 'Order',
        text: `Shipment has been stale for ${daysSince} days — this exceeds the normal carrier-scan window, treating as a fulfillment failure rather than routine transit delay.`,
      });
    }
  } else if (customerOrders.length) {
    steps.push({
      agent: 'Order',
      text: `Order records look normal (${customerOrders[0].status}) — checking whether the complaint concerns a different, unlisted order.`,
    });
  }

  const orderMatch = retrieval.find((r) => r.source === 'Order Record');
  if (orderMatch) {
    steps.push({
      agent: 'Order',
      text: `Cross-referenced order record: "${orderMatch.title}".`,
    });
  }

  const wrongItemPrecedent = retrieval.find(
    (r) => r.source === 'Resolved Ticket' && /wrong item|replacement/i.test(r.text)
  );
  if (wrongItemPrecedent) {
    steps.push({
      agent: 'Order',
      text: `Found precedent for similar fulfillment issue: "${wrongItemPrecedent.title}".`,
    });
  }

  const highValueDelay = delayedOrders.some((o) => o.amount > 100);

  return {
    steps,
    focusHint:
      'Focus on concrete shipment status and a specific next step (reship, refund, or carrier escalation) — vague "we are looking into it" is not acceptable for a stuck order.',
    riskAdjustment: highValueDelay ? -0.1 : 0,
  };
}

export const orderAgent: Specialist = { agentName: 'Order', investigate };
