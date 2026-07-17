'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QrisDisplayProps {
  qrString: string;
  size?: number;
}

/**
 * Merender `qrString` (format QRIS) jadi gambar QR yang bisa di-scan,
 * langsung di browser (tidak memanggil layanan pihak ketiga). Dipakai
 * baik untuk QR asli dari Xendit maupun QR dummy di mode mock.
 */
export default function QrisDisplay({ qrString, size = 240 }: QrisDisplayProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(qrString, { width: size, margin: 1 })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [qrString, size]);

  if (error) {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center border-2 border-outline bg-surface-container font-mono text-label-sm uppercase text-center p-4"
      >
        Gagal membuat gambar QR
      </div>
    );
  }

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center border-2 border-outline bg-surface-container font-mono text-label-sm uppercase animate-pulse"
      >
        Membuat QR...
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={dataUrl} alt="QR Code QRIS" width={size} height={size} className="border-2 border-outline" />;
}
