import { NextRequest, NextResponse } from 'next/server';
import { getCapsules, addCapsule } from '@/lib/data/enterpriseStore';
import { ContextCapsule } from '@/lib/types';

export async function GET() {
  try {
    const capsules = getCapsules();
    return NextResponse.json({ success: true, count: capsules.length, capsules });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.customerName || !body.rootCause) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: customerName, rootCause' },
        { status: 400 }
      );
    }

    const newCapsule: ContextCapsule = {
      id: body.id || `capsule-${Date.now()}`,
      customerName: body.customerName,
      customerTier: body.customerTier || 'Enterprise',
      category: body.category || 'Technical',
      urgency: body.urgency || 'High',
      sentimentTrend: body.sentimentTrend || [50, 40, 30, 20],
      rootCause: body.rootCause,
      confidence: body.confidence ?? 95,
      attemptedActions: body.attemptedActions || ['Autonomous AI classification completed'],
      recommendedAction: body.recommendedAction || 'Supervisor review required',
      originalMessage: body.originalMessage || body.message || 'Escalated incident payload',
      createdAt: body.createdAt || new Date().toISOString(),
    };

    const saved = addCapsule(newCapsule);
    return NextResponse.json({ success: true, capsule: saved }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
