'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useSession } from '@/lib/auth/session';
import { createCheckIn } from '@/lib/data/checkins';
import { getOrderById } from '@/lib/data/orders';
import { BUSINESS_RULES } from '@/lib/types';
import type { Order } from '@/lib/types';

function CheckInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { user } = useSession();

  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [tableNumber, setTableNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    getOrderById(orderId).then(setOrder);
  }, [orderId]);

  const handleCheckIn = async () => {
    if (!user || !orderId) return;
    if (!tableNumber.trim()) {
      setError('Nomor meja wajib diisi');
      return;
    }
    setIsSubmitting(true);
    const checkin = await createCheckIn(orderId, user.id, tableNumber.trim());
    setIsSubmitting(false);
    router.push(`/meja/checkout?checkinId=${checkin.id}`);
  };

  return (
    <div className="max-w-container-max mx-auto px-gutter py-margin flex flex-col items-center text-center gap-6 min-h-[60vh] justify-center">
      <span className="text-5xl" aria-hidden>
        🍽️
      </span>
      <h1 className="font-headline-lg-mobile text-headline-lg-mobile uppercase max-w-md">
        Pembayaran Berhasil! Check-in di Meja
      </h1>
      {order && (
        <p className="font-mono text-label-sm uppercase text-on-surface-variant">
          Pesanan #{order.id.slice(-6).toUpperCase()} · Ambil saat {order.pickupTime}
        </p>
      )}
      <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
        Isi nomor meja tempat kamu duduk. Timer mulai berjalan begitu kamu check-in — check-out dalam{' '}
        <strong>{BUSINESS_RULES.CHECKOUT_TIME_LIMIT_MINUTES} menit</strong> supaya dapat poin dan tidak menahan meja
        terlalu lama untuk siswa lain.
      </p>

      <div className="w-full max-w-xs">
        <Input
          label="Nomor Meja"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          placeholder="Contoh: A12"
          error={error ?? undefined}
        />
      </div>

      <Button variant="primary" onClick={handleCheckIn} disabled={isSubmitting}>
        {isSubmitting ? 'Memproses...' : 'Check-in Sekarang'}
      </Button>
    </div>
  );
}

export default function CheckInPage() {
  return (
    <Suspense fallback={null}>
      <CheckInContent />
    </Suspense>
  );
}
