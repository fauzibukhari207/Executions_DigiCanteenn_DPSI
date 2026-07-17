import type { CartLine } from '@/lib/cart/CartContext';
import { getMenuItemsByIds } from '@/lib/data/menu';
import { BUSINESS_RULES } from '@/lib/types';

export interface CartTotals {
  subtotal: number;
  serviceFee: number;
  total: number;
  itemCount: number;
}

/**
 * Satu-satunya tempat rumus subtotal/biaya layanan/total dihitung,
 * supaya Keranjang dan Checkout selalu menampilkan angka yang sama
 * persis. Sejak migrasi Supabase, ini async (query database sekali
 * pakai `getMenuItemsByIds` -- bukan query satu-satu per baris).
 */
export async function calculateCartTotals(lines: CartLine[]): Promise<CartTotals> {
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  if (lines.length === 0) {
    return { subtotal: 0, serviceFee: 0, total: 0, itemCount: 0 };
  }

  const items = await getMenuItemsByIds(lines.map((l) => l.menuItemId));
  const itemById = new Map(items.map((item) => [item.id, item]));

  const subtotal = lines.reduce((sum, line) => {
    const item = itemById.get(line.menuItemId);
    if (!item) return sum;
    const unit = (item.discountPrice ?? item.price) + line.selectedOptions.reduce((s, o) => s + o.extraPrice, 0);
    return sum + unit * line.quantity;
  }, 0);

  const serviceFee = itemCount > 0 ? BUSINESS_RULES.SERVICE_FEE : 0;
  return { subtotal, serviceFee, total: subtotal + serviceFee, itemCount };
}
