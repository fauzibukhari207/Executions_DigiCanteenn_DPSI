'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useSession } from '@/lib/auth/session';
import { getMenuItemsBySeller, deleteMenuItem, toggleMenuAvailability } from '@/lib/data/menu';
import type { MenuItem } from '@/lib/types';

function formatRupiah(amount: number) {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

export default function KelolaMenuPage() {
  const { user } = useSession();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    if (!user) return;
    const fetched = await getMenuItemsBySeller(user.id);
    setItems(fetched);
    setIsLoading(false);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-container-max mx-auto px-gutter py-margin flex flex-col items-center text-center gap-6 min-h-[50vh] justify-center">
        <p className="font-mono text-label-bold uppercase text-on-surface-variant">Login dulu sebagai penjual.</p>
        <Link href="/login">
          <Button variant="primary">Masuk</Button>
        </Link>
      </div>
    );
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Hapus menu "${name}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    await deleteMenuItem(id);
    refresh();
  };

  const handleToggle = async (id: string) => {
    await toggleMenuAvailability(id);
    refresh();
  };

  return (
    <div className="max-w-container-max mx-auto px-gutter py-margin flex flex-col gap-margin">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile uppercase">Kelola Menu</h1>
        <Link href="/kelola-menu/baru">
          <Button variant="primary">+ Tambah Menu</Button>
        </Link>
      </div>

      {isLoading ? (
        <p className="font-mono text-label-bold uppercase text-on-surface-variant animate-pulse">Memuat menu...</p>
      ) : items.length === 0 ? (
        <div className="border-3 border-outline shadow-md p-10 flex flex-col items-center gap-4 text-center bg-surface-container-lowest">
          <span className="text-5xl" aria-hidden>
            🍱
          </span>
          <p className="font-mono text-label-bold uppercase text-on-surface-variant">Belum ada menu.</p>
          <Link href="/kelola-menu/baru">
            <Button variant="primary">Tambah Menu Pertama</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="border-3 border-outline shadow-md bg-surface-container-lowest flex flex-col">
              <div className="relative h-36 border-b-2 border-outline overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                {!item.isAvailable && (
                  <div className="absolute inset-0 bg-on-background/70 flex items-center justify-center">
                    <Badge tone="error">Habis</Badge>
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col gap-3 flex-1">
                <h3 className="font-headline-md text-lg font-extrabold uppercase leading-tight">{item.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-primary">{formatRupiah(item.price)}</span>
                  <span className="font-mono text-label-sm uppercase text-on-surface-variant">Stok: {item.stock}</span>
                </div>
                <div className="mt-auto flex flex-wrap gap-2">
                  <Link href={`/kelola-menu/${item.id}/edit`} className="flex-1">
                    <Button variant="outline" fullWidth>
                      Edit
                    </Button>
                  </Link>
                  <Button variant="secondary" onClick={() => handleToggle(item.id)}>
                    {item.isAvailable ? 'Tandai Habis' : 'Tandai Ada'}
                  </Button>
                  <Button variant="danger" onClick={() => handleDelete(item.id, item.name)}>
                    Hapus
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
