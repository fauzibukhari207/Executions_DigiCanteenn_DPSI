'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { useSession } from '@/lib/auth/session';
import clsx from '@/lib/clsx';

interface NavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DrawerLink {
  href: string;
  label: string;
  icon: string;
}

const SISWA_LINKS: DrawerLink[] = [
  { href: '/beranda', label: 'Beranda', icon: '🏠' },
  { href: '/menu', label: 'Daftar Menu', icon: '🍽️' },
  { href: '/keranjang', label: 'Keranjang', icon: '🛒' },
  { href: '/pesanan', label: 'Riwayat Pesanan', icon: '🧾' },
  { href: '/poin', label: 'Poin & Voucher', icon: '💳' },
  { href: '/profil', label: 'Profil', icon: '👤' },
];

const PENJUAL_LINKS: DrawerLink[] = [
  { href: '/dashboard', label: 'Dasbor', icon: '📊' },
  { href: '/kelola-menu', label: 'Kelola Menu', icon: '🍱' },
  { href: '/pesanan-masuk', label: 'Pesanan Masuk', icon: '🧾' },
  { href: '/ulasan', label: 'Ulasan Menu', icon: '⭐' },
  { href: '/profil', label: 'Profil', icon: '👤' },
];

/**
 * Navbar drawer — bisa dibuka/tutup, muncul di SEMUA ukuran layar
 * (bukan cuma mobile), geser dari kiri. Isinya menyesuaikan status
 * login & role secara otomatis:
 * - Belum login: tombol Masuk & Daftar saja
 * - Siswa: navigasi siswa + Logout
 * - Penjual: navigasi penjual + Logout
 */
export default function NavDrawer({ isOpen, onClose }: NavDrawerProps) {
  const { user, logout } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    onClose();
    router.push('/');
  };

  const links = user?.role === 'penjual' ? PENJUAL_LINKS : SISWA_LINKS;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        aria-hidden
        className={clsx(
          'fixed inset-0 bg-on-background/50 z-[60] transition-opacity duration-200',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      />

      {/* Panel */}
      <aside
        className={clsx(
          'fixed top-0 left-0 h-full w-72 max-w-[85vw] bg-surface-container-lowest border-r-4 border-outline shadow-xl z-[70]',
          'flex flex-col transition-transform duration-200',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        role="dialog"
        aria-label="Menu navigasi"
      >
        <div className="flex items-center justify-between p-4 border-b-4 border-outline">
          <span className="font-headline-md text-lg font-black uppercase italic bg-secondary-container border-2 border-outline shadow-sm px-3 py-1">
            DigiCanteen
          </span>
          <button
            onClick={onClose}
            aria-label="Tutup menu"
            className="squishy w-9 h-9 flex items-center justify-center border-2 border-outline bg-surface-container-lowest shadow-sm"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {user ? (
            <>
              <div className="border-2 border-outline bg-secondary-container px-4 py-3 mb-2">
                <p className="font-mono text-label-bold uppercase truncate">{user.name}</p>
                <p className="font-mono text-label-sm uppercase text-on-surface-variant truncate">
                  {user.role === 'siswa' ? 'Akun Siswa' : 'Akun Penjual'}
                </p>
              </div>

              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className="squishy flex items-center gap-3 border-2 border-outline bg-surface-container-lowest shadow-sm px-4 py-3 font-mono text-label-bold uppercase"
                >
                  <span aria-hidden>{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </>
          ) : (
            <p className="font-mono text-label-sm uppercase text-on-surface-variant px-1">
              Masuk untuk mengakses menu, keranjang, dan fitur lainnya.
            </p>
          )}
        </div>

        <div className="p-4 border-t-4 border-outline flex flex-col gap-3">
          {user ? (
            <Button variant="danger" fullWidth onClick={handleLogout}>
              🚪 Keluar
            </Button>
          ) : (
            <>
              <Link href="/login" onClick={onClose}>
                <Button variant="primary" fullWidth>
                  Masuk
                </Button>
              </Link>
              <Link href="/register" onClick={onClose}>
                <Button variant="outline" fullWidth>
                  Daftar Akun
                </Button>
              </Link>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
