'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { User, UserRole } from '@/lib/types';

/**
 * Session Provider — Supabase Auth beneran (sejak migrasi database).
 *
 * Menggantikan lib/auth/mock-session.tsx. Nama hook (`useSession`)
 * sengaja dipertahankan sama supaya sebagian besar halaman yang
 * hanya baca `user`/`isLoading` tidak perlu diubah — yang berubah
 * cuma cara login/logout (lihat perbandingan di bawah).
 *
 * Perbedaan dari versi mock:
 * - `login(role)` -> `signIn(email, password)` (role sekarang datang dari
 *   tabel `profiles`, bukan dipilih manual)
 * - Tambahan `signUp(email, password, name, role)` untuk pendaftaran akun baru
 * - `logout` sekarang async (memanggil `supabase.auth.signOut()`)
 */

interface SessionContextValue {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null; role: UserRole | null }>;
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  adjustWalletBalance: (delta: number) => Promise<void>;
  addPoints: (delta: number) => Promise<void>;
  updateName: (name: string) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

function mapProfileRow(row: {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  wallet_balance: number;
  points: number;
}): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    walletBalance: row.wallet_balance,
    points: row.points,
  };
}

async function fetchProfile(userId: string): Promise<User | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error || !data) return null;
  return mapProfileRow(data);
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      // Belum ada .env.local terisi -> anggap tidak ada sesi, tapi jangan
      // nge-hang di "Memuat..." selamanya.
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      const sessionUser = data.session?.user;
      if (sessionUser) {
        const profile = await fetchProfile(sessionUser.id);
        if (isMounted) setUser(profile);
      }
      if (isMounted) setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (isMounted) setUser(profile);
      } else {
        if (isMounted) setUser(null);
      }
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn: SessionContextValue['signIn'] = async (email, password) => {
    if (!supabase) return { error: 'Supabase belum dikonfigurasi. Isi .env.local terlebih dahulu.', role: null };
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message, role: null };
    const profile = data.user ? await fetchProfile(data.user.id) : null;
    if (profile) setUser(profile);
    return { error: null, role: profile?.role ?? null };
  };

  const signUp: SessionContextValue['signUp'] = async (email, password, name, role) => {
    if (!supabase) return { error: 'Supabase belum dikonfigurasi. Isi .env.local terlebih dahulu.' };
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    });
    if (error) return { error: error.message };

    // Kalau "Confirm email" masih aktif di Supabase, signUp TIDAK langsung
    // memberi sesi aktif -- coba sign-in manual sekali; kalau gagal berarti
    // memang perlu verifikasi email dulu.
    if (!data.session) {
      const retry = await supabase.auth.signInWithPassword({ email, password });
      if (retry.error) {
        return {
          error:
            'Akun berhasil dibuat! Tapi email verifikasi sepertinya masih aktif di project Supabase kamu -- cek inbox untuk konfirmasi sebelum login, atau matikan "Confirm email" di Authentication > Settings untuk mode development.',
        };
      }
      const profile = retry.data.user ? await fetchProfile(retry.data.user.id) : null;
      if (profile) setUser(profile);
    } else {
      const profile = data.user ? await fetchProfile(data.user.id) : null;
      if (profile) setUser(profile);
    }

    return { error: null };
  };

  const logout = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
  };

  const refreshProfile = async () => {
    if (!user) return;
    const profile = await fetchProfile(user.id);
    if (profile) setUser(profile);
  };

  const adjustWalletBalance = async (delta: number) => {
    if (!supabase || !user) return;
    const newBalance = user.walletBalance + delta;
    setUser({ ...user, walletBalance: newBalance }); // optimistic update
    const { error } = await supabase.from('profiles').update({ wallet_balance: newBalance }).eq('id', user.id);
    if (error) {
      // Gagal simpan ke server -> balikin ke nilai semula supaya UI tidak bohong.
      setUser({ ...user, walletBalance: user.walletBalance });
    }
  };

  const addPoints = async (delta: number) => {
    if (!supabase || !user) return;
    const newPoints = user.points + delta;
    setUser({ ...user, points: newPoints }); // optimistic update
    const { error } = await supabase.from('profiles').update({ points: newPoints }).eq('id', user.id);
    if (error) {
      setUser({ ...user, points: user.points });
    }
  };

  const updateName: SessionContextValue['updateName'] = async (name) => {
    if (!supabase || !user) return { error: 'Belum login.' };
    const trimmed = name.trim();
    if (trimmed.length < 3) return { error: 'Nama minimal 3 karakter.' };

    const previousName = user.name;
    setUser({ ...user, name: trimmed }); // optimistic update
    const { error } = await supabase.from('profiles').update({ name: trimmed }).eq('id', user.id);
    if (error) {
      setUser({ ...user, name: previousName });
      return { error: error.message };
    }
    return { error: null };
  };

  return (
    <SessionContext.Provider
      value={{ user, isLoading, signIn, signUp, logout, adjustWalletBalance, addPoints, updateName, refreshProfile }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession harus dipakai di dalam <SessionProvider>');
  }
  return ctx;
}
