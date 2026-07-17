'use client';

import { useState } from 'react';
import Link from 'next/link';
import clsx from '@/lib/clsx';
import NavDrawer from '@/components/layout/NavDrawer';
import NotificationBell from '@/components/layout/NotificationBell';

interface AppHeaderProps {
  cartCount?: number;
  showSearch?: boolean;
  showCart?: boolean;
}

/**
 * DS v3.0 Bagian 6.2: header sticky, border bawah 4px. Sejak
 * perbaikan navigasi, header ini juga punya tombol hamburger (☰) yang
 * membuka NavDrawer — muncul di SEMUA ukuran layar (bukan cuma
 * mobile), supaya ada jalur konsisten ke Logout/Poin/Profil/dll baik
 * di desktop maupun mobile. `showCart` dimatikan di layout penjual
 * karena keranjang cuma relevan buat siswa.
 */
export default function AppHeader({ cartCount = 0, showSearch = true, showCart = true }: AppHeaderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-surface-container-lowest border-b-4 border-outline">
        <div className="max-w-container-max mx-auto h-20 px-gutter flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Buka menu navigasi"
              className="squishy w-12 h-12 flex items-center justify-center bg-surface-container-lowest border-2 border-outline shadow-sm shrink-0"
            >
              <span aria-hidden className="text-xl">
                ☰
              </span>
            </button>
            <Link
              href="/"
              className="hidden sm:inline-block font-headline-md text-headline-md font-black uppercase italic bg-secondary-container border-2 border-outline shadow-sm px-4 py-1"
            >
              DigiCanteen
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {showCart && (
              <Link
                href="/keranjang"
                aria-label="Keranjang"
                className={clsx(
                  'squishy relative w-12 h-12 flex items-center justify-center',
                  'bg-secondary-container border-2 border-outline shadow-sm'
                )}
              >
                <span aria-hidden>🛒</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-tertiary text-on-tertiary text-[11px] font-bold h-6 w-6 border-2 border-outline flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
            <NotificationBell />
          </div>
        </div>
      </header>

      <NavDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
}
