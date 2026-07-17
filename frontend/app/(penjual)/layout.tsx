'use client';

import AppHeader from '@/components/layout/AppHeader';
import BottomNav from '@/components/layout/BottomNav';
import Footer from '@/components/layout/Footer';
import RequireAuth from '@/lib/auth/RequireAuth';

/**
 * Layout bersama untuk semua halaman penjual. WAJIB login sebagai
 * penjual — dijaga <RequireAuth role="penjual">, otomatis redirect ke
 * /login (belum login) atau /beranda (login tapi sebagai siswa).
 */
export default function PenjualLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth role="penjual">
      <div className="min-h-screen flex flex-col pb-20 lg:pb-0">
        <AppHeader showCart={false} showSearch={false} />
        <div className="flex-1 w-full">{children}</div>
        <Footer />
        <BottomNav role="penjual" />
      </div>
    </RequireAuth>
  );
}
