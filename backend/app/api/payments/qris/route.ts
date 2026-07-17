import { NextRequest, NextResponse } from 'next/server';
import { createQrisPayment } from '@/lib/payment/xendit';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, amount } = body as { orderId?: string; amount?: number };

    if (!orderId || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'orderId dan amount (angka positif) wajib diisi.' }, { status: 400 });
    }

    const payment = await createQrisPayment(orderId, amount);
    return NextResponse.json(payment);
  } catch (error) {
    console.error('[api/payments/qris] error:', error);
    const message = error instanceof Error ? error.message : 'Gagal membuat pembayaran QRIS.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
