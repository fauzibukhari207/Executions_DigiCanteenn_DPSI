'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useSession } from '@/lib/auth/session';
import { useCart } from '@/lib/cart/CartContext';
import { getGroupOrder, leaveGroupOrder } from '@/lib/data/groups';
import { calculateCartTotals } from '@/lib/cart/calculateTotals';
import type { GroupOrder } from '@/lib/types';

function formatRupiah(amount: number) {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

export default function GroupOrderDetailPage({ params }: { params: { kode: string } }) {
  const { user } = useSession();
  const { lines, setGroupCode } = useCart();
  const [group, setGroup] = useState<GroupOrder | null | undefined>(undefined);
  const [yourSubtotal, setYourSubtotal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getGroupOrder(params.kode).then((found) => {
      if (!cancelled) setGroup(found ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [params.kode]);

  useEffect(() => {
    let cancelled = false;
    calculateCartTotals(lines).then((totals) => {
      if (!cancelled) setYourSubtotal(totals.subtotal);
    });
    return () => {
      cancelled = true;
    };
  }, [lines]);

  const joinUrl =
    group && typeof window !== 'undefined' ? `${window.location.origin}/menu/grup/${group.code}/join` : '';

  const handleCopy = async () => {
    if (!joinUrl) return;
    try {
      await navigator.clipboard.writeText(joinUrl);
    } catch {
      // abaikan kalau clipboard tidak diizinkan browser
    }
  };

  const handleLeave = async () => {
    if (!group || !user) return;
    await leaveGroupOrder(group.code, user.id);
    setGroupCode(null);
  };

  if (group === undefined) {
    return (
      <div className="max-w-container-max mx-auto px-gutter py-margin text-center">
        <p className="font-mono text-label-bold uppercase text-on-surface-variant animate-pulse">Memuat grup...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="max-w-container-max mx-auto px-gutter py-margin flex flex-col items-center text-center gap-6 min-h-[60vh] justify-center">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile uppercase">Grup Tidak Ditemukan</h1>
        <Link href="/menu/grup/buat">
          <Button variant="primary">Buat Group Order Baru</Button>
        </Link>
      </div>
    );
  }

  const isHost = user?.id === group.hostId;

  return (
    <div className="max-w-container-max mx-auto px-gutter py-margin flex flex-col gap-margin">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile uppercase mb-1">
            Group <span className="font-mono">{group.code}</span>
          </h1>
          <p className="font-mono text-label-sm uppercase text-on-surface-variant">
            Status: {group.status} {isHost && '· Kamu Host'}
          </p>
        </div>
        <Button variant="outline" onClick={handleCopy}>
          Salin Link Undangan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-margin">
        <div className="border-3 border-outline shadow-md bg-surface-container-lowest p-6 flex flex-col gap-4">
          <h2 className="font-headline-md text-headline-md uppercase">Anggota ({group.memberIds.length})</h2>
          <ul className="flex flex-col gap-2">
            {group.memberIds.map((memberId) => (
              <li
                key={memberId}
                className="flex items-center justify-between border-2 border-outline px-4 py-3 font-mono text-label-bold uppercase"
              >
                <span>
                  {memberId === group.hostId ? '👑 Host' : '🙋 Anggota'}
                  {memberId === user?.id ? ' (Kamu)' : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-3 border-outline shadow-md bg-primary-fixed p-6 flex flex-col gap-4">
          <h2 className="font-headline-md text-headline-md uppercase">Kontribusimu</h2>
          <p className="font-headline-lg-mobile text-headline-lg-mobile text-primary">{formatRupiah(yourSubtotal)}</p>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Ini subtotal dari keranjangmu sendiri. Total gabungan seluruh anggota akan dihitung saat checkout.
          </p>
          <div className="flex flex-wrap gap-3 mt-2">
            <Link href="/menu">
              <Button variant="primary">Tambah Menu</Button>
            </Link>
            <Link href="/keranjang">
              <Button variant="outline">Lihat Keranjangku</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center border-t-4 border-outline pt-6">
        <Button variant="danger" onClick={handleLeave}>
          Keluar dari Grup
        </Button>
        <Link href="/checkout">
          <Button variant="primary">Checkout Group &rarr;</Button>
        </Link>
      </div>
    </div>
  );
}
