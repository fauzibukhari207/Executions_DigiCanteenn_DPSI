'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useSession } from '@/lib/auth/session';
import { getOrdersForSeller, updateOrderStatus } from '@/lib/data/orders';
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
  diproses: 'Diproses',
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

const FILTERS: { id: OrderStatus | 'semua'; label: string }[] = [
  { id: 'semua', label: 'Semua' },
  { id: 'menunggu-konfirmasi', label: 'Perlu Diterima' },
  { id: 'diproses', label: 'Sedang Disiapkan' },
  { id: 'siap-diambil', label: 'Siap Diambil' },
  { id: 'selesai-disajikan', label: 'Selesai' },
];

export default function PesananMasukPage() {
  const { user } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuById, setMenuById] = useState<Record<string, MenuItem>>({});
  const [filter, setFilter] = useState<OrderStatus | 'semua'>('menunggu-konfirmasi');
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    const fetchedOrders = await getOrdersForSeller(user.id);
    setOrders(fetchedOrders);

    const menuIds = Array.from(new Set(fetchedOrders.flatMap((o) => o.items.map((i) => i.menuItemId))));
    const menuItems = await getMenuItemsByIds(menuIds);
    const menuMap: Record<string, MenuItem> = {};
    menuItems.forEach((m) => {
      menuMap[m.id] = m;
    });
    setMenuById(menuMap);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Begitu ada pesanan baru masuk (atau status berubah) dari siswa
  // mana pun, halaman ini otomatis refetch -- tidak perlu refresh manual.
  useOrdersRealtime(refresh);

  if (!user) {
    return (
      <div className="max-w-container-max mx-auto px-gutter py-margin flex flex-col items-center text-center gap-6 min-h-[50vh] justify-center">
        <p className="font-mono text-label-bold uppercase text-on-surface-variant">Login dulu sebagai penjual.</p>
        <Link href="/login">
          <Button variant="primary">Masuk</Button>
        </Link>
      </div>
    );
  }

  const filteredOrders = filter === 'semua' ? orders : orders.filter((o) => o.status === filter);

  const handleAccept = async (order: Order) => {
    if (order.status === 'menunggu-konfirmasi') await updateOrderStatus(order.id, 'diproses');
    refresh();
  };

  const handleAdvance = async (order: Order) => {
    if (order.status === 'diproses') await updateOrderStatus(order.id, 'siap-diambil');
    refresh();
  };

  const handleCancel = async (order: Order) => {
    if (!window.confirm('Batalkan pesanan ini?')) return;
    await updateOrderStatus(order.id, 'dibatalkan');
    refresh();
  };

  return (
    <div className="max-w-container-max mx-auto px-gutter py-margin flex flex-col gap-margin">
      <h1 className="font-headline-lg-mobile text-headline-lg-mobile uppercase">Pesanan Masuk</h1>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`squishy whitespace-nowrap border-2 border-outline px-5 py-2 font-mono text-label-bold uppercase ${
              filter === f.id ? 'bg-secondary-container shadow-none' : 'bg-surface-container-lowest shadow-sm'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="font-mono text-label-bold uppercase text-on-surface-variant animate-pulse">Memuat pesanan...</p>
      ) : filteredOrders.length === 0 ? (
        <p className="font-mono text-label-bold uppercase text-on-surface-variant">Tidak ada pesanan di kategori ini.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="border-3 border-outline shadow-md bg-surface-container-lowest p-6 flex flex-col gap-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-label-bold uppercase">#{order.id.slice(-6).toUpperCase()}</p>
                  <p className="font-mono text-label-sm uppercase text-on-surface-variant">
                    {formatDate(order.createdAt)} · Ambil: {order.pickupTime}
                  </p>
                </div>
                <Badge tone={STATUS_TONE[order.status]}>{STATUS_LABEL[order.status]}</Badge>
              </div>

              <ul className="flex flex-col gap-1">
                {order.items.map((line, idx) => (
                  <li key={idx} className="font-body-md text-sm text-on-surface-variant">
                    {line.quantity}x {menuById[line.menuItemId]?.name ?? 'Menu tidak ditemukan'}
                    {line.selectedOptions.length > 0 && ` (${line.selectedOptions.map((o) => o.label).join(', ')})`}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-outline pt-4">
                <span className="font-mono font-bold text-primary">{formatRupiah(order.total)}</span>
                <div className="flex gap-2">
                  {order.status === 'menunggu-konfirmasi' && (
                    <>
                      <Button variant="primary" onClick={() => handleAccept(order)}>
                        ✅ Terima Pesanan
                      </Button>
                      <Button variant="danger" onClick={() => handleCancel(order)}>
                        Tolak
                      </Button>
                    </>
                  )}
                  {order.status === 'diproses' && (
                    <>
                      <Button variant="primary" onClick={() => handleAdvance(order)}>
                        Tandai Siap Diambil
                      </Button>
                      <Button variant="danger" onClick={() => handleCancel(order)}>
                        Batalkan
                      </Button>
                    </>
                  )}
                  {order.status === 'siap-diambil' && (
                    <span className="font-mono text-label-sm uppercase text-on-surface-variant">
                      Menunggu siswa check-in di meja...
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
