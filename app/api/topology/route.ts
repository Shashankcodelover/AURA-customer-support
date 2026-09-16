import { NextRequest, NextResponse } from 'next/server';
import { getCorridors, addCorridor, getMeshMetrics } from '@/lib/data/enterpriseStore';
import { AgentCorridor } from '@/lib/types';

export async function GET() {
  try {
    const corridors = getCorridors();
    const metrics = getMeshMetrics();
    return NextResponse.json({ success: true, count: corridors.length, corridors, metrics });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.sourceAgent || !body.targetAgent) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: sourceAgent, targetAgent' },
        { status: 400 }
      );
    }

    const newCorridor: AgentCorridor = {
      id: body.id || `corridor-${Date.now()}`,
      sourceAgent: body.sourceAgent,
      targetAgent: body.targetAgent,
      protocol: body.protocol || 'gRPC',
      latencyMs: Number(body.latencyMs) || 15,
      slaTargetMs: Number(body.slaTargetMs) || 50,
      status: body.status || 'ACTIVE',
      throughputTokPerSec: Number(body.throughputTokPerSec) || 1200,
      routeTier: body.routeTier || 'Enterprise',
      description: body.description || `${body.sourceAgent} to ${body.targetAgent} routing corridor`,
      createdAt: body.createdAt || new Date().toISOString(),
    };

    const saved = addCorridor(newCorridor);
    const metrics = getMeshMetrics();
    return NextResponse.json({ success: true, corridor: saved, metrics }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
