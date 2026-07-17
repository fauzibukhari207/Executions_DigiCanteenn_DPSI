'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import RevenueChart, { RevenuePoint } from '@/components/dashboard/RevenueChart';
import { useSession } from '@/lib/auth/session';
import { getMenuItemsBySeller } from '@/lib/data/menu';
import { getOrdersForSeller } from '@/lib/data/orders';
import { useOrdersRealtime } from '@/lib/realtime/useOrdersRealtime';
import type { MenuItem, Order } from '@/lib/types';

function formatRupiah(amount: number) {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

/** Pesanan dihitung sebagai pemasukan kalau sudah dibayar (bukan "Menunggu Pembayaran") dan tidak dibatalkan. */
function isRevenueOrder(order: Order): boolean {
  return order.status !== 'menunggu-pembayaran' && order.status !== 'dibatalkan';
}

function buildDailyRevenue(orders: Order[]): RevenuePoint[] {
  const days: RevenuePoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayRevenue = orders
      .filter((o) => isRevenueOrder(o) && new Date(o.createdAt).toDateString() === date.toDateString())
      .reduce((sum, o) => sum + o.total, 0);
    days.push({ label: DAY_LABELS[date.getDay()], revenue: dayRevenue });
  }
  return days;
}

function buildMonthlyRevenue(orders: Order[]): RevenuePoint[] {
  const months: RevenuePoint[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthRevenue = orders
      .filter((o) => {
        if (!isRevenueOrder(o)) return false;
        const d = new Date(o.createdAt);
        return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth();
      })
      .reduce((sum, o) => sum + o.total, 0);
    months.push({ label: MONTH_LABELS[date.getMonth()], revenue: monthRevenue });
  }
  return months;
}

export default function DashboardPage() {
  const { user } = useSession();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    const [items, sellerOrders] = await Promise.all([getMenuItemsBySeller(user.id), getOrdersForSeller(user.id)]);
    setMenuItems(items);
    setOrders(sellerOrders);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Begitu ada pesanan baru/berubah status, dasbor (angka & grafik)
  // otomatis update -- tidak perlu refresh manual.
  useOrdersRealtime(refresh);

  const dailyRevenue = useMemo(() => buildDailyRevenue(orders), [orders]);
  const monthlyRevenue = useMemo(() => buildMonthlyRevenue(orders), [orders]);

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

  if (user.role !== 'penjual') {
    return (
      <div className="max-w-container-max mx-auto px-gutter py-margin flex flex-col items-center text-center gap-6 min-h-[50vh] justify-center">
        <p className="font-mono text-label-bold uppercase text-on-surface-variant">
          Halaman ini khusus akun Penjual.
        </p>
        <Link href="/beranda">
          <Button variant="primary">Kembali ke Beranda</Button>
        </Link>
      </div>
    );
  }

  const todayOrders = orders.filter((o) => isToday(o.createdAt) && isRevenueOrder(o));
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === 'menunggu-konfirmasi');
  const outOfStock = menuItems.filter((m) => !m.isAvailable);

  if (isLoading) {
    return (
      <div className="max-w-container-max mx-auto px-gutter py-margin text-center">
        <p className="font-mono text-label-bold uppercase text-on-surface-variant animate-pulse">Memuat dasbor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-container-max mx-auto px-gutter py-margin flex flex-col gap-margin">
      <div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile uppercase mb-1">Dasbor {user.name}</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Ringkasan toko kantin kamu hari ini.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="border-3 border-outline shadow-md bg-secondary-container p-6 flex flex-col gap-2">
          <span className="font-mono text-label-sm uppercase">Pendapatan Hari Ini</span>
          <span className="font-headline-md text-headline-md">{formatRupiah(todayRevenue)}</span>
        </div>
        <div className="border-3 border-outline shadow-md bg-surface-container-lowest p-6 flex flex-col gap-2">
          <span className="font-mono text-label-sm uppercase text-on-surface-variant">Pesanan Hari Ini</span>
          <span className="font-headline-md text-headline-md">{todayOrders.length}</span>
        </div>
        <div className="border-3 border-outline shadow-md bg-primary-fixed p-6 flex flex-col gap-2">
          <span className="font-mono text-label-sm uppercase">Perlu Diterima</span>
          <span className="font-headline-md text-headline-md text-primary">{pendingOrders.length}</span>
        </div>
        <div className="border-3 border-outline shadow-md bg-surface-container-lowest p-6 flex flex-col gap-2">
          <span className="font-mono text-label-sm uppercase text-on-surface-variant">Menu Habis</span>
          <span className="font-headline-md text-headline-md">
            {outOfStock.length} / {menuItems.length}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Link href="/pesanan-masuk">
          <Button variant="primary">Lihat Pesanan Masuk</Button>
        </Link>
        <Link href="/kelola-menu">
          <Button variant="outline">Kelola Menu</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-margin">
        <div className="border-3 border-outline shadow-md bg-surface-container-lowest p-6">
          <h2 className="font-headline-md text-headline-md uppercase mb-4">Pemasukan 7 Hari Terakhir</h2>
          <RevenueChart data={dailyRevenue} />
        </div>
        <div className="border-3 border-outline shadow-md bg-surface-container-lowest p-6">
          <h2 className="font-headline-md text-headline-md uppercase mb-4">Pemasukan 6 Bulan Terakhir</h2>
          <RevenueChart data={monthlyRevenue} />
        </div>
      </div>

      {pendingOrders.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="font-headline-md text-headline-md uppercase">Perlu Segera Diterima</h2>
          {pendingOrders.slice(0, 3).map((order) => (
            <div
              key={order.id}
              className="border-3 border-outline shadow-sm bg-surface-container-lowest p-4 flex flex-wrap items-center justify-between gap-3"
            >
              <span className="font-mono text-label-bold uppercase">
                #{order.id.slice(-6).toUpperCase()} · {order.pickupTime}
              </span>
              <span className="font-mono font-bold text-primary">{formatRupiah(order.total)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
