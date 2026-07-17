'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';
import MenuCard from '@/components/menu/MenuCard';
import { useSession } from '@/lib/auth/session';
import { getAllMenuItems } from '@/lib/data/menu';
import type { MenuBadge, MenuItem } from '@/lib/types';

const QUICK_FILTERS: { id: MenuBadge | 'all'; label: string }[] = [
  { id: 'all', label: 'Semua' },
  { id: 'spicy', label: '🔥 Spicy' },
  { id: 'vegetarian', label: '🌱 Vegetarian' },
  { id: 'healthy-choice', label: '🍗 Healthy' },
  { id: 'quick-grab', label: '⚡ Quick Grab' },
];

export default function BerandaPage() {
  const { user } = useSession();
  const [filter, setFilter] = useState<MenuBadge | 'all'>('all');
  const [allItems, setAllItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getAllMenuItems()
      .then((items) => {
        if (!cancelled) setAllItems(items);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const bestSeller = useMemo(() => allItems.find((i) => i.badges.includes('best-seller')), [allItems]);

  const specials = useMemo(() => {
    const items = filter === 'all' ? allItems : allItems.filter((i) => i.badges.includes(filter));
    // Best seller unggulan sudah tampil terpisah di kartu besar, jangan duplikat di grid bawah.
    return items.filter((i) => i.id !== bestSeller?.id).slice(0, 6);
  }, [allItems, filter, bestSeller]);

  return (
    <div className="max-w-container-max mx-auto px-gutter py-margin flex flex-col gap-margin">
      {/* Hero */}
      <section className="relative bg-secondary-container border-4 border-outline shadow-xl min-h-[280px] flex items-center p-8 md:p-12 overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <span className="inline-block px-4 py-1 bg-on-background text-surface font-mono text-label-bold mb-4 uppercase tracking-widest">
            Siap Makan Siang?
          </span>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg uppercase leading-[0.95] mb-4">
            Halo, {user?.name ?? 'Siswa'}!
          </h1>
          <p className="font-body-md text-body-md font-medium mb-6 max-w-md border-l-4 border-outline pl-4">
            Lewati antrean panjang — pesan menu favoritmu sekarang, ambil pas jam istirahat.
          </p>
          <Link href="/menu">
            <Button variant="primary">Pesan Sekarang</Button>
          </Link>
        </div>
      </section>

      {/* Quick Filters */}
      <section>
        <h2 className="font-headline-md text-headline-md uppercase mb-4">Filter Cepat</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {QUICK_FILTERS.map((f) => (
            <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label}
            </Chip>
          ))}
        </div>
      </section>

      {/* Chef's Specials */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-md text-headline-md uppercase">Rekomendasi Hari Ini</h2>
          <Link href="/menu" className="font-mono text-label-bold uppercase underline decoration-2 underline-offset-4">
            Lihat Semua
          </Link>
        </div>

        {isLoading ? (
          <p className="font-mono text-label-bold uppercase text-on-surface-variant animate-pulse">Memuat menu...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {bestSeller && (
                <div className="md:col-span-12 lg:col-span-6">
                  <MenuCard item={bestSeller} />
                </div>
              )}
              <div className="md:col-span-12 lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {specials.slice(0, 2).map((item) => (
                  <MenuCard key={item.id} item={item} />
                ))}
              </div>
            </div>

            {specials.length > 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {specials.slice(2).map((item) => (
                  <MenuCard key={item.id} item={item} />
                ))}
              </div>
            )}

            {specials.length === 0 && !bestSeller && (
              <p className="font-mono text-label-bold uppercase text-on-surface-variant">
                Belum ada menu tersedia. Kalau kamu penjual, tambah menu dulu lewat halaman Kelola Menu.
              </p>
            )}
          </>
        )}
      </section>
    </div>
  );
}
