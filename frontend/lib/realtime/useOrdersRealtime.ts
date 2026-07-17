'use client';

import { useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

/**
 * Berlangganan perubahan realtime di tabel `orders` (insert/update/
 * delete apa pun), lalu panggil `onChange` supaya halaman bisa
 * refetch datanya. Dipakai di halaman Pesanan Masuk (penjual),
 * Dasbor (penjual), Riwayat Pesanan (siswa), dan NotificationBell --
 * jadi begitu siswa checkout atau penjual update status, semua
 * halaman yang relevan otomatis update TANPA perlu refresh manual.
 *
 * PENTING: Supabase Realtime untuk tabel `orders` harus diaktifkan
 * dulu di dashboard (Database > Replication > toggle tabel `orders`
 * ON), atau lewat SQL `alter publication supabase_realtime add table orders;`
 * -- lihat SETUP_SUPABASE_XENDIT.md bagian Realtime. Kalau belum
 * diaktifkan, hook ini tidak akan error, cuma tidak akan pernah
 * menerima event apa pun (silent no-op).
 */
export function useOrdersRealtime(onChange: () => void) {
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    const client = supabase;

    // Nama channel HARUS unik per komponen yang berlangganan. Kalau
    // dua komponen sekaligus aktif di halaman yang sama (mis. halaman
    // Dasbor + NotificationBell di header) memakai nama channel yang
    // SAMA, Supabase-js akan mengembalikan objek channel yang sama
    // yang sudah ter-subscribe, dan pemanggilan `.on()` kedua akan
    // error: "cannot add postgres_changes callbacks ... after
    // subscribe()". Suffix acak di bawah ini mencegah tabrakan itu.
    const channelName = `orders-changes-${Math.random().toString(36).slice(2, 10)}`;

    const channel = client
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        onChange();
      })
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [onChange]);
}
