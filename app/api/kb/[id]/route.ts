import { NextRequest, NextResponse } from 'next/server';
import { deleteKbArticle } from '@/lib/data/enterpriseStore';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing article ID' }, { status: 400 });
    }

    deleteKbArticle(id);
    return NextResponse.json({
      success: true,
      message: `Knowledge Base article ${id} deleted successfully`,
      deletedId: id,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
