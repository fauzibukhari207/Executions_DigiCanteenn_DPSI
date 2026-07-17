import { createClient } from '@supabase/supabase-js';

/**
 * Client Supabase. Selama NEXT_PUBLIC_SUPABASE_URL / ANON_KEY belum
 * diisi di .env.local (lihat .env.example), fungsi-fungsi di
 * lib/data/* akan memakai mock data, bukan client ini.
 *
 * Setelah kamu punya project Supabase:
 * 1. Copy .env.example -> .env.local
 * 2. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY
 *    dari Project Settings > API di dashboard Supabase
 * 3. Ganti isi fungsi di lib/data/*.ts dari "return MOCK_..." menjadi
 *    query lewat `supabase.from(...)`.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
