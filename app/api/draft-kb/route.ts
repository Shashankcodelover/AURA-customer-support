import { NextResponse } from 'next/server';
import { qwenComplete } from '@/lib/agents/qwen';

export async function POST(req: Request) {
  try {
    const { rootCause, resolutionNote, category } = await req.json();

    const prompt = `Write a short internal knowledge base article (a title and a 2-3 sentence body) documenting this resolved support case so future agents can resolve similar issues faster.\nCategory: ${category}\nRoot cause: ${rootCause}\nHow it was resolved: ${resolutionNote || 'Resolved by a support agent.'}\nRespond ONLY as JSON, no other text: {"title": "...", "content": "..."}`;

    const raw = await qwenComplete(prompt);
    if (raw) {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          if (parsed.title && parsed.content) {
            return NextResponse.json(parsed);
          }
        } catch {
          // fall through to local template
        }
      }
    }

    return NextResponse.json({
      title: `${category}: Resolution pattern from a recent escalation`,
      content: `Root cause: ${rootCause} Resolution: ${resolutionNote || 'Resolved manually by a support agent.'} Future similar cases can reference this pattern before escalating.`,
    });
  } catch (err) {
    console.error('KB draft error:', err);
    return NextResponse.json({ error: 'Could not draft KB article.' }, { status: 500 });
  }
}
