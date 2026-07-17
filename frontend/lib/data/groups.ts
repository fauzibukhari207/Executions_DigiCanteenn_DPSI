import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { GroupOrder } from '@/lib/types';

interface GroupOrderRow {
  id: string;
  code: string;
  host_id: string;
  member_ids: string[];
  status: GroupOrder['status'];
  created_at: string;
}

function ensureSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase belum dikonfigurasi. Isi .env.local terlebih dahulu (lihat SETUP_SUPABASE_XENDIT.md).');
  }
  return supabase;
}

function mapRow(row: GroupOrderRow): GroupOrder {
  return {
    id: row.id,
    code: row.code,
    hostId: row.host_id,
    memberIds: row.member_ids ?? [],
    status: row.status,
    createdAt: row.created_at,
  };
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // tanpa 0/O dan 1/I biar gak ketuker
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function createGroupOrder(hostId: string): Promise<GroupOrder> {
  const client = ensureSupabase();

  // Coba beberapa kali kalau kode kebetulan bentrok (jarang, tapi kolom
  // `code` unique di database jadi tetap wajib ditangani).
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    const { data, error } = await client
      .from('group_orders')
      .insert({ code, host_id: hostId, member_ids: [hostId], status: 'terbuka' })
      .select()
      .maybeSingle();

    if (!error && data) return mapRow(data);
    if (error && error.code !== '23505') throw error; // 23505 = unique_violation di Postgres
  }

  throw new Error('Gagal membuat kode Group Order yang unik, coba lagi.');
}

export async function getGroupOrder(code: string): Promise<GroupOrder | undefined> {
  const client = ensureSupabase();
  const { data, error } = await client.from('group_orders').select('*').eq('code', code.toUpperCase()).maybeSingle();
  if (error) throw error;
  return data ? mapRow(data) : undefined;
}

export async function joinGroupOrder(code: string, userId: string): Promise<GroupOrder | undefined> {
  const existing = await getGroupOrder(code);
  if (!existing) return undefined;
  if (existing.status !== 'terbuka') return existing;
  if (existing.memberIds.includes(userId)) return existing;

  const client = ensureSupabase();
  const { data, error } = await client
    .from('group_orders')
    .update({ member_ids: [...existing.memberIds, userId] })
    .eq('code', code.toUpperCase())
    .select()
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data) : undefined;
}

export async function leaveGroupOrder(code: string, userId: string): Promise<GroupOrder | undefined> {
  const existing = await getGroupOrder(code);
  if (!existing) return undefined;

  const client = ensureSupabase();
  const { data, error } = await client
    .from('group_orders')
    .update({ member_ids: existing.memberIds.filter((id) => id !== userId) })
    .eq('code', code.toUpperCase())
    .select()
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data) : undefined;
}

export async function lockGroupOrder(code: string): Promise<GroupOrder | undefined> {
  const client = ensureSupabase();
  const { data, error } = await client
    .from('group_orders')
    .update({ status: 'terkunci' })
    .eq('code', code.toUpperCase())
    .select()
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data) : undefined;
}
