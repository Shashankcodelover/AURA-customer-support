import { NextRequest, NextResponse } from 'next/server';
import { bulkAddTickets, parseCSV } from '@/lib/data/enterpriseStore';
import { Ticket } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let parsedTickets: Ticket[] = [];

    if (contentType.includes('application/json')) {
      const body = await req.json();
      const items = Array.isArray(body) ? body : body.tickets || [];
      parsedTickets = items.map((item: any, idx: number) => ({
        id: item.id || `tick-batch-${Date.now()}-${idx}`,
        customerId: item.customerId || item.customerName || item.customer || 'cust-generic',
        category: item.category || 'Technical',
        subject: item.subject || item.title || 'Support Ingestion Ticket',
        status: item.status || 'Open',
        date: item.date || new Date().toISOString(),
        sentiment: item.sentiment || 'Neutral',
        resolutionSummary: item.resolutionSummary || item.resolution,
      }));
    } else {
      // Treat as raw CSV text
      const rawText = await req.text();
      const rows = parseCSV(rawText);
      parsedTickets = rows.map((r, idx) => ({
        id: r.id || `tick-csv-${Date.now()}-${idx}`,
        customerId: r.customerId || r.customerName || r.customer || 'cust-generic',
        category: (r.category as any) || 'Technical',
        subject: r.subject || r.title || 'CSV Batch Ticket',
        status: (r.status as any) || 'Open',
        date: r.date || new Date().toISOString(),
        sentiment: (r.sentiment as any) || 'Neutral',
        resolutionSummary: r.resolutionSummary,
      }));
    }

    if (parsedTickets.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid ticket records found in payload' },
        { status: 400 }
      );
    }

    const result = bulkAddTickets(parsedTickets);
    return NextResponse.json({
      success: true,
      message: `Successfully ingested ${result.added} tickets into active telemetry store`,
      addedCount: result.added,
      totalCount: result.total,
      tickets: parsedTickets.slice(0, 10),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
