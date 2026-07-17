import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { PointHistoryEntry, Voucher } from '@/lib/types';
import { BUSINESS_RULES } from '@/lib/types';

interface PointHistoryRow {
  id: string;
  student_id: string;
  points: number;
  reason: string;
  created_at: string;
}

interface VoucherRow {
  id: string;
  student_id: string;
  points_cost: number;
  discount_amount: number;
  is_used: boolean;
  created_at: string;
}

function ensureSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase belum dikonfigurasi. Isi .env.local terlebih dahulu (lihat SETUP_SUPABASE_XENDIT.md).');
  }
  return supabase;
}

function mapHistoryRow(row: PointHistoryRow): PointHistoryEntry {
  return { id: row.id, studentId: row.student_id, points: row.points, reason: row.reason, createdAt: row.created_at };
}

function mapVoucherRow(row: VoucherRow): Voucher {
  return {
    id: row.id,
    studentId: row.student_id,
    pointsCost: row.points_cost,
    discountAmount: row.discount_amount,
    isUsed: row.is_used,
    createdAt: row.created_at,
  };
}

export async function addPointEntry(studentId: string, points: number, reason: string): Promise<PointHistoryEntry> {
  const client = ensureSupabase();
  const { data, error } = await client
    .from('point_history')
    .insert({ student_id: studentId, points, reason })
    .select()
    .single();
  if (error) throw error;
  return mapHistoryRow(data);
}

export async function getPointHistory(studentId: string): Promise<PointHistoryEntry[]> {
  const client = ensureSupabase();
  const { data, error } = await client
    .from('point_history')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapHistoryRow);
}

export async function getVouchers(studentId: string): Promise<Voucher[]> {
  const client = ensureSupabase();
  const { data, error } = await client
    .from('vouchers')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapVoucherRow);
}

/**
 * Tukar poin jadi voucher. Mengembalikan `null` kalau poin kurang.
 * Pemanggil (halaman /poin) tetap bertanggung jawab mengurangi
 * `user.points` di sesi lewat `addPoints(-BUSINESS_RULES.POINTS_TO_VOUCHER_RATIO)`.
 */
export async function redeemVoucher(studentId: string, currentPoints: number): Promise<Voucher | null> {
  if (currentPoints < BUSINESS_RULES.POINTS_TO_VOUCHER_RATIO) return null;

  const client = ensureSupabase();
  const { data, error } = await client
    .from('vouchers')
    .insert({
      student_id: studentId,
      points_cost: BUSINESS_RULES.POINTS_TO_VOUCHER_RATIO,
      discount_amount: BUSINESS_RULES.VOUCHER_DISCOUNT_AMOUNT,
      is_used: false,
    })
    .select()
    .single();
  if (error) throw error;

  await addPointEntry(studentId, -BUSINESS_RULES.POINTS_TO_VOUCHER_RATIO, 'Ditukar ke voucher diskon');

  return mapVoucherRow(data);
}
