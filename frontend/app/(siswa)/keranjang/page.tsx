'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import CartItemCard from '@/components/menu/CartItemCard';
import { useCart, CartLine } from '@/lib/cart/CartContext';
import { calculateCartTotals, CartTotals } from '@/lib/cart/calculateTotals';
import { getMenuItemsByIds } from '@/lib/data/menu';
import { getGroupOrder } from '@/lib/data/groups';
import type { MenuItem, GroupOrder } from '@/lib/types';

function formatRupiah(amount: number) {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

const EMPTY_TOTALS: CartTotals = { subtotal: 0, serviceFee: 0, total: 0, itemCount: 0 };

export default function KeranjangPage() {
  const { lines, updateQuantity, removeItem, groupCode, setGroupCode } = useCart();

  const [itemsById, setItemsById] = useState<Record<string, MenuItem>>({});
  const [totals, setTotals] = useState<CartTotals>(EMPTY_TOTALS);
  const [activeGroup, setActiveGroup] = useState<GroupOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [items, cartTotals] = await Promise.all([
          getMenuItemsByIds(lines.map((l) => l.menuItemId)),
          calculateCartTotals(lines),
        ]);
        if (cancelled) return;

        const map: Record<string, MenuItem> = {};
        items.forEach((item) => {
          map[item.id] = item;
        });
        setItemsById(map);
        setTotals(cartTotals);
      } catch (err) {
        if (!cancelled) {
          console.error('Gagal memuat keranjang:', err);
          setLoadError('Gagal memuat keranjang. Coba refresh halaman ini.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [lines]);

  useEffect(() => {
    let cancelled = false;
    if (!groupCode) {
      setActiveGroup(null);
      return;
    }
    getGroupOrder(groupCode)
      .then((group) => {
        if (!cancelled) setActiveGroup(group ?? null);
      })
      .catch((err) => {
        console.error('Gagal memuat group order:', err);
        if (!cancelled) setActiveGroup(null);
      });
    return () => {
      cancelled = true;
    };
  }, [groupCode]);

  const linesWithItem = lines
    .map((line) => ({ line, item: itemsById[line.menuItemId] }))
    .filter((x): x is { line: CartLine; item: MenuItem } => Boolean(x.item));

  return (
    <div className="max-w-container-max mx-auto px-gutter py-margin">
      <div className="mb-margin">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile uppercase mb-2">Keranjang Kamu</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Cek pesananmu sebelum lanjut ke pembayaran.
        </p>
      </div>

      {activeGroup && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-secondary-container border-2 border-outline shadow-sm px-4 py-3">
          <span className="font-mono text-label-bold uppercase">
            Terhubung ke Group Order: <strong>{activeGroup.code}</strong> ({activeGroup.memberIds.length} anggota)
          </span>
          <div className="flex gap-2">
            <Link href={`/menu/grup/${activeGroup.code}`}>
              <Button variant="outline">Lihat Grup</Button>
            </Link>
            <Button variant="outline" onClick={() => setGroupCode(null)}>
              Keluar
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="font-mono text-label-bold uppercase text-on-surface-variant animate-pulse">Memuat keranjang...</p>
      ) : loadError ? (
        <div className="border-3 border-error shadow-md p-6 flex flex-col items-center gap-4 text-center bg-error-container">
          <p className="font-mono text-label-bold uppercase text-error">{loadError}</p>
        </div>
      ) : linesWithItem.length === 0 ? (
        <div className="border-3 border-outline shadow-md p-10 flex flex-col items-center gap-4 text-center bg-surface-container-lowest">
          <span className="text-5xl" aria-hidden>
            🛒
          </span>
          <p className="font-mono text-label-bold uppercase text-on-surface-variant">Keranjangmu masih kosong</p>
          <Link href="/menu">
            <Button variant="primary">Lihat Daftar Menu</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-margin">
          <div className="lg:col-span-7 flex flex-col gap-margin">
            {linesWithItem.map(({ line, item }) => (
              <CartItemCard
                key={line.lineId}
                item={item}
                quantity={line.quantity}
                selectedOptions={line.selectedOptions}
                onQuantityChange={(q) => updateQuantity(line.lineId, q)}
                onRemove={() => removeItem(line.lineId)}
              />
            ))}

            {!activeGroup && (
              <div className="border-3 border-dashed border-outline p-5 flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-label-bold uppercase text-on-surface-variant">
                  Mau pesan bareng teman satu meja?
                </span>
                <Link href="/menu/grup/buat">
                  <Button variant="secondary">+ Buat Group Order</Button>
                </Link>
              </div>
            )}
          </div>

          <div className="lg:col-span-5">
            <div className="bg-primary-fixed border-3 border-outline shadow-lg p-6 lg:sticky lg:top-28 flex flex-col gap-4">
              <h3 className="font-headline-lg-mobile text-headline-lg-mobile uppercase">Ringkasan Pesanan</h3>
              <div className="flex flex-col gap-2 border-b-4 border-outline pb-4">
                <div className="flex justify-between font-body-lg font-bold uppercase">
                  <span>Subtotal ({totals.itemCount} item)</span>
                  <span>{formatRupiah(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between font-body-lg font-bold uppercase">
                  <span>Biaya Layanan</span>
                  <span>{formatRupiah(totals.serviceFee)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-headline-lg-mobile text-headline-lg-mobile uppercase">Total</span>
                <span className="font-headline-lg-mobile text-headline-lg-mobile uppercase text-primary">
                  {formatRupiah(totals.total)}
                </span>
              </div>

              <Link href="/checkout" className="w-full">
                <Button variant="primary" fullWidth>
                  {activeGroup ? 'Checkout Group' : 'Lanjut ke Pembayaran'}
                </Button>
              </Link>
              <p className="font-mono text-label-sm uppercase text-center text-on-surface-variant">
                Pembayaran QRIS via Xendit
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
