import { NextRequest, NextResponse } from 'next/server';
import { deleteCapsule } from '@/lib/data/enterpriseStore';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing capsule ID' }, { status: 400 });
    }

    deleteCapsule(id);
    return NextResponse.json({
      success: true,
      message: `Context Capsule ${id} permanently removed with audit trail purged`,
      deletedId: id,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
