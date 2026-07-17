'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useSession } from '@/lib/auth/session';
import { getCheckIn, completeCheckIn } from '@/lib/data/checkins';
import { addPointEntry } from '@/lib/data/points';
import { updateOrderStatus } from '@/lib/data/orders';
import { BUSINESS_RULES } from '@/lib/types';
import type { TableCheckIn } from '@/lib/types';

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
}

function CheckOutContent() {
  const searchParams = useSearchParams();
  const checkinId = searchParams.get('checkinId');
  const { user, addPoints } = useSession();

  const [checkin, setCheckin] = useState<TableCheckIn | undefined>(undefined);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [result, setResult] = useState<TableCheckIn | null>(null);

  useEffect(() => {
    if (!checkinId) return;
    getCheckIn(checkinId).then(setCheckin);
  }, [checkinId]);

  useEffect(() => {
    if (!checkin || checkin.checkOutAt) return;
    const checkInTime = new Date(checkin.checkInAt).getTime();
    const tick = () => setElapsedSeconds(Math.floor((Date.now() - checkInTime) / 1000));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [checkin]);

  const limitSeconds = BUSINESS_RULES.CHECKOUT_TIME_LIMIT_MINUTES * 60;
  const isOverTime = elapsedSeconds > limitSeconds;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckOut = async () => {
    if (!checkinId || !user) return;
    setIsSubmitting(true);
    const completed = await completeCheckIn(checkinId);
    if (!completed) {
      setIsSubmitting(false);
      return;
    }
    setResult(completed);
    // Check-out dianggap tanda makanan sudah diambil & disajikan —
    // membuka pintu untuk kasih rating.
    await updateOrderStatus(completed.orderId, 'selesai-disajikan');
    if (completed.pointsEarned && completed.pointsEarned > 0) {
      await addPoints(completed.pointsEarned);
      await addPointEntry(user.id, completed.pointsEarned, 'Check-out tepat waktu');
    }
    setIsSubmitting(false);
  };

  if (!checkinId || checkin === undefined) {
    return (
      <div className="max-w-container-max mx-auto px-gutter py-margin text-center">
        <p className="font-mono text-label-bold uppercase text-on-surface-variant">Sesi check-in tidak ditemukan.</p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="max-w-container-max mx-auto px-gutter py-margin flex flex-col items-center text-center gap-6 min-h-[60vh] justify-center">
        <span className="text-5xl" aria-hidden>
          {result.isOnTime ? '🎉' : '⏰'}
        </span>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile uppercase max-w-md">
          {result.isOnTime ? 'Check-out Tepat Waktu!' : 'Check-out Diterima'}
        </h1>
        {result.isOnTime ? (
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
            Kamu dapat <strong>+{result.pointsEarned} poin</strong>. Total poin sekarang: {user?.points ?? 0}.
          </p>
        ) : (
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
            Kamu check-out lebih dari {BUSINESS_RULES.CHECKOUT_TIME_LIMIT_MINUTES} menit, jadi belum dapat poin kali
            ini. Coba lagi lain kali ya!
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-3">
          <Link href={`/rating/${result.orderId}`}>
            <Button variant="primary">Beri Rating Makanan</Button>
          </Link>
          <Link href="/poin">
            <Button variant="outline">Lihat Poin</Button>
          </Link>
          <Link href="/beranda">
            <Button variant="outline">Kembali ke Beranda</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-container-max mx-auto px-gutter py-margin flex flex-col items-center text-center gap-6 min-h-[60vh] justify-center">
      <span className="text-5xl" aria-hidden>
        ⏱️
      </span>
      <h1 className="font-headline-lg-mobile text-headline-lg-mobile uppercase">Meja {checkin?.tableNumber}</h1>
      <div
        className={`font-mono text-[56px] font-black border-4 border-outline px-8 py-4 shadow-lg ${
          isOverTime ? 'bg-error-container text-error' : 'bg-secondary-container'
        }`}
      >
        {formatDuration(elapsedSeconds)}
      </div>
      <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
        {isOverTime
          ? `Sudah lewat ${BUSINESS_RULES.CHECKOUT_TIME_LIMIT_MINUTES} menit — check-out sekarang tidak akan dapat poin, tapi tetap bisa dilakukan.`
          : `Check-out sebelum ${BUSINESS_RULES.CHECKOUT_TIME_LIMIT_MINUTES} menit supaya dapat +${BUSINESS_RULES.POINTS_PER_ON_TIME_CHECKOUT} poin.`}
      </p>
      <Button variant="primary" onClick={handleCheckOut} disabled={isSubmitting}>
        {isSubmitting ? 'Memproses...' : 'Check-out Sekarang'}
      </Button>
    </div>
  );
}

export default function CheckOutPage() {
  return (
    <Suspense fallback={null}>
      <CheckOutContent />
    </Suspense>
  );
}
