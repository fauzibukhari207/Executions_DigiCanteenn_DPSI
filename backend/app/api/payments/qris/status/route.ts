import { NextRequest, NextResponse } from 'next/server';
import { checkQrisStatus } from '@/lib/payment/xendit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const referenceId = req.nextUrl.searchParams.get('referenceId');
    if (!referenceId) {
      return NextResponse.json({ error: 'Query param "referenceId" wajib diisi.' }, { status: 400 });
    }

    const status = await checkQrisStatus(referenceId);
    return NextResponse.json({ status });
  } catch (error) {
    console.error('[api/payments/qris/status] error:', error);
    const message = error instanceof Error ? error.message : 'Gagal mengecek status pembayaran.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
