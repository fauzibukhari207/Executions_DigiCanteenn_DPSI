'use client';

import { useEffect, useMemo, useState } from 'react';
import SideNav, { SideNavItem } from '@/components/layout/SideNav';
import Chip from '@/components/ui/Chip';
import Checkbox from '@/components/ui/Checkbox';
import MenuCard from '@/components/menu/MenuCard';
import { getAllMenuItems } from '@/lib/data/menu';
import type { MenuCategory, MenuItem } from '@/lib/types';

const CATEGORIES: SideNavItem[] = [
  { id: 'all', label: 'Semua Menu', icon: '🍽️' },
  { id: 'breakfast', label: 'Breakfast', icon: '🍳' },
  { id: 'lunch', label: 'Lunch', icon: '🍱' },
  { id: 'snacks', label: 'Snacks', icon: '🍪' },
  { id: 'drinks', label: 'Drinks', icon: '🥤' },
];

/**
 * Filter diet memakai logika AND: kalau lebih dari satu dicentang,
 * menu harus punya SEMUA badge yang dicentang (bukan salah satu).
 * Sesuaikan di sini kalau ternyata mau logika OR.
 *
 * Semua menu diambil SEKALI dari Supabase saat halaman dibuka, lalu
 * kategori/pencarian/filter diet difilter di browser (bukan query
 * ulang ke database tiap kali filter berubah) -- lebih responsif.
 */
export default function DaftarMenuPage() {
  const [allItems, setAllItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState<MenuCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [dietary, setDietary] = useState({
    healthy: false,
    kids: false,
    halal: false,
  });

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

  const filteredItems = useMemo(() => {
    let items = category === 'all' ? allItems : allItems.filter((i) => i.category === category);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter((i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    }
    if (dietary.healthy) items = items.filter((i) => i.badges.includes('healthy-choice'));
    if (dietary.kids) items = items.filter((i) => i.badges.includes('kids-favorite'));
    if (dietary.halal) items = items.filter((i) => i.badges.includes('halal'));

    return items;
  }, [allItems, category, search, dietary]);

  return (
    <div className="flex w-full max-w-container-max mx-auto">
      <SideNav items={CATEGORIES} activeId={category} onSelect={(id) => setCategory(id as MenuCategory | 'all')}>
        <div>
          <h3 className="font-mono text-label-bold uppercase mb-3">Fokus Diet</h3>
          <div className="flex flex-col gap-3">
            <Checkbox
              label="Healthy Choice"
              checked={dietary.healthy}
              onChange={(e) => setDietary((d) => ({ ...d, healthy: e.target.checked }))}
            />
            <Checkbox
              label="Kids Favorite"
              checked={dietary.kids}
              onChange={(e) => setDietary((d) => ({ ...d, kids: e.target.checked }))}
            />
            <Checkbox
              label="Halal Certified"
              checked={dietary.halal}
              onChange={(e) => setDietary((d) => ({ ...d, halal: e.target.checked }))}
            />
          </div>
        </div>
      </SideNav>

      <main className="flex-1 px-gutter py-margin min-w-0">
        {/* Search + kategori mobile */}
        <div className="lg:hidden mb-6 flex flex-col gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="CARI MENU..."
            className="w-full px-4 py-3 border-2 border-outline bg-surface-container-lowest font-mono text-label-bold uppercase outline-none focus:shadow-sm"
          />
          <div className="flex gap-3 overflow-x-auto pb-2">
            {CATEGORIES.map((c) => (
              <Chip key={c.id} active={category === c.id} onClick={() => setCategory(c.id as MenuCategory | 'all')}>
                {c.icon} {c.label}
              </Chip>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-4 mb-8">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="CARI MENU..."
            className="w-80 px-4 py-3 border-2 border-outline bg-surface-container-lowest font-mono text-label-bold uppercase outline-none focus:shadow-sm"
          />
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile uppercase leading-none">Daftar Menu</h1>
          <span className="font-mono text-label-sm uppercase text-on-surface-variant">
            {isLoading ? 'Memuat...' : `${filteredItems.length} menu ditemukan`}
          </span>
        </div>

        {isLoading ? (
          <p className="font-mono text-label-bold uppercase text-on-surface-variant animate-pulse">Memuat menu...</p>
        ) : filteredItems.length === 0 ? (
          <p className="font-mono text-label-bold uppercase text-on-surface-variant">
            Tidak ada menu yang cocok dengan filter ini.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
