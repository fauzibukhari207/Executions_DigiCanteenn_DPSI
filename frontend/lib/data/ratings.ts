import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Rating } from '@/lib/types';

interface RatingRow {
  id: string;
  order_id: string;
  menu_item_id: string;
  student_id: string;
  stars: number;
  comment: string | null;
  created_at: string;
}

function ensureSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase belum dikonfigurasi. Isi .env.local terlebih dahulu (lihat SETUP_SUPABASE_XENDIT.md).');
  }
  return supabase;
}

function mapRow(row: RatingRow): Rating {
  return {
    id: row.id,
    orderId: row.order_id,
    menuItemId: row.menu_item_id,
    studentId: row.student_id,
    stars: row.stars as Rating['stars'],
    comment: row.comment ?? undefined,
    createdAt: row.created_at,
  };
}

/**
 * Simpan rating. Memakai `upsert` dengan kunci unik
 * (order_id, menu_item_id, student_id) -- lihat constraint `unique`
 * di supabase_schema.sql -- supaya siswa yang mengirim ulang rating
 * untuk kombinasi yang sama akan MENIMPA rating lamanya, bukan bikin
 * baris duplikat.
 */
export async function addRating(params: {
  orderId: string;
  menuItemId: string;
  studentId: string;
  stars: 1 | 2 | 3 | 4 | 5;
  comment?: string;
}): Promise<Rating> {
  const client = ensureSupabase();
  const { data, error } = await client
    .from('ratings')
    .upsert(
      {
        order_id: params.orderId,
        menu_item_id: params.menuItemId,
        student_id: params.studentId,
        stars: params.stars,
        comment: params.comment ?? null,
      },
      { onConflict: 'order_id,menu_item_id,student_id' }
    )
    .select()
    .single();
  if (error) throw error;
  return mapRow(data);
}

export async function getRatingsForOrder(orderId: string): Promise<Rating[]> {
  const client = ensureSupabase();
  const { data, error } = await client.from('ratings').select('*').eq('order_id', orderId);
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function getRatingsForMenuItem(menuItemId: string): Promise<Rating[]> {
  const client = ensureSupabase();
  const { data, error } = await client.from('ratings').select('*').eq('menu_item_id', menuItemId);
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function getAverageRatingForMenuItem(menuItemId: string): Promise<{ average: number; count: number }> {
  const ratings = await getRatingsForMenuItem(menuItemId);
  if (ratings.length === 0) return { average: 0, count: 0 };
  const sum = ratings.reduce((s, r) => s + r.stars, 0);
  return { average: sum / ratings.length, count: ratings.length };
}

export async function hasRatedOrder(orderId: string, studentId: string): Promise<boolean> {
  const client = ensureSupabase();
  const { data, error } = await client
    .from('ratings')
    .select('id')
    .eq('order_id', orderId)
    .eq('student_id', studentId)
    .limit(1);
  if (error) throw error;
  return (data ?? []).length > 0;
}

/**
 * Semua rating untuk menu-menu milik seorang penjual. Karena tabel
 * `ratings` tidak punya kolom `seller_id` langsung, ini query dua
 * langkah: ambil dulu ID menu milik penjual, baru ambil rating yang
 * `menu_item_id`-nya ada di daftar itu.
 */
export async function getRatingsForSeller(sellerId: string): Promise<Rating[]> {
  const client = ensureSupabase();
  const { data: menuRows, error: menuError } = await client
    .from('menu_items')
    .select('id')
    .eq('seller_id', sellerId);
  if (menuError) throw menuError;

  const menuIds = (menuRows ?? []).map((m: { id: string }) => m.id);
  if (menuIds.length === 0) return [];

  const { data, error } = await client
    .from('ratings')
    .select('*')
    .in('menu_item_id', menuIds)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}
