import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Order, OrderStatus, CartItem } from '@/lib/types';
import type { CartLine } from '@/lib/cart/CartContext';

interface OrderRow {
  id: string;
  student_id: string;
  group_order_id: string | null;
  items: CartItem[];
  subtotal: number;
  service_fee: number;
  discount: number;
  total: number;
  pickup_time: string;
  status: OrderStatus;
  payment_method: 'qris' | 'saldo';
  created_at: string;
}

function ensureSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase belum dikonfigurasi. Isi .env.local terlebih dahulu (lihat SETUP_SUPABASE_XENDIT.md).');
  }
  return supabase;
}

function mapRow(row: OrderRow): Order {
  return {
    id: row.id,
    studentId: row.student_id,
    groupOrderId: row.group_order_id ?? undefined,
    items: row.items ?? [],
    subtotal: row.subtotal,
    serviceFee: row.service_fee,
    discount: row.discount,
    total: row.total,
    pickupTime: row.pickup_time,
    status: row.status,
    paymentMethod: row.payment_method,
    createdAt: row.created_at,
  };
}

export async function createOrder(params: {
  studentId: string;
  lines: CartLine[];
  subtotal: number;
  serviceFee: number;
  total: number;
  pickupTime: string;
  paymentMethod: 'qris' | 'saldo';
  groupOrderId?: string;
}): Promise<Order> {
  const client = ensureSupabase();
  const items: CartItem[] = params.lines.map((l) => ({
    menuItemId: l.menuItemId,
    quantity: l.quantity,
    note: l.note,
    selectedOptions: l.selectedOptions,
  }));

  const { data: row, error } = await client
    .from('orders')
    .insert({
      student_id: params.studentId,
      group_order_id: params.groupOrderId ?? null,
      items,
      subtotal: params.subtotal,
      service_fee: params.serviceFee,
      discount: 0,
      total: params.total,
      pickup_time: params.pickupTime,
      status: 'menunggu-pembayaran',
      payment_method: params.paymentMethod,
    })
    .select()
    .single();
  if (error) throw error;
  return mapRow(row);
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  const client = ensureSupabase();
  const { data, error } = await client.from('orders').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapRow(data) : undefined;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order | undefined> {
  const client = ensureSupabase();
  const { data, error } = await client.from('orders').update({ status }).eq('id', id).select().maybeSingle();
  if (error) throw error;
  return data ? mapRow(data) : undefined;
}

export async function getOrdersByStudent(studentId: string): Promise<Order[]> {
  const client = ensureSupabase();
  const { data, error } = await client
    .from('orders')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

/**
 * Semua pesanan yang boleh dilihat penjual yang login. Query di sini
 * sengaja "select semua" -- baris yang benar-benar dikembalikan sudah
 * disaring otomatis oleh Row Level Security di database (kebijakan
 * "Penjual lihat pesanan yang ada menunya" di supabase_schema.sql),
 * jadi penjual A tidak akan pernah menerima baris milik penjual B.
 */
export async function getOrdersForSeller(_sellerId: string): Promise<Order[]> {
  const client = ensureSupabase();
  const { data, error } = await client.from('orders').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}
