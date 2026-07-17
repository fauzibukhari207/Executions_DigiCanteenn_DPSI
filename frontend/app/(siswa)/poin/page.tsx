'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useSession } from '@/lib/auth/session';
import { getPointHistory, getVouchers, redeemVoucher } from '@/lib/data/points';
import { BUSINESS_RULES } from '@/lib/types';
import type { PointHistoryEntry, Voucher } from '@/lib/types';

function formatRupiah(amount: number) {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function PoinPage() {
  const { user, addPoints } = useSession();
  const [history, setHistory] = useState<PointHistoryEntry[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);

  useEffect(() => {
    if (!user) return;
    getPointHistory(user.id).then(setHistory);
    getVouchers(user.id).then(setVouchers);
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-container-max mx-auto px-gutter py-margin flex flex-col items-center text-center gap-6 min-h-[50vh] justify-center">
        <p className="font-mono text-label-bold uppercase text-on-surface-variant">Login dulu untuk lihat poin kamu.</p>
        <Link href="/login">
          <Button variant="primary">Masuk</Button>
        </Link>
      </div>
    );
  }

  const canRedeem = user.points >= BUSINESS_RULES.POINTS_TO_VOUCHER_RATIO;

  const handleRedeem = async () => {
    const voucher = await redeemVoucher(user.id, user.points);
    if (!voucher) return;
    await addPoints(-BUSINESS_RULES.POINTS_TO_VOUCHER_RATIO);
    getVouchers(user.id).then(setVouchers);
    getPointHistory(user.id).then(setHistory);
  };

  return (
    <div className="max-w-container-max mx-auto px-gutter py-margin flex flex-col gap-margin">
      <h1 className="font-headline-lg-mobile text-headline-lg-mobile uppercase">Poin &amp; Voucher</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-margin">
        <div className="border-3 border-outline shadow-lg bg-secondary-container p-6 flex flex-col gap-4">
          <span className="font-mono text-label-bold uppercase">Total Poin Kamu</span>
          <span className="font-headline-lg-mobile text-headline-lg-mobile text-[48px]">{user.points}</span>
          <p className="font-body-sm text-body-sm">
            Dapat poin dari check-out tepat waktu (≤ {BUSINESS_RULES.CHECKOUT_TIME_LIMIT_MINUTES} menit). Tukar{' '}
            {BUSINESS_RULES.POINTS_TO_VOUCHER_RATIO} poin jadi voucher {formatRupiah(BUSINESS_RULES.VOUCHER_DISCOUNT_AMOUNT)}.
          </p>
          <Button variant="primary" disabled={!canRedeem} onClick={handleRedeem}>
            {canRedeem
              ? `Tukar ${BUSINESS_RULES.POINTS_TO_VOUCHER_RATIO} Poin → Voucher`
              : `Butuh ${BUSINESS_RULES.POINTS_TO_VOUCHER_RATIO - user.points} poin lagi`}
          </Button>
        </div>

        <div className="border-3 border-outline shadow-md bg-surface-container-lowest p-6 flex flex-col gap-3">
          <h2 className="font-headline-md text-headline-md uppercase">Voucher Kamu</h2>
          {vouchers.length === 0 ? (
            <p className="font-mono text-label-sm uppercase text-on-surface-variant">Belum ada voucher.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {vouchers.map((v) => (
                <li
                  key={v.id}
                  className="flex justify-between items-center border-2 border-outline px-4 py-3 font-mono text-label-bold uppercase"
                >
                  <span>{formatRupiah(v.discountAmount)}</span>
                  <span className={v.isUsed ? 'text-on-surface-variant' : 'text-primary'}>
                    {v.isUsed ? 'Terpakai' : 'Belum Dipakai'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div>
        <h2 className="font-headline-md text-headline-md uppercase mb-4">Riwayat Poin</h2>
        {history.length === 0 ? (
          <p className="font-mono text-label-sm uppercase text-on-surface-variant">Belum ada riwayat.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {history.map((h) => (
              <div
                key={h.id}
                className="flex justify-between items-center border-2 border-outline bg-surface-container-lowest px-4 py-3"
              >
                <div>
                  <p className="font-mono text-label-bold uppercase">{h.reason}</p>
                  <p className="font-mono text-label-sm text-on-surface-variant">{formatDate(h.createdAt)}</p>
                </div>
                <span className={`font-mono font-bold ${h.points > 0 ? 'text-primary' : 'text-error'}`}>
                  {h.points > 0 ? `+${h.points}` : h.points}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
