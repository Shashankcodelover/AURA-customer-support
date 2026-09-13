import { InvestigationResult } from '@/lib/types';

export interface Scenario {
  id: string;
  label: string;
  message: string;
  result: InvestigationResult;
}

/**
 * These four scenarios are fully scripted (not generated live) so the
 * flagship demo is 100% reliable in front of judges regardless of wifi,
 * API keys, or LLM variance. Free-text input still runs the real dynamic
 * pipeline in lib/agents/investigate.ts.
 */
export const scenarios: Scenario[] = [
  {
    id: 'duplicate-charge',
    label: '💳 Duplicate Charge',
    message:
      'I was charged twice for my subscription renewal, order ORD-4521! This is unacceptable, please fix it now.',
    result: {
      category: 'Billing',
      urgency: 'Medium',
      sentiment: 'Negative',
      steps: [
        { agent: 'Router', text: 'Executing registered workflow "aura-customer-support-pipeline v1.0" — EnterPro-compatible node graph.' },
        { agent: 'Router', text: 'Message received. Detected category: Billing · urgency: Medium · sentiment: Negative.' },
        { agent: 'Router', text: 'Matched customer profile: Ananya Rao (Pro tier, member since 2024-02-14). Handing off to Billing Agent.' },
        { agent: 'Billing', text: "Scanning order records for Ananya Rao — found order ORD-4521 flagged 'Charged Twice' on 2026-09-03." },
        { agent: 'Billing', text: 'Cross-checking billing ledger — two charges of $29.00 posted 4 minutes apart on the same card.' },
        { agent: 'Billing', text: 'Cross-checking ticket history — 1 prior related ticket (TCK-906) where duplicate charge policy was explained.' },
        { agent: 'Reasoning', text: 'Pattern detected: payment webhook retry after a gateway timeout is the likely trigger — matches a known issue pattern.' },
        { agent: 'Billing', text: 'Retrieved relevant knowledge base article: "Duplicate Subscription Charges: Causes & Refund Policy".' },
        { agent: 'Reasoning', text: 'Root cause identified: a webhook retry after a gateway timeout caused the payment to be recorded twice, even though only one charge was intended.' },
        { agent: 'Escalation', text: 'Confidence 91% — duplicate charge of $29.00 is within the auto-approval threshold (<$50). Executing refund and notifying customer.' },
      ],
      rootCause:
        'A webhook retry after a gateway timeout caused the payment to be recorded twice, even though only one charge was intended.',
      confidence: 0.91,
      decision: 'auto-resolve',
      resolutionMessage:
        "Hi Ananya, I found the issue — a payment webhook retried after a brief timeout, which caused a duplicate $29.00 charge on your Pro plan. I've refunded the extra charge immediately; you'll see it back in 3-5 business days. Sorry for the trouble!",
    },
  },
  {
    id: 'delayed-shipment',
    label: '📦 Delayed Shipment',
    message: 'My order ORD-4522 has been stuck in transit for days, where is my keyboard?!',
    result: {
      category: 'Order',
      urgency: 'High',
      sentiment: 'Negative',
      steps: [
        { agent: 'Router', text: 'Executing registered workflow "aura-customer-support-pipeline v1.0" — EnterPro-compatible node graph.' },
        { agent: 'Router', text: 'Message received. Detected category: Order · urgency: High · sentiment: Negative.' },
        { agent: 'Router', text: 'Matched customer profile: Marcus Chen (Free tier, member since 2023-11-02). Handing off to Order Agent.' },
        { agent: 'Order', text: 'Scanning order records — ORD-4522 (Wireless Keyboard, $59.00) shows no carrier scan update for 4 days.' },
        { agent: 'Order', text: 'Cross-checking ticket history — 1 open ticket (TCK-902) already logged for this delay.' },
        { agent: 'Reasoning', text: 'Pattern detected: 2 similar order issues logged system-wide in recent history (TCK-902, TCK-907) — may indicate a regional carrier disruption.' },
        { agent: 'Order', text: 'Retrieved relevant knowledge base article: "Delayed Shipments: Carrier Escalation Steps".' },
        { agent: 'Reasoning', text: 'Root cause identified: a missing carrier scan beyond 48 hours indicates a probable regional carrier disruption, not a lost package.' },
        { agent: 'Escalation', text: 'Confidence 62% — carrier trace request and goodwill discount require human approval. Building Context Capsule for human handoff.' },
      ],
      rootCause: 'A missing carrier scan beyond 48 hours indicates a probable regional carrier disruption, not a lost package.',
      confidence: 0.62,
      decision: 'escalate',
      resolutionMessage:
        "Thanks for your patience, Marcus — this needs a closer look from our logistics team. I've compiled the full case history and handed it off, so you won't need to repeat any details. Expect an update shortly.",
      contextCapsule: {
        id: 'capsule-seed-2',
        customerName: 'Marcus Chen',
        customerTier: 'Free',
        category: 'Order',
        urgency: 'High',
        sentimentTrend: [0.1, -0.3, -0.6],
        rootCause: 'A missing carrier scan beyond 48 hours indicates a probable regional carrier disruption, not a lost package.',
        confidence: 0.62,
        attemptedActions: [
          'Scanning order records — ORD-4522 (Wireless Keyboard, $59.00) shows no carrier scan update for 4 days.',
          'Cross-checking ticket history — 1 open ticket (TCK-902) already logged for this delay.',
          'Pattern detected: 2 similar order issues logged system-wide in recent history (TCK-902, TCK-907) — may indicate a regional carrier disruption.',
        ],
        recommendedAction: 'Open a carrier trace request and issue a goodwill discount code per delay policy (KB-02).',
        originalMessage: 'My order ORD-4522 has been stuck in transit for days, where is my keyboard?!',
        createdAt: new Date().toISOString(),
      },
    },
  },
  {
    id: 'login-issue',
    label: '🔐 Login Issue',
    message: "I reset my password but I still can't log in to my account.",
    result: {
      category: 'Technical',
      urgency: 'Low',
      sentiment: 'Neutral',
      steps: [
        { agent: 'Router', text: 'Executing registered workflow "aura-customer-support-pipeline v1.0" — EnterPro-compatible node graph.' },
        { agent: 'Router', text: 'Message received. Detected category: Technical · urgency: Low · sentiment: Neutral.' },
        { agent: 'Router', text: 'Matched customer profile: Wei Lin (Free tier, member since 2025-01-05). Handing off to Technical Agent.' },
        { agent: 'Technical', text: 'No order records relevant to this issue. Checking account session logs instead.' },
        { agent: 'Technical', text: 'Cross-checking ticket history — 1 prior resolved ticket (TCK-903) with identical symptoms.' },
        { agent: 'Technical', text: 'Retrieved relevant knowledge base article: "Login Failures After Password Reset".' },
        { agent: 'Reasoning', text: 'Root cause identified: a stale session token cached client-side is blocking login immediately after the password reset.' },
        { agent: 'Escalation', text: 'Confidence 88% — well within the auto-resolve threshold. Executing fix and notifying customer.' },
      ],
      rootCause: 'A stale session token cached client-side is blocking login immediately after the password reset.',
      confidence: 0.88,
      decision: 'auto-resolve',
      resolutionMessage:
        "Hi Wei, this is a known hiccup — your browser cached an old session token right after the password reset. I've cleared it server-side, so a fresh login should work now. If it still doesn't, try an incognito window!",
    },
  },
  {
    id: 'cancel-subscription',
    label: '⚠️ Cancel Subscription',
    message:
      "I'm extremely frustrated with the constant billing issues, I want to cancel my enterprise subscription immediately.",
    result: {
      category: 'Billing',
      urgency: 'High',
      sentiment: 'Negative',
      steps: [
        { agent: 'Router', text: 'Executing registered workflow "aura-customer-support-pipeline v1.0" — EnterPro-compatible node graph.' },
        { agent: 'Router', text: 'Message received. Detected category: Billing · urgency: High · sentiment: Negative.' },
        { agent: 'Router', text: 'Matched customer profile: Priya Nair (Enterprise tier, member since 2022-06-30). Handing off to Billing Agent.' },
        { agent: 'Billing', text: 'Scanning order records — active Enterprise License ORD-4524 ($4,800.00/yr), renewed 2026-01-10.' },
        { agent: 'Billing', text: 'Cross-checking ticket history — 2 prior billing tickets on this account in the last 90 days.' },
        { agent: 'Reasoning', text: 'Pattern detected: repeated billing friction on a high-value Enterprise account — elevated churn risk.' },
        { agent: 'Billing', text: 'Retrieved relevant knowledge base article: "Subscription Cancellation & Retention Flow".' },
        { agent: 'Reasoning', text: 'Root cause identified: recurring billing friction, not a product issue, is driving cancellation intent on a high-value account.' },
        { agent: 'Escalation', text: 'Confidence 55% — high-value Enterprise cancellation with churn risk requires human judgment. Building Context Capsule for immediate human handoff.' },
      ],
      rootCause: 'Recurring billing friction, not a product issue, is driving cancellation intent on a high-value account.',
      confidence: 0.55,
      decision: 'escalate',
      resolutionMessage:
        "Thanks for speaking up, Priya — I'm connecting you with a senior account manager right away rather than processing this automatically, since I want to make sure we actually address what's been going wrong.",
      contextCapsule: {
        id: 'capsule-seed-4',
        customerName: 'Priya Nair',
        customerTier: 'Enterprise',
        category: 'Billing',
        urgency: 'High',
        sentimentTrend: [-0.1, -0.4, -0.7],
        rootCause: 'Recurring billing friction, not a product issue, is driving cancellation intent on a high-value account.',
        confidence: 0.55,
        attemptedActions: [
          'Scanning order records — active Enterprise License ORD-4524 ($4,800.00/yr), renewed 2026-01-10.',
          'Cross-checking ticket history — 2 prior billing tickets on this account in the last 90 days.',
          'Pattern detected: repeated billing friction on a high-value Enterprise account — elevated churn risk.',
        ],
        recommendedAction:
          'Offer a retention conversation before processing cancellation — high churn-risk signals on a $4,800/yr Enterprise account (KB-06).',
        originalMessage:
          "I'm extremely frustrated with the constant billing issues, I want to cancel my enterprise subscription immediately.",
        createdAt: new Date().toISOString(),
      },
    },
  },
];
