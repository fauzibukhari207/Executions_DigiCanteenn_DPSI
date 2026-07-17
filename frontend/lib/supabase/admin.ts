import { createClient } from '@supabase/supabase-js';

/**
 * Client Supabase pakai SERVICE ROLE KEY -- bisa bypass semua Row
 * Level Security. HANYA boleh diimpor dari kode server (Route
 * Handler di app/api/**), JANGAN PERNAH dari komponen client ('use
 * client') -- kalau key ini bocor ke browser, siapa saja bisa
 * baca/ubah/hapus SEMUA data di database tanpa batasan sama sekali.
 *
 * Dipakai khusus untuk aksi "sistem" yang perlu menembus batasan RLS
 * normal, misalnya: mengurangi stok menu penjual lain saat siswa
 * checkout (siswa tidak dan tidak boleh punya izin RLS untuk
 * mengubah data milik penjual secara langsung).
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

export const isSupabaseAdminConfigured = Boolean(supabaseUrl && serviceRoleKey);

export const supabaseAdmin = isSupabaseAdminConfigured
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;
