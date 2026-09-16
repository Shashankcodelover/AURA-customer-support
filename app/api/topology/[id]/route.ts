import { NextRequest, NextResponse } from 'next/server';
import { deleteCorridor, getMeshMetrics } from '@/lib/data/enterpriseStore';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing corridor ID' }, { status: 400 });
    }

    deleteCorridor(id);
    const metrics = getMeshMetrics();
    return NextResponse.json({
      success: true,
      message: `Agent corridor ${id} severed and de-allocated from live routing mesh`,
      severedId: id,
      metrics,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
