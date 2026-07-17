'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/auth/session';
import { getOrdersByStudent, getOrdersForSeller } from '@/lib/data/orders';
import { hasRatedOrder } from '@/lib/data/ratings';
import { useOrdersRealtime } from '@/lib/realtime/useOrdersRealtime';
import type { Order } from '@/lib/types';

interface NotificationItem {
  id: string;
  text: string;
  href: string;
}

/**
 * Notifikasi berbasis status pesanan (bukan sistem notifikasi push
 * penuh dengan tabel tersendiri -- untuk cakupan proyek ini, cukup
 * menurunkan notifikasi dari data pesanan yang sudah ada):
 * - Siswa: pesanan yang baru "Diterima" penjual (sedang disiapkan),
 *   yang "Siap Diambil" (ingatkan check-in), dan pesanan "Selesai
 *   Disajikan" yang belum dirating.
 * - Penjual: pesanan yang masih "Menunggu Konfirmasi" (perlu diterima).
 */
export default function NotificationBell() {
  const { user } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      if (user.role === 'siswa') {
        const orders = await getOrdersByStudent(user.id);
        const acceptedOrders = orders.filter((o: Order) => o.status === 'diproses');
        const readyOrders = orders.filter((o: Order) => o.status === 'siap-diambil');
        const servedOrders = orders.filter((o: Order) => o.status === 'selesai-disajikan');

        const unratedChecks = await Promise.all(
          servedOrders.map(async (o) => ({ order: o, rated: await hasRatedOrder(o.id, user.id) }))
        );

        const notifs: NotificationItem[] = [
          ...acceptedOrders.map((o) => ({
            id: `accepted-${o.id}`,
            text: `Pesanan #${o.id.slice(-6).toUpperCase()} diterima penjual, lagi disiapkan!`,
            href: '/pesanan',
          })),
          ...readyOrders.map((o) => ({
            id: `ready-${o.id}`,
            text: `Pesanan #${o.id.slice(-6).toUpperCase()} siap diambil! Yuk check-in di meja.`,
            href: `/meja/checkin?orderId=${o.id}`,
          })),
          ...unratedChecks
            .filter((c) => !c.rated)
            .map((c) => ({
              id: `rate-${c.order.id}`,
              text: `Yuk kasih rating untuk pesanan #${c.order.id.slice(-6).toUpperCase()}.`,
              href: `/rating/${c.order.id}`,
            })),
        ];
        setItems(notifs);
      } else {
        const orders = await getOrdersForSeller(user.id);
        const pending = orders.filter((o: Order) => o.status === 'menunggu-konfirmasi');
        setItems(
          pending.map((o) => ({
            id: `pending-${o.id}`,
            text: `Pesanan #${o.id.slice(-6).toUpperCase()} perlu diterima.`,
            href: '/pesanan-masuk',
          }))
        );
      }
    } catch (err) {
      console.error('Gagal memuat notifikasi:', err);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  // Begitu ada perubahan pesanan (masuk baru / status berubah),
  // badge notifikasi otomatis update -- tidak perlu buka-tutup dropdown.
  useOrdersRealtime(load);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => {
          setIsOpen((v) => !v);
          load();
        }}
        aria-label="Notifikasi"
        className="squishy relative w-12 h-12 flex items-center justify-center bg-surface-container-lowest border-2 border-outline shadow-sm"
      >
        <span aria-hidden>🔔</span>
        {items.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-tertiary text-on-tertiary text-[11px] font-bold h-6 w-6 border-2 border-outline flex items-center justify-center">
            {items.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-surface-container-lowest border-3 border-outline shadow-lg z-50 flex flex-col">
          <div className="border-b-2 border-outline px-4 py-3">
            <span className="font-mono text-label-bold uppercase">Notifikasi</span>
          </div>
          <div className="max-h-80 overflow-y-auto flex flex-col">
            {items.length === 0 ? (
              <p className="font-mono text-label-sm uppercase text-on-surface-variant text-center px-4 py-6">
                Tidak ada notifikasi baru.
              </p>
            ) : (
              items.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="border-b-2 border-outline px-4 py-3 font-body-md text-sm hover:bg-secondary-container transition-colors"
                >
                  {item.text}
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
