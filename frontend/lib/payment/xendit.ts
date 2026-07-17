import type { QrisPayment } from '@/lib/types';

/**
 * Integrasi Xendit QRIS — Batch 5.
 *
 * File ini HANYA boleh diimpor dari kode server (Route Handler di
 * app/api/**), karena memakai XENDIT_SECRET_KEY yang tidak boleh
 * bocor ke browser.
 *
 * Kalau XENDIT_SECRET_KEY belum diisi di .env.local, semua fungsi di
 * sini otomatis jatuh ke MODE MOCK: menghasilkan QR "dummy" yang tetap
 * bisa dirender di layar (untuk tes tampilan) dan otomatis dianggap
 * "lunas" 8 detik setelah dibuat (untuk tes alur checkout end-to-end)
 * TANPA transaksi uang sungguhan. Begitu key produksi/sandbox asli
 * diisi, kode ini otomatis pakai Xendit API beneran — tidak perlu
 * ubah kode di halaman checkout.
 */

const XENDIT_BASE_URL = 'https://api.xendit.co';

function getSecretKey(): string | undefined {
  return process.env.XENDIT_SECRET_KEY;
}

export function isXenditConfigured(): boolean {
  return Boolean(getSecretKey());
}

export async function createQrisPayment(orderId: string, amount: number): Promise<QrisPayment & { isMock: boolean }> {
  const secretKey = getSecretKey();
  if (!secretKey) {
    return { ...createMockQrisPayment(orderId, amount), isMock: true };
  }

  const auth = Buffer.from(`${secretKey}:`).toString('base64');
  const res = await fetch(`${XENDIT_BASE_URL}/qr_codes`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      external_id: orderId,
      type: 'DYNAMIC',
      currency: 'IDR',
      amount,
      callback_url: process.env.XENDIT_CALLBACK_URL,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Gagal membuat QRIS lewat Xendit (${res.status}): ${errorBody}`);
  }

  const data = await res.json();
  return {
    orderId,
    xenditReferenceId: data.id,
    qrString: data.qr_string,
    amount,
    status: 'PENDING',
    expiresAt: data.expires_at,
    isMock: false,
  };
}

export async function checkQrisStatus(xenditReferenceId: string): Promise<QrisPayment['status']> {
  const secretKey = getSecretKey();
  if (!secretKey || xenditReferenceId.startsWith('mock-')) {
    return checkMockQrisStatus(xenditReferenceId);
  }

  const auth = Buffer.from(`${secretKey}:`).toString('base64');
  const res = await fetch(`${XENDIT_BASE_URL}/qr_codes/${xenditReferenceId}/payments`, {
    headers: { Authorization: `Basic ${auth}` },
  });

  if (!res.ok) {
    throw new Error(`Gagal mengecek status pembayaran (${res.status})`);
  }

  const data = await res.json();
  const hasSucceeded = Array.isArray(data.data) && data.data.some((p: { status: string }) => p.status === 'SUCCEEDED');
  return hasSucceeded ? 'PAID' : 'PENDING';
}

// ---------------------------------------------------------------------------
// Mode Mock — dipakai kalau XENDIT_SECRET_KEY belum diisi.
// Disimpan di memori server (bertahan selama proses `next dev` berjalan,
// cukup untuk testing lokal; bukan pengganti database).
// ---------------------------------------------------------------------------

const mockPaymentStore = new Map<string, { createdAt: number; amount: number; orderId: string }>();
const MOCK_AUTO_PAID_AFTER_SECONDS = 8;

function createMockQrisPayment(orderId: string, amount: number): QrisPayment {
  const referenceId = `mock-${orderId}-${Date.now()}`;
  mockPaymentStore.set(referenceId, { createdAt: Date.now(), amount, orderId });

  return {
    orderId,
    xenditReferenceId: referenceId,
    // String QRIS dummy (bukan merchant sungguhan) — cukup untuk di-encode jadi gambar QR di UI.
    qrString: `00020101021226610014ID.CO.QRIS.WWW0215ID10000000000${orderId.replace(/[^0-9]/g, '').slice(0, 6).padEnd(6, '0')}0303UMI5204581253033605802ID5910DIGICANTEEN6007SLEMAN61055582162070703A0163049999`,
    amount,
    status: 'PENDING',
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  };
}

function checkMockQrisStatus(referenceId: string): QrisPayment['status'] {
  const payment = mockPaymentStore.get(referenceId);
  if (!payment) return 'EXPIRED';
  const elapsedSeconds = (Date.now() - payment.createdAt) / 1000;
  return elapsedSeconds >= MOCK_AUTO_PAID_AFTER_SECONDS ? 'PAID' : 'PENDING';
}
