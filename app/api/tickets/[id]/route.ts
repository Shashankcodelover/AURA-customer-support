import { NextRequest, NextResponse } from 'next/server';
import { deleteTicket } from '@/lib/data/enterpriseStore';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing ticket ID' }, { status: 400 });
    }

    const result = deleteTicket(id);
    return NextResponse.json({
      success: true,
      message: `Ticket ${id} permanently deleted with cascading context integrity`,
      deletedId: id,
      cascadedCapsules: result.cascadedCapsules,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
