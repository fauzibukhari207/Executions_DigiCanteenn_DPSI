'use client';

import { useState } from 'react';
import Link from 'next/link';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav from '@/components/layout/BottomNav';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useSession } from '@/lib/auth/session';
import { useCart } from '@/lib/cart/CartContext';
import RequireAuth from '@/lib/auth/RequireAuth';

function formatRupiah(amount: number) {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

/**
 * Halaman Profil dipakai BERSAMA oleh siswa & penjual (isi beda
 * sesuai role), makanya sengaja diletakkan di app/profil (di luar
 * kedua route group) — kalau ditaruh di dalam (siswa)/profil DAN
 * (penjual)/profil sekaligus, Next.js menolak build karena dua route
 * group tidak boleh resolve ke path yang sama ("/profil").
 */
export default function ProfilPage() {
  return (
    <RequireAuth>
      <ProfilContent />
    </RequireAuth>
  );
}

function ProfilContent() {
  const { user, logout, updateName } = useSession();
  const { totalItemCount } = useCart();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name ?? '');
  const [nameError, setNameError] = useState<string | null>(null);
  const [isSavingName, setIsSavingName] = useState(false);

  // RequireAuth menjamin `user` sudah terisi di titik ini, tapi
  // dibiarkan sebagai jaring pengaman kalau ada perubahan di masa
  // depan pada RequireAuth.
  if (!user) return null;

  const isSiswa = user.role === 'siswa';

  const startEditingName = () => {
    setNameInput(user.name);
    setNameError(null);
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    setIsSavingName(true);
    const { error } = await updateName(nameInput);
    setIsSavingName(false);
    if (error) {
      setNameError(error);
      return;
    }
    setIsEditingName(false);
  };

  return (
    <div className="min-h-screen flex flex-col pb-20 lg:pb-0">
      <AppHeader cartCount={isSiswa ? totalItemCount : 0} showCart={isSiswa} showSearch={isSiswa} />

      <div className="flex-1 w-full max-w-container-max mx-auto px-gutter py-margin flex flex-col gap-margin max-w-lg">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile uppercase">
          {isSiswa ? 'Profil Saya' : 'Profil Toko'}
        </h1>

        <div className="border-3 border-outline shadow-lg bg-surface-container-lowest p-6 flex flex-col gap-4">
          <div className="w-20 h-20 border-2 border-outline bg-secondary-container flex items-center justify-center text-3xl mx-auto">
            {isSiswa ? '🎓' : '🏪'}
          </div>
          <div className="text-center">
            {isEditingName ? (
              <div className="flex flex-col gap-3 text-left">
                <Input
                  label="Nama"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  error={nameError ?? undefined}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button variant="primary" onClick={handleSaveName} disabled={isSavingName}>
                    {isSavingName ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditingName(false)} disabled={isSavingName}>
                    Batal
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <p className="font-headline-md text-headline-md uppercase">{user.name}</p>
                <button
                  onClick={startEditingName}
                  aria-label="Edit nama"
                  className="squishy w-8 h-8 flex items-center justify-center border-2 border-outline bg-surface-container-lowest shadow-sm shrink-0"
                >
                  ✏️
                </button>
              </div>
            )}
            <p className="font-mono text-label-sm text-on-surface-variant mt-1">{user.email}</p>
          </div>

          {isSiswa && (
            <div className="grid grid-cols-2 gap-4 border-t-2 border-outline pt-4">
              <div className="text-center">
                <p className="font-mono text-label-sm uppercase text-on-surface-variant">Saldo</p>
                <p className="font-headline-md text-lg font-bold text-primary">{formatRupiah(user.walletBalance)}</p>
              </div>
              <div className="text-center">
                <p className="font-mono text-label-sm uppercase text-on-surface-variant">Poin</p>
                <p className="font-headline-md text-lg font-bold text-primary">{user.points}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {isSiswa ? (
            <>
              <Link href="/pesanan">
                <Button variant="outline" fullWidth>
                  Riwayat Pesanan
                </Button>
              </Link>
              <Link href="/poin">
                <Button variant="outline" fullWidth>
                  Poin &amp; Voucher
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard">
                <Button variant="outline" fullWidth>
                  Dasbor
                </Button>
              </Link>
              <Link href="/kelola-menu">
                <Button variant="outline" fullWidth>
                  Kelola Menu
                </Button>
              </Link>
            </>
          )}
          <Button variant="danger" fullWidth onClick={logout}>
            Keluar
          </Button>
        </div>
      </div>

      <Footer />
      <BottomNav role={isSiswa ? 'siswa' : 'penjual'} />
    </div>
  );
}
