import { NextRequest, NextResponse } from 'next/server';
import { getTickets, addTicket } from '@/lib/data/enterpriseStore';
import { Ticket } from '@/lib/types';

export async function GET() {
  try {
    const tickets = getTickets();
    return NextResponse.json({ success: true, count: tickets.length, tickets });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.customerId || !body.subject || !body.category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: customerId, subject, category' },
        { status: 400 }
      );
    }

    const newTicket: Ticket = {
      id: body.id || `tick-${Date.now()}`,
      customerId: body.customerId,
      category: body.category,
      subject: body.subject,
      status: body.status || 'Open',
      date: body.date || new Date().toISOString(),
      sentiment: body.sentiment || 'Neutral',
      resolutionSummary: body.resolutionSummary,
    };

    const saved = addTicket(newTicket);
    return NextResponse.json({ success: true, ticket: saved }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
