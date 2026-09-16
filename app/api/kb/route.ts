import { NextRequest, NextResponse } from 'next/server';
import { getKbArticles, addKbArticle } from '@/lib/data/enterpriseStore';
import { KBArticle } from '@/lib/types';

export async function GET() {
  try {
    const articles = getKbArticles();
    return NextResponse.json({ success: true, count: articles.length, articles });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title || !body.content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, content' },
        { status: 400 }
      );
    }

    const newArticle: KBArticle = {
      id: body.id || `kb-${Date.now()}`,
      title: body.title,
      category: body.category || 'General',
      content: body.content,
      tags: Array.isArray(body.tags) ? body.tags : (body.tags || '').split(',').map((t: string) => t.trim()),
    };

    const saved = addKbArticle(newArticle);
    return NextResponse.json({ success: true, article: saved }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
