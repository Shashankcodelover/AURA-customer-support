import customers from '@/lib/data/customers.json';
import orders from '@/lib/data/orders.json';
import tickets from '@/lib/data/tickets.json';
import { Customer, Order, Ticket, InvestigationResult, ReasoningStep, ContextCapsule, ConversationTurn } from '@/lib/types';
import { classifyMessage, classifyWithQwen } from './classify';
import { crossSourceRetrieve } from './reasoningEngine';
import { getSpecialist } from './specialists/registry';
import { qwenComplete, qwenVisionDescribe } from './qwen';
import { getWorkflowSummary } from '@/lib/workflow/workflowEngine';

/**
 * ── ORCHESTRATION NOTE ──────────────────────────────────────────────
 * Router -> Specialist Dispatch -> Reasoning -> Escalation. The Specialist
 * step below delegates to an independent module per category (see
 * ./specialists/*.ts + registry.ts) rather than branching inline — each
 * specialist is its own file/function with its own domain logic, callable
 * and testable on its own. In a production deployment this file is the
 * seam where you'd register each step as a node in an EnterPro workflow
 * graph instead of calling them procedurally in sequence.
 * ─────────────────────────────────────────────────────────────────────
 */

function findCustomerByMessage(message: string): Customer {
  const text = message.toLowerCase();
  const all = customers as Customer[];

  const byName = all.find((c) => text.includes(c.name.toLowerCase().split(' ')[0]));
  if (byName) return byName;

  const orderIdMatch = message.match(/ORD-\d+/i);
  if (orderIdMatch) {
    const order = (orders as Order[]).find((o) => o.id.toLowerCase() === orderIdMatch[0].toLowerCase());
    if (order) {
      const owner = all.find((c) => c.id === order.customerId);
      if (owner) return owner;
    }
  }

  return all[0];
}

function sentimentToScore(s: string): number {
  if (s === 'Negative') return -0.7;
  if (s === 'Positive') return 0.6;
  return 0;
}

/** Renders prior turns into a compact block for the Qwen prompt context. */
function historyToPromptContext(history: ConversationTurn[]): string {
  if (!history.length) return 'none — this is the first message in the conversation.';
  return history
    .slice(-6) // keep prompts bounded; last 6 turns is plenty of context
    .map((h) => `${h.role === 'customer' ? 'Customer' : 'Agent'}: ${h.message}`)
    .join('\n');
}

export async function runInvestigation(
  message: string,
  imageDataUrl?: string,
  history: ConversationTurn[] = []
): Promise<InvestigationResult> {
  const priorCustomerTurns = history.filter((h) => h.role === 'customer');
  const isFollowUp = priorCustomerTurns.length > 0;
  const priorContactCount = priorCustomerTurns.length;
  const lastAgentTurn = [...history].reverse().find((h) => h.role === 'agent');

  // ── Node 1: Router Agent ──────────────────────────────────────────
  const qwenClass = await classifyWithQwen(message);
  const localClass = classifyMessage(message);
  const classification = qwenClass ?? localClass;

  const steps: ReasoningStep[] = [];
  steps.push({
    agent: 'Router',
    text: `Executing registered workflow "${getWorkflowSummary()}" — EnterPro-compatible node graph.`,
  });

  if (isFollowUp) {
    steps.push({
      agent: 'Router',
      text: `Conversation memory: this is message ${priorContactCount + 1} in an ongoing thread. Reviewing ${history.length} prior turn(s) before responding.`,
    });
  }

  steps.push({
    agent: 'Router',
    text: `Message received. Detected category: ${classification.category} · urgency: ${classification.urgency} · sentiment: ${classification.sentiment}.`,
  });

  const customer = findCustomerByMessage(message);
  const specialistName = classification.category === 'General' ? 'Technical' : classification.category;

  const isRecurringCategory = isFollowUp && lastAgentTurn?.category === specialistName;
  if (isRecurringCategory) {
    steps.push({
      agent: 'Reasoning',
      text: `Customer has now contacted support ${priorContactCount} time(s) about a ${specialistName.toLowerCase()} issue in this thread — treating as an unresolved recurring case and increasing urgency.`,
    });
  }

  steps.push({
    agent: 'Router',
    text: `Matched customer profile: ${customer.name} (${customer.tier} tier, member since ${customer.joinDate}). Handing off to ${specialistName} Agent.`,
  });

  // ── Multimodal: screenshot analysis (real vision, honest fallback) ──
  if (imageDataUrl) {
    steps.push({
      agent: specialistName,
      text: 'Screenshot attachment received — analyzing visual evidence before proceeding.',
    });
    const visionText = await qwenVisionDescribe(
      imageDataUrl,
      'Briefly describe any error messages, error codes, or UI issues visible in this screenshot in one concise sentence.'
    );
    if (visionText) {
      steps.push({ agent: specialistName, text: `Visual analysis: ${visionText.trim()}` });
    } else {
      steps.push({
        agent: specialistName,
        text: 'Visual analysis unavailable in this environment (no vision-capable API key configured) — proceeding with text-based investigation only.',
      });
    }
  }

  // ── Node 2: Specialist Agent investigation (independent module dispatch) ──
  const customerOrders = (orders as Order[]).filter((o) => o.customerId === customer.id);
  const customerTickets = (tickets as Ticket[]).filter((t) => t.customerId === customer.id);
  const sameCategoryTickets = (tickets as Ticket[]).filter((t) => t.category === specialistName);

  if (customerOrders.length) {
    steps.push({
      agent: specialistName,
      text: `Scanning order records for ${customer.name} — found ${customerOrders.length} order(s). Most recent: ${customerOrders[0].id} (${customerOrders[0].status}).`,
    });
  } else {
    steps.push({
      agent: specialistName,
      text: `No order records found for ${customer.name} in this category. Proceeding with account and ticket history.`,
    });
  }

  if (customerTickets.length) {
    steps.push({
      agent: specialistName,
      text: `Cross-checking ticket history — ${customerTickets.length} prior ticket(s) found for this customer.`,
    });
  }

  if (sameCategoryTickets.length >= 2) {
    steps.push({
      agent: 'Reasoning',
      text: `Pattern detected: ${sameCategoryTickets.length} similar ${specialistName.toLowerCase()} issues logged system-wide in recent history. This may indicate a systemic issue, not an isolated case.`,
    });
  }

  // ── Knowledge Reasoning Engine: cross-source retrieval (KB + resolved tickets + order records) ──
  const retrieval = crossSourceRetrieve(specialistName, message);
  if (retrieval.length) {
    steps.push({
      agent: 'Reasoning',
      text: `Cross-referenced ${retrieval.length} source(s): ${retrieval.map((r) => `${r.source} — "${r.title}"`).join('; ')}.`,
    });
  }

  const specialist = getSpecialist(specialistName);
  const specialistOutput = await specialist.investigate({
    message,
    customer,
    customerOrders,
    customerTickets,
    sameCategoryTickets,
    retrieval,
    isFollowUp,
    priorContactCount,
  });
  steps.push(...specialistOutput.steps);

  const kbArticle = retrieval.find((r) => r.source === 'Knowledge Base');

  // ── Node 3: Reasoning / Root-Cause Engine ─────────────────────────
  let rootCause = kbArticle
    ? kbArticle.text
    : `Unable to find a precise policy match. Flagging for deeper investigation based on ${specialistName.toLowerCase()} history.`;

  const historyContext = historyToPromptContext(history);
  const qwenRootCause = await qwenComplete(
    `You are a senior customer support root-cause analyst. ${specialistOutput.focusHint}\n\nConversation so far:\n${historyContext}\n\nLatest customer message: """${message}""". Category: ${specialistName}. Known policy/context: """${kbArticle?.text ?? 'none found'}""". In 1-2 concise sentences, state the most likely root cause of this issue in plain language.${isFollowUp ? ' Acknowledge that this is a follow-up to the earlier conversation.' : ''}`
  );
  if (qwenRootCause) rootCause = qwenRootCause.trim();

  steps.push({ agent: 'Reasoning', text: `Root cause identified: ${rootCause}` });

  let confidence = kbArticle ? 0.78 : 0.45;
  if (classification.urgency === 'High') confidence -= 0.1;
  const highValue = customerOrders.some((o) => o.amount > 100);
  if (highValue) confidence -= 0.15;
  confidence += specialistOutput.riskAdjustment;
  if (isRecurringCategory) confidence -= 0.15;
  confidence = Math.max(0.15, Math.min(0.95, confidence));

  // ── Node 4: Escalation Intelligence ───────────────────────────────
  const decision: InvestigationResult['decision'] =
    confidence >= 0.7 && !highValue && classification.urgency !== 'High' && !isRecurringCategory
      ? 'auto-resolve'
      : 'escalate';

  steps.push({
    agent: 'Escalation',
    text:
      decision === 'auto-resolve'
        ? `Confidence ${(confidence * 100).toFixed(0)}% — within auto-resolve threshold. Executing resolution and notifying customer.`
        : `Confidence ${(confidence * 100).toFixed(0)}% — ${
            isRecurringCategory
              ? 'recurring unresolved issue requires human continuity'
              : highValue
              ? 'high-value order requires human approval'
              : 'below auto-resolve threshold'
          }. Building Context Capsule for human handoff.`,
  });

  let resolutionMessage = '';
  let contextCapsule: ContextCapsule | undefined;

  if (decision === 'auto-resolve') {
    const qwenMsg = await qwenComplete(
      `Write a short, warm, 2-3 sentence customer support resolution message for this issue: """${message}""". Root cause: """${rootCause}""". ${specialistOutput.focusHint} Mention the customer's name at most once.${isFollowUp ? ' This is a follow-up message in an ongoing conversation — acknowledge that briefly.' : ''}`
    );
    resolutionMessage =
      qwenMsg?.trim() ??
      `${isFollowUp ? 'Following up on our earlier conversation — ' : ''}Thanks for flagging this — based on our records, ${rootCause.toLowerCase()} We've resolved it on our end, and you shouldn't see this issue again. Let us know if anything still feels off!`;
  } else {
    resolutionMessage = isFollowUp
      ? `Thanks for your patience — I can see this is still unresolved from our earlier conversation, so I've escalated it directly to a human agent with your full case history attached. You won't need to repeat anything.`
      : `Thanks for your patience — this needs a closer look from our support team. I've compiled the full case history and handed it off, so you won't need to repeat any details. Expect an update shortly.`;

    contextCapsule = {
      id: `capsule-${Date.now()}`,
      customerName: customer.name,
      customerTier: customer.tier,
      category: specialistName,
      urgency: classification.urgency,
      sentimentTrend: [
        ...(history.length ? [0.0] : []),
        0.1,
        sentimentToScore(classification.sentiment) * 0.6,
        sentimentToScore(classification.sentiment),
      ],
      rootCause,
      confidence,
      attemptedActions: [
        ...(isFollowUp ? [`Prior contact: ${priorContactCount} message(s) in this thread before escalation.`] : []),
        ...steps.filter((s) => s.agent === specialistName || s.agent === 'Reasoning').map((s) => s.text),
      ],
      recommendedAction: kbArticle
        ? `Apply resolution from "${kbArticle.title}" and confirm with customer.`
        : `Manual investigation required — no direct policy match found.`,
      originalMessage: message,
      createdAt: new Date().toISOString(),
    };
  }

  return {
    category: specialistName,
    urgency: classification.urgency,
    sentiment: classification.sentiment,
    steps,
    rootCause,
    confidence,
    decision,
    resolutionMessage,
    contextCapsule,
    isFollowUp,
  };
}
