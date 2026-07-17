'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import type { CartItemOption } from '@/lib/types';

export interface CartLine {
  lineId: string; // unik per kombinasi menu+opsi, supaya bisa beda baris walau menu sama
  menuItemId: string;
  quantity: number;
  note?: string;
  selectedOptions: CartItemOption[];
}

interface CartContextValue {
  lines: CartLine[];
  groupCode: string | null;
  addItem: (menuItemId: string, quantity: number, selectedOptions: CartItemOption[], note?: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
  clearCart: () => void;
  setGroupCode: (code: string | null) => void;
  totalItemCount: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = 'digicanteen-cart-v1';

function loadFromStorage(): { lines: CartLine[]; groupCode: string | null } {
  if (typeof window === 'undefined') return { lines: [], groupCode: null };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { lines: [], groupCode: null };
    const parsed = JSON.parse(raw);
    return { lines: parsed.lines ?? [], groupCode: parsed.groupCode ?? null };
  } catch {
    return { lines: [], groupCode: null };
  }
}

/**
 * Cart Context — Batch 4.
 *
 * Disimpan di localStorage supaya keranjang tidak hilang saat halaman
 * di-refresh. Ini BUKAN pengganti database: kalau ganti browser/device,
 * keranjang tidak akan ikut (baru sinkron sungguhan setelah tabel
 * `carts`/`orders` di Supabase dipasang).
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [groupCode, setGroupCodeState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const { lines: storedLines, groupCode: storedGroup } = loadFromStorage();
    setLines(storedLines);
    setGroupCodeState(storedGroup);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ lines, groupCode }));
  }, [lines, groupCode, hydrated]);

  const addItem = useCallback(
    (menuItemId: string, quantity: number, selectedOptions: CartItemOption[], note?: string) => {
      setLines((prev) => {
        // Kombinasi menu + opsi + catatan yang identik digabung jadi satu baris.
        const optionKey = selectedOptions
          .map((o) => o.id)
          .sort()
          .join(',');
        const existingIndex = prev.findIndex(
          (l) =>
            l.menuItemId === menuItemId &&
            l.selectedOptions
              .map((o) => o.id)
              .sort()
              .join(',') === optionKey &&
            (l.note ?? '') === (note ?? '')
        );
        if (existingIndex >= 0) {
          const next = [...prev];
          next[existingIndex] = { ...next[existingIndex], quantity: next[existingIndex].quantity + quantity };
          return next;
        }
        return [
          ...prev,
          {
            lineId: `${menuItemId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            menuItemId,
            quantity,
            note,
            selectedOptions,
          },
        ];
      });
    },
    []
  );

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    setLines((prev) =>
      prev
        .map((l) => (l.lineId === lineId ? { ...l, quantity } : l))
        .filter((l) => l.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((lineId: string) => {
    setLines((prev) => prev.filter((l) => l.lineId !== lineId));
  }, []);

  const clearCart = useCallback(() => {
    setLines([]);
  }, []);

  const setGroupCode = useCallback((code: string | null) => {
    setGroupCodeState(code);
  }, []);

  const totalItemCount = lines.reduce((sum, l) => sum + l.quantity, 0);

  return (
    <CartContext.Provider
      value={{ lines, groupCode, addItem, updateQuantity, removeItem, clearCart, setGroupCode, totalItemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart harus dipakai di dalam <CartProvider>');
  return ctx;
}
