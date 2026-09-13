import { qwenComplete } from './qwen';

export interface ClassificationResult {
  category: 'Billing' | 'Technical' | 'Order' | 'Account' | 'General';
  urgency: 'Low' | 'Medium' | 'High';
  sentiment: 'Positive' | 'Neutral' | 'Negative';
}

const KEYWORDS: Record<string, string[]> = {
  Billing: [
    'charge', 'charged', 'bill', 'billing', 'refund', 'payment', 'invoice',
    'subscription', 'price', 'renew', 'cancel my plan', 'cancel subscription',
  ],
  Order: [
    'order', 'shipment', 'shipping', 'delivery', 'package', 'tracking',
    'delayed', 'shipped', 'arrive', 'courier',
  ],
  Account: [
    'account', 'profile', 'ownership', 'transfer', 'delete my account',
    'email address', 'username',
  ],
  Technical: [
    'error', 'bug', 'crash', 'not working', 'login', 'log in', 'password',
    'app', 'website', 'loading', 'broken',
  ],
};

const NEGATIVE_WORDS = [
  'angry', 'frustrated', 'terrible', 'worst', 'hate', 'disappointed',
  'unacceptable', 'furious', 'ridiculous', 'awful', 'still', 'again',
];
const URGENT_WORDS = ['urgent', 'immediately', 'asap', 'right now', 'cancel', 'refund me', 'furious', 'now'];
const POSITIVE_WORDS = ['thanks', 'thank you', 'great', 'please', 'appreciate', 'good'];

export function classifyMessage(message: string): ClassificationResult {
  const text = message.toLowerCase();

  let bestCategory: ClassificationResult['category'] = 'General';
  let bestScore = 0;
  (Object.keys(KEYWORDS) as Array<keyof typeof KEYWORDS>).forEach((cat) => {
    const score = KEYWORDS[cat].filter((kw) => text.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestCategory = cat as ClassificationResult['category'];
    }
  });

  const negativeHits = NEGATIVE_WORDS.filter((w) => text.includes(w)).length;
  const positiveHits = POSITIVE_WORDS.filter((w) => text.includes(w)).length;
  const exclamations = (text.match(/!/g) || []).length;

  let sentiment: ClassificationResult['sentiment'] = 'Neutral';
  if (negativeHits > positiveHits) sentiment = 'Negative';
  else if (positiveHits > negativeHits) sentiment = 'Positive';

  const urgentHits = URGENT_WORDS.filter((w) => text.includes(w)).length;
  let urgency: ClassificationResult['urgency'] = 'Low';
  if (urgentHits >= 2 || exclamations >= 2 || (sentiment === 'Negative' && urgentHits >= 1)) {
    urgency = 'High';
  } else if (urgentHits === 1 || sentiment === 'Negative') {
    urgency = 'Medium';
  }

  return { category: bestCategory, urgency, sentiment };
}

export async function classifyWithQwen(message: string): Promise<ClassificationResult | null> {
  const prompt = `Classify this customer support message. Respond ONLY with compact JSON, no other text: {"category": one of ["Billing","Technical","Order","Account","General"], "urgency": one of ["Low","Medium","High"], "sentiment": one of ["Positive","Neutral","Negative"]}.\n\nMessage: """${message}"""`;

  const raw = await qwenComplete(prompt);
  if (!raw) return null;

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.category || !parsed.urgency || !parsed.sentiment) return null;
    return parsed as ClassificationResult;
  } catch {
    return null;
  }
}
