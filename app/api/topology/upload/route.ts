import { NextRequest, NextResponse } from 'next/server';
import { bulkAddCorridors, getMeshMetrics, parseCSV } from '@/lib/data/enterpriseStore';
import { AgentCorridor } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let parsedCorridors: AgentCorridor[] = [];

    if (contentType.includes('application/json')) {
      const body = await req.json();
      const items = Array.isArray(body) ? body : body.corridors || [];
      parsedCorridors = items.map((item: any, idx: number) => ({
        id: item.id || `corridor-batch-${Date.now()}-${idx}`,
        sourceAgent: item.sourceAgent || 'Cognitive Router',
        targetAgent: item.targetAgent || 'Specialist Agent',
        protocol: item.protocol || 'gRPC',
        latencyMs: Number(item.latencyMs) || 20,
        slaTargetMs: Number(item.slaTargetMs) || 60,
        status: item.status || 'ACTIVE',
        throughputTokPerSec: Number(item.throughputTokPerSec) || 1200,
        routeTier: item.routeTier || 'Enterprise',
        description: item.description || 'Ingested routing corridor',
        createdAt: item.createdAt || new Date().toISOString(),
      }));
    } else {
      const rawText = await req.text();
      const rows = parseCSV(rawText);
      parsedCorridors = rows.map((r, idx) => ({
        id: r.id || `corridor-csv-${Date.now()}-${idx}`,
        sourceAgent: r.sourceAgent || 'Cognitive Router',
        targetAgent: r.targetAgent || 'Specialist Agent',
        protocol: (r.protocol as any) || 'gRPC',
        latencyMs: parseInt(r.latencyMs, 10) || 25,
        slaTargetMs: parseInt(r.slaTargetMs, 10) || 60,
        status: (r.status as any) || 'ACTIVE',
        throughputTokPerSec: parseInt(r.throughputTokPerSec, 10) || 1000,
        routeTier: (r.routeTier as any) || 'Enterprise',
        description: r.description || 'CSV ingested agent link',
        createdAt: r.createdAt || new Date().toISOString(),
      }));
    }

    if (parsedCorridors.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid Agent Corridor records found in payload' },
        { status: 400 }
      );
    }

    const result = bulkAddCorridors(parsedCorridors);
    const metrics = getMeshMetrics();
    return NextResponse.json({
      success: true,
      message: `Successfully provisioned ${result.added} agent corridors into live routing mesh`,
      addedCount: result.added,
      totalCount: result.total,
      corridors: parsedCorridors.slice(0, 5),
      metrics,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
