import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { MenuItem, MenuCategory } from '@/lib/types';

/**
 * Data menu — sejak migrasi ke Supabase, semua fungsi di sini query
 * ke tabel `menu_items` beneran (sebelumnya localStorage). Kalau
 * Supabase belum dikonfigurasi (.env.local kosong), fungsi melempar
 * error yang jelas alih-alih diam-diam gagal.
 *
 * PENTING: tidak ada lagi data seed otomatis (dulu MOCK_MENU_ITEMS).
 * Penjual perlu mendaftar dulu, lalu tambah menu sendiri lewat
 * halaman Kelola Menu -- sama seperti aplikasi produksi beneran.
 */

interface MenuItemRow {
  id: string;
  seller_id: string;
  name: string;
  description: string;
  price: number;
  discount_price: number | null;
  image_url: string;
  category: MenuCategory;
  badges: MenuItem['badges'];
  calories: number;
  protein: number | null;
  fat: number | null;
  ingredients: string[];
  custom_options: MenuItem['customOptions'];
  is_available: boolean;
  stock: number;
}

function ensureSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase belum dikonfigurasi. Isi .env.local terlebih dahulu (lihat SETUP_SUPABASE_XENDIT.md).');
  }
  return supabase;
}

// Primary key menu_items di database adalah tipe `uuid`. Kalau ada ID
// "nyasar" yang formatnya bukan uuid (paling sering terjadi karena
// keranjang di browser masih menyimpan ID lama dari sebelum migrasi
// ke Supabase, format lama pakai slug seperti "nasi-goreng-a1b2"),
// query `.eq()`/`.in()` ke Postgres akan ERROR keras (invalid input
// syntax for type uuid) alih-alih mengembalikan "tidak ketemu". Kalau
// error ini tidak ditangani, halaman yang menunggu hasilnya akan
// nge-hang selamanya di status "Memuat...". Makanya ID divalidasi
// dulu di sini SEBELUM dikirim ke database.
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(id: string): boolean {
  return UUID_REGEX.test(id);
}

function mapRow(row: MenuItemRow): MenuItem {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    discountPrice: row.discount_price ?? undefined,
    imageUrl: row.image_url,
    category: row.category,
    badges: row.badges ?? [],
    calories: row.calories,
    protein: row.protein ?? undefined,
    fat: row.fat ?? undefined,
    ingredients: row.ingredients ?? [],
    customOptions: row.custom_options ?? [],
    isAvailable: row.is_available,
    stock: row.stock,
    sellerId: row.seller_id,
  };
}

export async function getAllMenuItems(): Promise<MenuItem[]> {
  const client = ensureSupabase();
  const { data, error } = await client.from('menu_items').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function getMenuItemById(id: string): Promise<MenuItem | undefined> {
  if (!isValidUuid(id)) return undefined; // ID lama/tidak valid -> anggap tidak ketemu, jangan crash
  const client = ensureSupabase();
  const { data, error } = await client.from('menu_items').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapRow(data) : undefined;
}

export async function getMenuItemsByIds(ids: string[]): Promise<MenuItem[]> {
  const validIds = ids.filter(isValidUuid); // buang ID lama/tidak valid sebelum query
  if (validIds.length === 0) return [];
  const client = ensureSupabase();
  const { data, error } = await client.from('menu_items').select('*').in('id', validIds);
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function getMenuItemsByCategory(category?: MenuCategory | 'all'): Promise<MenuItem[]> {
  const client = ensureSupabase();
  let query = client.from('menu_items').select('*');
  if (category && category !== 'all') query = query.eq('category', category);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function getBestSellers(): Promise<MenuItem[]> {
  const client = ensureSupabase();
  const { data, error } = await client.from('menu_items').select('*').contains('badges', ['best-seller']);
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function getMenuItemsBySeller(sellerId: string): Promise<MenuItem[]> {
  const client = ensureSupabase();
  const { data, error } = await client
    .from('menu_items')
    .select('*')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function createMenuItem(data: Omit<MenuItem, 'id'>): Promise<MenuItem> {
  const client = ensureSupabase();
  const { data: row, error } = await client
    .from('menu_items')
    .insert({
      seller_id: data.sellerId,
      name: data.name,
      description: data.description,
      price: data.price,
      discount_price: data.discountPrice ?? null,
      image_url: data.imageUrl,
      category: data.category,
      badges: data.badges,
      calories: data.calories,
      protein: data.protein ?? null,
      fat: data.fat ?? null,
      ingredients: data.ingredients,
      custom_options: data.customOptions ?? [],
      is_available: data.isAvailable,
      stock: data.stock,
    })
    .select()
    .single();
  if (error) throw error;
  return mapRow(row);
}

export async function updateMenuItem(id: string, updates: Partial<Omit<MenuItem, 'id'>>): Promise<MenuItem | undefined> {
  const client = ensureSupabase();
  const payload: Record<string, unknown> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.price !== undefined) payload.price = updates.price;
  if (updates.discountPrice !== undefined) payload.discount_price = updates.discountPrice;
  if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.badges !== undefined) payload.badges = updates.badges;
  if (updates.calories !== undefined) payload.calories = updates.calories;
  if (updates.protein !== undefined) payload.protein = updates.protein;
  if (updates.fat !== undefined) payload.fat = updates.fat;
  if (updates.ingredients !== undefined) payload.ingredients = updates.ingredients;
  if (updates.customOptions !== undefined) payload.custom_options = updates.customOptions;
  if (updates.isAvailable !== undefined) payload.is_available = updates.isAvailable;
  if (updates.stock !== undefined) payload.stock = updates.stock;

  const { data: row, error } = await client.from('menu_items').update(payload).eq('id', id).select().maybeSingle();
  if (error) throw error;
  return row ? mapRow(row) : undefined;
}

export async function deleteMenuItem(id: string): Promise<void> {
  const client = ensureSupabase();
  const { error } = await client.from('menu_items').delete().eq('id', id);
  if (error) throw error;
}

export async function toggleMenuAvailability(id: string): Promise<MenuItem | undefined> {
  const item = await getMenuItemById(id);
  if (!item) return undefined;
  return updateMenuItem(id, { isAvailable: !item.isAvailable });
}
