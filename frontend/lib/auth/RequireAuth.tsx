'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth/session';
import type { UserRole } from '@/lib/types';

interface RequireAuthProps {
  /** Kalau diisi, halaman ini HANYA boleh diakses oleh role tersebut. */
  role?: UserRole;
  children: React.ReactNode;
}

/**
 * Penjaga akses halaman. Pakai di layout (siswa)/(penjual), atau
 * langsung di halaman seperti /profil yang dipakai kedua role.
 *
 * Sengaja menunggu `isLoading` selesai dulu sebelum memutuskan
 * redirect — soalnya sesi baru selesai dibaca dari localStorage
 * sepersekian detik setelah halaman dimuat. Tanpa ini, pengguna yang
 * SUDAH login pun akan sempat "terlempar" balik ke /login setiap kali
 * refresh halaman.
 */
export default function RequireAuth({ role, children }: RequireAuthProps) {
  const { user, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (role && user.role !== role) {
      router.replace(user.role === 'siswa' ? '/beranda' : '/dashboard');
    }
  }, [isLoading, user, role, router]);

  const isAllowed = !isLoading && user && (!role || user.role === role);

  if (!isAllowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="font-mono text-label-bold uppercase text-on-surface-variant animate-pulse">Memuat...</p>
      </div>
    );
  }

  return <>{children}</>;
}
