'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from '@/lib/auth/session';
import { getMenuItemsBySeller } from '@/lib/data/menu';
import { getRatingsForSeller } from '@/lib/data/ratings';
import type { MenuItem, Rating } from '@/lib/types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

function StarsDisplay({ stars }: { stars: number }) {
  return (
    <span aria-label={`${stars} dari 5 bintang`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= stars ? '' : 'grayscale opacity-30'} aria-hidden>
          ⭐
        </span>
      ))}
    </span>
  );
}

export default function UlasanMenuPage() {
  const { user } = useSession();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterMenuId, setFilterMenuId] = useState<string | 'semua'>('semua');

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    Promise.all([getMenuItemsBySeller(user.id), getRatingsForSeller(user.id)]).then(([items, sellerRatings]) => {
      if (cancelled) return;
      setMenuItems(items);
      setRatings(sellerRatings);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const menuById = useMemo(() => {
    const map: Record<string, MenuItem> = {};
    menuItems.forEach((m) => {
      map[m.id] = m;
    });
    return map;
  }, [menuItems]);

  const overallAverage = useMemo(() => {
    if (ratings.length === 0) return 0;
    return ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length;
  }, [ratings]);

  const perMenuStats = useMemo(() => {
    const stats: Record<string, { count: number; average: number }> = {};
    menuItems.forEach((m) => {
      const menuRatings = ratings.filter((r) => r.menuItemId === m.id);
      stats[m.id] = {
        count: menuRatings.length,
        average: menuRatings.length > 0 ? menuRatings.reduce((s, r) => s + r.stars, 0) / menuRatings.length : 0,
      };
    });
    return stats;
  }, [menuItems, ratings]);

  const filteredRatings = filterMenuId === 'semua' ? ratings : ratings.filter((r) => r.menuItemId === filterMenuId);

  if (isLoading) {
    return (
      <div className="max-w-container-max mx-auto px-gutter py-margin text-center">
        <p className="font-mono text-label-bold uppercase text-on-surface-variant animate-pulse">Memuat ulasan...</p>
      </div>
    );
  }

  return (
    <div className="max-w-container-max mx-auto px-gutter py-margin flex flex-col gap-margin">
      <h1 className="font-headline-lg-mobile text-headline-lg-mobile uppercase">Ulasan Menu</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="border-3 border-outline shadow-md bg-secondary-container p-6 flex flex-col gap-2">
          <span className="font-mono text-label-sm uppercase">Rating Rata-rata Toko</span>
          <span className="font-headline-md text-headline-md">
            {ratings.length > 0 ? `${overallAverage.toFixed(1)} ⭐` : 'Belum ada rating'}
          </span>
        </div>
        <div className="border-3 border-outline shadow-md bg-surface-container-lowest p-6 flex flex-col gap-2">
          <span className="font-mono text-label-sm uppercase text-on-surface-variant">Total Ulasan</span>
          <span className="font-headline-md text-headline-md">{ratings.length}</span>
        </div>
      </div>

      {menuItems.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          <button
            onClick={() => setFilterMenuId('semua')}
            className={`squishy whitespace-nowrap border-2 border-outline px-5 py-2 font-mono text-label-bold uppercase ${
              filterMenuId === 'semua' ? 'bg-secondary-container shadow-none' : 'bg-surface-container-lowest shadow-sm'
            }`}
          >
            Semua Menu
          </button>
          {menuItems.map((m) => (
            <button
              key={m.id}
              onClick={() => setFilterMenuId(m.id)}
              className={`squishy whitespace-nowrap border-2 border-outline px-5 py-2 font-mono text-label-bold uppercase ${
                filterMenuId === m.id ? 'bg-secondary-container shadow-none' : 'bg-surface-container-lowest shadow-sm'
              }`}
            >
              {m.name} {perMenuStats[m.id]?.count > 0 && `(${perMenuStats[m.id].average.toFixed(1)}⭐)`}
            </button>
          ))}
        </div>
      )}

      {filteredRatings.length === 0 ? (
        <div className="border-3 border-outline shadow-md p-10 flex flex-col items-center gap-4 text-center bg-surface-container-lowest">
          <span className="text-5xl" aria-hidden>
            ⭐
          </span>
          <p className="font-mono text-label-bold uppercase text-on-surface-variant">Belum ada ulasan di sini.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredRatings.map((rating) => {
            const item = menuById[rating.menuItemId];
            return (
              <div key={rating.id} className="border-3 border-outline shadow-md bg-surface-container-lowest p-6 flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-label-bold uppercase">{item?.name ?? 'Menu tidak ditemukan'}</span>
                  <span className="font-mono text-label-sm uppercase text-on-surface-variant">
                    {formatDate(rating.createdAt)}
                  </span>
                </div>
                <StarsDisplay stars={rating.stars} />
                {rating.comment && <p className="font-body-md text-body-md">{rating.comment}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
