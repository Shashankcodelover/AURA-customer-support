import { Specialist, SpecialistContext, SpecialistOutput } from './types';

/**
 * Technical Agent — independently callable specialist module.
 * Focus: bugs, crashes, login/auth failures. Prioritizes recurring-bug
 * detection across the ticket log (a signal billing/order agents don't
 * need) and treats an attached screenshot as strong evidence.
 */
async function investigate(ctx: SpecialistContext): Promise<SpecialistOutput> {
  const { customerTickets, sameCategoryTickets, retrieval, message } = ctx;
  const steps: SpecialistOutput['steps'] = [];

  const priorTechIssues = customerTickets.filter((t) => t.category === 'Technical');
  if (priorTechIssues.length) {
    steps.push({
      agent: 'Technical',
      text: `Checking device/session history — this customer has ${priorTechIssues.length} prior technical ticket(s), most recently "${priorTechIssues[0].subject}".`,
    });
  }

  const mentionsAuth = /login|log in|password|locked out|2fa|verification/i.test(message);
  if (mentionsAuth) {
    steps.push({
      agent: 'Technical',
      text: 'Message indicates an authentication-flow issue — checking for known session/token bugs before assuming user error.',
    });
  }

  if (sameCategoryTickets.length >= 2) {
    riskFlag(steps, sameCategoryTickets.length);
  }

  const kbMatch = retrieval.find((r) => r.source === 'Knowledge Base');
  if (kbMatch) {
    steps.push({
      agent: 'Technical',
      text: `Matched known-issue KB entry: "${kbMatch.title}" — checking if the documented fix applies here.`,
    });
  }

  return {
    steps,
    focusHint:
      'Focus on the concrete technical fix (what was cleared/reset/patched) and whether the customer needs to take any action on their end.',
    riskAdjustment: 0,
  };
}

function riskFlag(steps: SpecialistOutput['steps'], count: number) {
  steps.push({
    agent: 'Technical',
    text: `Recurring-bug check: ${count} similar technical issues logged system-wide — this may be a broader regression rather than an isolated report.`,
  });
}

export const technicalAgent: Specialist = { agentName: 'Technical', investigate };
