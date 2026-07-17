'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import QrisDisplay from '@/components/payment/QrisDisplay';
import { useCart } from '@/lib/cart/CartContext';
import { calculateCartTotals, CartTotals } from '@/lib/cart/calculateTotals';
import { useSession } from '@/lib/auth/session';
import { createOrder } from '@/lib/data/orders';
import type { QrisPayment } from '@/lib/types';

const PICKUP_TIMES = ['Istirahat 1 (10:00)', 'Istirahat 2 (12:30)', 'Pulang Sekolah (15:00)'];
const EMPTY_TOTALS: CartTotals = { subtotal: 0, serviceFee: 0, total: 0, itemCount: 0 };

function formatRupiah(amount: number) {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

type Step = 'pilih' | 'memproses' | 'qris' | 'gagal';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, adjustWalletBalance } = useSession();
  const { lines, groupCode, clearCart } = useCart();
  const [totals, setTotals] = useState<CartTotals>(EMPTY_TOTALS);
  const { subtotal, serviceFee, total } = totals;

  useEffect(() => {
    let cancelled = false;
    calculateCartTotals(lines).then((t) => {
      if (!cancelled) setTotals(t);
    });
    return () => {
      cancelled = true;
    };
  }, [lines]);

  const [pickupTime, setPickupTime] = useState(PICKUP_TIMES[0]);
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'saldo'>('qris');
  const [step, setStep] = useState<Step>('pilih');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [qrisPayment, setQrisPayment] = useState<(QrisPayment & { isMock?: boolean }) | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const walletInsufficient = paymentMethod === 'saldo' && (user?.walletBalance ?? 0) < total;

  const handlePaymentSuccess = async (orderId: string) => {
    const res = await fetch('/api/orders/confirm-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? 'Gagal mengkonfirmasi pembayaran.');
    }
    clearCart();
    router.push(`/meja/checkin?orderId=${orderId}`);
  };

  // Polling status QRIS setiap 3 detik selama menunggu pembayaran.
  useEffect(() => {
    if (step !== 'qris' || !qrisPayment) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/qris/status?referenceId=${qrisPayment.xenditReferenceId}`);
        const data = await res.json();
        if (data.status === 'PAID' && currentOrderId) {
          clearInterval(interval);
          await handlePaymentSuccess(currentOrderId);
        }
      } catch {
        // network sementara gagal, coba lagi di interval berikutnya
      }
    }, 3000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, qrisPayment, currentOrderId]);

  const handleSimulatePayment = async () => {
    if (!currentOrderId) return;
    setIsSimulating(true);
    await handlePaymentSuccess(currentOrderId);
  };

  if (lines.length === 0 && step === 'pilih') {
    return (
      <div className="max-w-container-max mx-auto px-gutter py-margin flex flex-col items-center text-center gap-6 min-h-[50vh] justify-center">
        <p className="font-mono text-label-bold uppercase text-on-surface-variant">Keranjangmu kosong.</p>
        <Link href="/menu">
          <Button variant="primary">Pilih Menu Dulu</Button>
        </Link>
      </div>
    );
  }

  const handleCreateOrder = async () => {
    if (!user) return;
    setErrorMessage(null);
    setStep('memproses');

    const order = await createOrder({
      studentId: user.id,
      lines,
      subtotal,
      serviceFee,
      total,
      pickupTime,
      paymentMethod,
      groupOrderId: groupCode ?? undefined,
    });
    setCurrentOrderId(order.id);

    if (paymentMethod === 'saldo') {
      await adjustWalletBalance(-total);
      await handlePaymentSuccess(order.id);
      return;
    }

    try {
      const res = await fetch('/api/payments/qris', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, amount: total }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error ?? 'Gagal membuat QRIS.');
      }
      const payment = await res.json();
      setQrisPayment(payment);
      setStep('qris');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Terjadi kesalahan tak terduga.');
      setStep('gagal');
    }
  };

  return (
    <div className="max-w-container-max mx-auto px-gutter py-margin flex flex-col gap-margin max-w-2xl">
      <h1 className="font-headline-lg-mobile text-headline-lg-mobile uppercase">Checkout</h1>

      {step === 'pilih' && (
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="font-mono text-label-bold uppercase mb-3">Waktu Pengambilan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PICKUP_TIMES.map((t) => (
                <button
                  key={t}
                  onClick={() => setPickupTime(t)}
                  className={`squishy border-2 border-outline px-4 py-3 font-mono text-label-bold uppercase text-sm ${
                    pickupTime === t ? 'bg-primary-container text-on-primary shadow-none translate-x-1 translate-y-1' : 'bg-surface-container-lowest shadow-sm'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-mono text-label-bold uppercase mb-3">Metode Pembayaran</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('qris')}
                className={`squishy border-2 border-outline px-4 py-4 font-mono text-label-bold uppercase ${
                  paymentMethod === 'qris' ? 'bg-primary-container text-on-primary shadow-none translate-x-1 translate-y-1' : 'bg-surface-container-lowest shadow-sm'
                }`}
              >
                📱 QRIS
              </button>
              <button
                onClick={() => setPaymentMethod('saldo')}
                className={`squishy border-2 border-outline px-4 py-4 font-mono text-label-bold uppercase ${
                  paymentMethod === 'saldo' ? 'bg-primary-container text-on-primary shadow-none translate-x-1 translate-y-1' : 'bg-surface-container-lowest shadow-sm'
                }`}
              >
                💳 Saldo
              </button>
            </div>
            {paymentMethod === 'saldo' && (
              <p className="font-mono text-label-sm uppercase mt-3 text-on-surface-variant">
                Saldo kamu: {formatRupiah(user?.walletBalance ?? 0)}
                {walletInsufficient && <span className="text-error"> — Saldo tidak mencukupi</span>}
              </p>
            )}
          </div>

          <div className="border-3 border-outline shadow-md bg-primary-fixed p-6 flex flex-col gap-2">
            <div className="flex justify-between font-body-md font-bold uppercase">
              <span>Subtotal</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between font-body-md font-bold uppercase">
              <span>Biaya Layanan</span>
              <span>{formatRupiah(serviceFee)}</span>
            </div>
            <div className="flex justify-between font-headline-md text-headline-md uppercase border-t-2 border-outline pt-2 mt-1">
              <span>Total</span>
              <span className="text-primary">{formatRupiah(total)}</span>
            </div>
          </div>

          <Button variant="primary" fullWidth disabled={walletInsufficient} onClick={handleCreateOrder}>
            Buat Pesanan &amp; Bayar
          </Button>
        </div>
      )}

      {step === 'memproses' && (
        <div className="flex flex-col items-center gap-4 py-16">
          <span className="font-mono text-label-bold uppercase animate-pulse">Memproses pesanan...</span>
        </div>
      )}

      {step === 'qris' && qrisPayment && (
        <div className="flex flex-col items-center gap-6 py-6">
          {qrisPayment.isMock && (
            <span className="font-mono text-label-sm uppercase bg-error-container border-2 border-outline px-3 py-1 text-center">
              Mode Sandbox/Dummy — belum pakai akun Xendit asli. QR ini otomatis "lunas" ±8 detik untuk keperluan
              testing.
            </span>
          )}
          <h2 className="font-headline-md text-headline-md uppercase">Scan QRIS untuk Bayar</h2>
          <QrisDisplay qrString={qrisPayment.qrString} />
          <p className="font-mono text-[24px] font-black text-primary">{formatRupiah(qrisPayment.amount)}</p>
          <p className="font-mono text-label-sm uppercase text-on-surface-variant animate-pulse">
            Menunggu pembayaran...
          </p>

          {!qrisPayment.isMock && (
            <div className="w-full max-w-sm border-3 border-dashed border-outline p-5 flex flex-col items-center gap-3 mt-2">
              <p className="font-mono text-label-sm uppercase text-on-surface-variant text-center">
                Akun Xendit belum verifikasi bisnis, jadi QR ini belum bisa di-scan pakai uang sungguhan. Pakai
                tombol ini untuk mensimulasikan pembayaran berhasil supaya alur checkout tetap bisa dites sampai
                selesai.
              </p>
              <Button variant="secondary" fullWidth onClick={handleSimulatePayment} disabled={isSimulating}>
                {isSimulating ? 'Memproses...' : '✅ Simulasikan Pembayaran Berhasil'}
              </Button>
            </div>
          )}
        </div>
      )}

      {step === 'gagal' && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="font-mono text-label-bold uppercase text-error">{errorMessage}</p>
          <Button variant="outline" onClick={() => setStep('pilih')}>
            Coba Lagi
          </Button>
        </div>
      )}
    </div>
  );
}
