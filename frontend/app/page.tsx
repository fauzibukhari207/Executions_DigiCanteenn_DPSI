'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { useSession } from '@/lib/auth/session';

/**
 * Landing page ("/") — halaman pertama yang dilihat pengguna belum
 * login. Kalau sudah login, otomatis diarahkan ke halaman utama
 * sesuai role (siswa -> /beranda, penjual -> /dashboard).
 */
export default function LandingPage() {
  const router = useRouter();
  const { user, isLoading } = useSession();

  useEffect(() => {
    if (isLoading || !user) return;
    router.replace(user.role === 'siswa' ? '/beranda' : '/dashboard');
  }, [isLoading, user, router]);

  if (isLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="font-mono text-label-bold uppercase text-on-surface-variant animate-pulse">
          {isLoading ? 'Memuat...' : 'Mengarahkan...'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-gutter py-margin gap-10 text-center">
      <div className="relative">
        <div className="w-24 h-24 border-4 border-outline shadow-lg bg-primary-container flex items-center justify-center text-5xl">
          🍽️
        </div>
      </div>

      <div className="flex flex-col gap-3 max-w-md">
        <h1 className="font-headline-md text-headline-md font-black uppercase italic bg-secondary-container border-2 border-outline shadow-sm px-4 py-1 w-fit mx-auto">
          DigiCanteen
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Solusi modern untuk pemesanan makanan kantin sekolah — cepat, tanpa antre, langsung dari HP-mu.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center mx-auto">
        <Link href="/login" className="w-full sm:w-auto">
          <Button variant="primary" fullWidth>
            Masuk
          </Button>
        </Link>
        <Link href="/register" className="w-full sm:w-auto">
          <Button variant="outline" fullWidth>
            Daftar Akun
          </Button>
        </Link>
      </div>

      <p className="font-mono text-label-sm uppercase text-on-surface-variant">
        Untuk siswa &amp; penjual kantin SMAN 1 Prambanan
      </p>
    </div>
  );
}
