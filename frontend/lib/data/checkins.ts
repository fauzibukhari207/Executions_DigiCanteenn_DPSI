import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { TableCheckIn } from '@/lib/types';
import { BUSINESS_RULES } from '@/lib/types';

interface CheckInRow {
  id: string;
  order_id: string;
  student_id: string;
  table_number: string;
  check_in_at: string;
  check_out_at: string | null;
  is_on_time: boolean | null;
  points_earned: number | null;
}

function ensureSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase belum dikonfigurasi. Isi .env.local terlebih dahulu (lihat SETUP_SUPABASE_XENDIT.md).');
  }
  return supabase;
}

function mapRow(row: CheckInRow): TableCheckIn {
  return {
    id: row.id,
    orderId: row.order_id,
    studentId: row.student_id,
    tableNumber: row.table_number,
    checkInAt: row.check_in_at,
    checkOutAt: row.check_out_at ?? undefined,
    isOnTime: row.is_on_time ?? undefined,
    pointsEarned: row.points_earned ?? undefined,
  };
}

export async function createCheckIn(orderId: string, studentId: string, tableNumber: string): Promise<TableCheckIn> {
  const client = ensureSupabase();
  const { data, error } = await client
    .from('table_checkins')
    .insert({ order_id: orderId, student_id: studentId, table_number: tableNumber })
    .select()
    .single();
  if (error) throw error;
  return mapRow(data);
}

export async function getCheckIn(id: string): Promise<TableCheckIn | undefined> {
  const client = ensureSupabase();
  const { data, error } = await client.from('table_checkins').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapRow(data) : undefined;
}

/**
 * Tutup sesi check-in. `isOnTime` dihitung dari selisih waktu
 * check-in -> check-out dibanding BUSINESS_RULES.CHECKOUT_TIME_LIMIT_MINUTES
 * (lihat lib/types.ts).
 */
export async function completeCheckIn(id: string): Promise<TableCheckIn | undefined> {
  const existing = await getCheckIn(id);
  if (!existing || existing.checkOutAt) return existing;

  const checkOutAt = new Date();
  const checkInAt = new Date(existing.checkInAt);
  const elapsedMinutes = (checkOutAt.getTime() - checkInAt.getTime()) / 60000;
  const isOnTime = elapsedMinutes <= BUSINESS_RULES.CHECKOUT_TIME_LIMIT_MINUTES;
  const pointsEarned = isOnTime ? BUSINESS_RULES.POINTS_PER_ON_TIME_CHECKOUT : 0;

  const client = ensureSupabase();
  const { data, error } = await client
    .from('table_checkins')
    .update({ check_out_at: checkOutAt.toISOString(), is_on_time: isOnTime, points_earned: pointsEarned })
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data) : undefined;
}
