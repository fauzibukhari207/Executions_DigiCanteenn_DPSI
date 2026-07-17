import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface OrderItemRow {
  menuItemId: string;
  quantity: number;
}

/**
 * Dipanggil dari checkout (baik QRIS maupun Saldo) begitu pembayaran
 * sukses. Melakukan 2 hal sekaligus lewat service role (bypass RLS,
 * karena siswa memang tidak boleh punya izin RLS untuk langsung
 * mengubah data milik penjual seperti stok menu):
 * 1. Ubah status pesanan: menunggu-pembayaran -> menunggu-konfirmasi
 * 2. Kurangi stok tiap menu yang dipesan (minimal 0, tidak sampai minus)
 *
 * Idempoten: kalau dipanggil dua kali untuk order yang sama (mis.
 * klik ganda / retry jaringan), panggilan kedua tidak akan mengurangi
 * stok lagi -- dicek dari status pesanan yang sudah bukan
 * "menunggu-pembayaran".
 */
export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseAdminConfigured || !supabaseAdmin) {
      return NextResponse.json(
        { error: 'SUPABASE_SERVICE_ROLE_KEY belum diisi di .env.local. Lihat SETUP_SUPABASE_XENDIT.md.' },
        { status: 500 }
      );
    }

    const { orderId } = (await req.json()) as { orderId?: string };
    if (!orderId) {
      return NextResponse.json({ error: 'orderId wajib diisi.' }, { status: 400 });
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (orderError) throw orderError;
    if (!order) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan.' }, { status: 404 });
    }

    // Sudah pernah dikonfirmasi sebelumnya -> jangan potong stok dua kali.
    if (order.status !== 'menunggu-pembayaran') {
      return NextResponse.json({ order, alreadyConfirmed: true });
    }

    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ status: 'menunggu-konfirmasi' })
      .eq('id', orderId)
      .select()
      .single();
    if (updateError) throw updateError;

    const items = (order.items ?? []) as OrderItemRow[];
    for (const item of items) {
      const { data: menuItem } = await supabaseAdmin
        .from('menu_items')
        .select('stock')
        .eq('id', item.menuItemId)
        .maybeSingle();

      if (!menuItem) continue; // menu sudah dihapus penjual, lewati saja

      const nextStock = Math.max(0, menuItem.stock - item.quantity);
      await supabaseAdmin.from('menu_items').update({ stock: nextStock }).eq('id', item.menuItemId);
    }

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error('[api/orders/confirm-payment] error:', error);
    const message = error instanceof Error ? error.message : 'Gagal mengkonfirmasi pembayaran.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
