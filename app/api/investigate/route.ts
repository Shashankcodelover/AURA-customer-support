import { NextResponse } from 'next/server';
import { runInvestigation } from '@/lib/agents/investigate';
import { scenarios } from '@/lib/agents/scenarios';
import { ConversationTurn } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { message, scenarioId, imageDataUrl, history } = body ?? {};
    const conversationHistory: ConversationTurn[] = Array.isArray(history) ? history : [];

    if (scenarioId) {
      const scenario = scenarios.find((s) => s.id === scenarioId);
      if (scenario) {
        const payload = {
          ...scenario.result,
          contextCapsule: scenario.result.contextCapsule
            ? {
                ...scenario.result.contextCapsule,
                id: `capsule-${Date.now()}`,
                createdAt: new Date().toISOString(),
              }
            : undefined,
        };
        return NextResponse.json(payload);
      }
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'A message or scenarioId is required.' }, { status: 400 });
    }

    const result = await runInvestigation(
      message,
      typeof imageDataUrl === 'string' ? imageDataUrl : undefined,
      conversationHistory
    );
    return NextResponse.json(result);
  } catch (err) {
    console.error('Investigation error:', err);
    return NextResponse.json({ error: 'Investigation failed. Please try again.' }, { status: 500 });
  }
}
