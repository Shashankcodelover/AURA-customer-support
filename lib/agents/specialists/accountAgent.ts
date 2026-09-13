import { Specialist, SpecialistContext, SpecialistOutput } from './types';

/**
 * Account Agent — independently callable specialist module.
 * Focus: ownership, profile, and identity changes. Prioritizes customer
 * `tier` and treats identity/ownership changes as inherently higher-risk
 * than other categories, regardless of KB match confidence.
 */
async function investigate(ctx: SpecialistContext): Promise<SpecialistOutput> {
  const { customer, message, customerTickets, retrieval } = ctx;
  const steps: SpecialistOutput['steps'] = [];

  steps.push({
    agent: 'Account',
    text: `Verifying identity — ${customer.name} is on the ${customer.tier} tier, member since ${customer.joinDate}.`,
  });

  const isOwnershipChange = /transfer|delete my account|change email|ownership/i.test(message);
  if (isOwnershipChange) {
    steps.push({
      agent: 'Account',
      text: 'Request involves an ownership/identity change — flagging for mandatory verification step regardless of confidence score.',
    });
  }

  const priorAccountTickets = customerTickets.filter((t) => t.category === 'Account');
  if (priorAccountTickets.length) {
    steps.push({
      agent: 'Account',
      text: `Found ${priorAccountTickets.length} prior account-related ticket(s) for context.`,
    });
  }

  const kbMatch = retrieval.find((r) => r.source === 'Knowledge Base');
  if (kbMatch) {
    steps.push({
      agent: 'Account',
      text: `Referencing account policy: "${kbMatch.title}".`,
    });
  }

  return {
    steps,
    focusHint:
      'Focus on verification/security steps taken and what the customer needs to confirm — identity-sensitive requests should never sound fully automatic.',
    riskAdjustment: isOwnershipChange ? -0.2 : 0,
  };
}

export const accountAgent: Specialist = { agentName: 'Account', investigate };
