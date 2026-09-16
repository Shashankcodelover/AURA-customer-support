import { NextRequest, NextResponse } from 'next/server';
import { bulkAddKbArticles, parseCSV } from '@/lib/data/enterpriseStore';
import { KBArticle } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let parsedArticles: KBArticle[] = [];

    if (contentType.includes('application/json')) {
      const body = await req.json();
      const items = Array.isArray(body) ? body : body.articles || [];
      parsedArticles = items.map((item: any, idx: number) => ({
        id: item.id || `kb-batch-${Date.now()}-${idx}`,
        title: item.title || 'Knowledge Base Documentation',
        category: item.category || 'Technical',
        content: item.content || 'Detailed resolution manual article',
        tags: Array.isArray(item.tags)
          ? item.tags
          : (item.tags || 'support,guide').split(',').map((t: string) => t.trim()),
      }));
    } else {
      const rawText = await req.text();
      const rows = parseCSV(rawText);
      parsedArticles = rows.map((r, idx) => ({
        id: r.id || `kb-csv-${Date.now()}-${idx}`,
        title: r.title || 'CSV Ingested Document',
        category: r.category || 'Technical',
        content: r.content || 'Documentation body ingested via CSV pipeline',
        tags: r.tags ? r.tags.split(';').map((t) => t.trim()) : ['batch', 'support'],
      }));
    }

    if (parsedArticles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid KB Article records found in payload' },
        { status: 400 }
      );
    }

    const result = bulkAddKbArticles(parsedArticles);
    return NextResponse.json({
      success: true,
      message: `Successfully ingested ${result.added} Knowledge Base articles into self-learning index`,
      addedCount: result.added,
      totalCount: result.total,
      articles: parsedArticles.slice(0, 5),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
