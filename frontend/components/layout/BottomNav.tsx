'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from '@/lib/clsx';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const SISWA_ITEMS: NavItem[] = [
  { href: '/beranda', label: 'Menu', icon: '🍽️' },
  { href: '/pesanan', label: 'Pesanan', icon: '🧾' },
  { href: '/poin', label: 'Poin', icon: '💳' },
  { href: '/profil', label: 'User', icon: '👤' },
];

const PENJUAL_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dasbor', icon: '📊' },
  { href: '/kelola-menu', label: 'Menu', icon: '🍱' },
  { href: '/pesanan-masuk', label: 'Pesanan', icon: '🧾' },
  { href: '/profil', label: 'User', icon: '👤' },
];

/**
 * DS v3.0 Bagian 6.11: bottom nav solid putih (bukan glass), 4 item,
 * role-based sesuai role user login (siswa vs penjual).
 */
export default function BottomNav({ role = 'siswa' }: { role?: 'siswa' | 'penjual' }) {
  const pathname = usePathname();
  const items = role === 'penjual' ? PENJUAL_ITEMS : SISWA_ITEMS;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-lowest border-t-4 border-outline z-50 flex justify-around items-center py-3">
      {items.map((item) => {
        const isActive = pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'flex flex-col items-center gap-1 font-mono text-[10px] uppercase font-bold',
              isActive ? 'text-primary' : 'text-on-surface'
            )}
          >
            <span aria-hidden className="text-lg">
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
