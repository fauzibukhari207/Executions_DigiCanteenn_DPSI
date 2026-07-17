'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useSession } from '@/lib/auth/session';
import { getOrdersByStudent } from '@/lib/data/orders';
import { hasRatedOrder } from '@/lib/data/ratings';
import { getMenuItemsByIds } from '@/lib/data/menu';
import { useOrdersRealtime } from '@/lib/realtime/useOrdersRealtime';
import type { Order, OrderStatus, MenuItem } from '@/lib/types';

function formatRupiah(amount: number) {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  'menunggu-pembayaran': 'Menunggu Pembayaran',
  'menunggu-konfirmasi': 'Menunggu Konfirmasi',
  diproses: 'Sedang Disiapkan',
  'siap-diambil': 'Siap Diambil',
  'selesai-disajikan': 'Selesai Disajikan',
  dibatalkan: 'Dibatalkan',
};

const STATUS_TONE: Record<OrderStatus, 'neutral' | 'secondary' | 'primary' | 'tertiary' | 'error'> = {
  'menunggu-pembayaran': 'neutral',
  'menunggu-konfirmasi': 'error',
  diproses: 'secondary',
  'siap-diambil': 'primary',
  'selesai-disajikan': 'tertiary',
  dibatalkan: 'error',
};

export default function RiwayatPesananPage() {
  const { user } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuById, setMenuById] = useState<Record<string, MenuItem>>({});
  const [ratedOrderIds, setRatedOrderIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    const fetchedOrders = await getOrdersByStudent(user.id);
    setOrders(fetchedOrders);

    const menuIds = Array.from(new Set(fetchedOrders.flatMap((o) => o.items.map((i) => i.menuItemId))));
    const menuItems = await getMenuItemsByIds(menuIds);
    const menuMap: Record<string, MenuItem> = {};
    menuItems.forEach((m) => {
      menuMap[m.id] = m;
    });
    setMenuById(menuMap);

    const servedOrders = fetchedOrders.filter((o) => o.status === 'selesai-disajikan');
    const ratedChecks = await Promise.all(
      servedOrders.map(async (o) => ({ id: o.id, rated: await hasRatedOrder(o.id, user.id) }))
    );
    setRatedOrderIds(new Set(ratedChecks.filter((r) => r.rated).map((r) => r.id)));

    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Begitu status pesanan berubah (mis. penjual menandai "Siap
  // Diambil"), halaman ini otomatis update -- tidak perlu refresh manual.
  useOrdersRealtime(refresh);

  if (!user) {
    return (
      <div className="max-w-container-max mx-auto px-gutter py-margin flex flex-col items-center text-center gap-6 min-h-[50vh] justify-center">
        <p className="font-mono text-label-bold uppercase text-on-surface-variant">
          Login dulu untuk lihat riwayat pesanan.
        </p>
        <Link href="/login">
          <Button variant="primary">Masuk</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-container-max mx-auto px-gutter py-margin flex flex-col gap-margin">
      <h1 className="font-headline-lg-mobile text-headline-lg-mobile uppercase">Riwayat Pesanan</h1>

      {isLoading ? (
        <p className="font-mono text-label-bold uppercase text-on-surface-variant animate-pulse">Memuat riwayat...</p>
      ) : orders.length === 0 ? (
        <div className="border-3 border-outline shadow-md p-10 flex flex-col items-center gap-4 text-center bg-surface-container-lowest">
          <span className="text-5xl" aria-hidden>
            🧾
          </span>
          <p className="font-mono text-label-bold uppercase text-on-surface-variant">Belum ada pesanan.</p>
          <Link href="/menu">
            <Button variant="primary">Pesan Sekarang</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const alreadyRated = order.status === 'selesai-disajikan' && ratedOrderIds.has(order.id);
            return (
              <div key={order.id} className="border-3 border-outline shadow-md bg-surface-container-lowest p-6 flex flex-col gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-label-bold uppercase">#{order.id.slice(-6).toUpperCase()}</p>
                    <p className="font-mono text-label-sm uppercase text-on-surface-variant">{formatDate(order.createdAt)}</p>
                  </div>
                  <Badge tone={STATUS_TONE[order.status]}>{STATUS_LABEL[order.status]}</Badge>
                </div>

                <ul className="flex flex-col gap-1">
                  {order.items.map((line, idx) => (
                    <li key={idx} className="font-body-md text-sm text-on-surface-variant">
                      {line.quantity}x {menuById[line.menuItemId]?.name ?? 'Menu tidak ditemukan'}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-outline pt-4">
                  <span className="font-mono font-bold text-primary">{formatRupiah(order.total)}</span>
                  {order.status === 'selesai-disajikan' && !alreadyRated && (
                    <Link href={`/rating/${order.id}`}>
                      <Button variant="secondary">Beri Rating</Button>
                    </Link>
                  )}
                  {alreadyRated && (
                    <span className="font-mono text-label-sm uppercase text-on-surface-variant">
                      ✓ Sudah dirating
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
