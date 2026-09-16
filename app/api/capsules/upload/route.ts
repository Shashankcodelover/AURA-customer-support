import { NextRequest, NextResponse } from 'next/server';
import { bulkAddCapsules, parseCSV } from '@/lib/data/enterpriseStore';
import { ContextCapsule } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let parsedCapsules: ContextCapsule[] = [];

    if (contentType.includes('application/json')) {
      const body = await req.json();
      const items = Array.isArray(body) ? body : body.capsules || [];
      parsedCapsules = items.map((item: any, idx: number) => ({
        id: item.id || `capsule-batch-${Date.now()}-${idx}`,
        customerName: item.customerName || item.customer || 'Enterprise Account',
        customerTier: item.customerTier || 'Enterprise',
        category: item.category || 'Technical',
        urgency: item.urgency || 'High',
        sentimentTrend: item.sentimentTrend || [60, 45, 30, 20],
        rootCause: item.rootCause || 'Ingested anomaly needing root cause verification',
        confidence: item.confidence ?? 92,
        attemptedActions: item.attemptedActions || ['Batch ingestion initialized'],
        recommendedAction: item.recommendedAction || 'Supervisor review scheduled',
        originalMessage: item.originalMessage || item.message || 'Batch incident signal',
        createdAt: item.createdAt || new Date().toISOString(),
      }));
    } else {
      const rawText = await req.text();
      const rows = parseCSV(rawText);
      parsedCapsules = rows.map((r, idx) => ({
        id: r.id || `capsule-csv-${Date.now()}-${idx}`,
        customerName: r.customerName || r.customer || 'Enterprise Account',
        customerTier: r.customerTier || 'Enterprise',
        category: r.category || 'Technical',
        urgency: (r.urgency as any) || 'High',
        sentimentTrend: r.sentimentTrend
          ? r.sentimentTrend.split(';').map(Number).filter((n) => !isNaN(n))
          : [50, 40, 30, 20],
        rootCause: r.rootCause || 'CSV ingested anomaly',
        confidence: r.confidence ? parseInt(r.confidence, 10) : 90,
        attemptedActions: r.attemptedActions ? r.attemptedActions.split(';') : ['CSV Record verified'],
        recommendedAction: r.recommendedAction || 'Review required',
        originalMessage: r.originalMessage || r.message || 'Batch imported message',
        createdAt: r.createdAt || new Date().toISOString(),
      }));
    }

    if (parsedCapsules.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid Context Capsule records found in payload' },
        { status: 400 }
      );
    }

    const result = bulkAddCapsules(parsedCapsules);
    return NextResponse.json({
      success: true,
      message: `Successfully ingested ${result.added} Context Capsules into active operations queue`,
      addedCount: result.added,
      totalCount: result.total,
      capsules: parsedCapsules.slice(0, 5),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
