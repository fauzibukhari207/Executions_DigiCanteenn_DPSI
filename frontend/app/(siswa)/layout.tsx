'use client';

import AppHeader from '@/components/layout/AppHeader';
import BottomNav from '@/components/layout/BottomNav';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/lib/cart/CartContext';
import RequireAuth from '@/lib/auth/RequireAuth';

/**
 * Layout bersama untuk semua halaman siswa. Sejak perbaikan navigasi,
 * seluruh halaman di grup ini WAJIB login sebagai siswa — dijaga oleh
 * <RequireAuth role="siswa">, otomatis redirect ke /login (belum
 * login) atau /dashboard (login tapi sebagai penjual).
 */
export default function SiswaLayout({ children }: { children: React.ReactNode }) {
  const { totalItemCount } = useCart();

  return (
    <RequireAuth role="siswa">
      <div className="min-h-screen flex flex-col pb-20 lg:pb-0">
        <AppHeader cartCount={totalItemCount} />
        <div className="flex-1 w-full">{children}</div>
        <Footer />
        <BottomNav role="siswa" />
      </div>
    </RequireAuth>
  );
}
