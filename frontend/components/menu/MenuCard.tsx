import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import type { MenuItem, MenuBadge } from '@/lib/types';

const BADGE_LABEL: Record<MenuBadge, string> = {
  'best-seller': 'Best Seller',
  'kids-favorite': 'Kids Favorite',
  'healthy-choice': 'Healthy Choice',
  spicy: 'Spicy',
  'quick-grab': 'Quick Grab',
  vegetarian: 'Vegetarian',
  halal: 'Halal',
};

const BADGE_TONE: Record<MenuBadge, 'tertiary' | 'secondary' | 'primary' | 'neutral'> = {
  'best-seller': 'tertiary',
  'kids-favorite': 'secondary',
  'healthy-choice': 'primary',
  spicy: 'tertiary',
  'quick-grab': 'neutral',
  vegetarian: 'primary',
  halal: 'neutral',
};

function formatRupiah(amount: number) {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

/**
 * DS v3.0 Bagian 6.4 — kartu menu (floating-card). Tombol "+" di sini
 * masih dekoratif (belum menambah ke keranjang beneran) — fungsi
 * keranjang baru aktif di Batch 4.
 */
export default function MenuCard({ item }: { item: MenuItem }) {
  // Prioritaskan badge yang paling "menjual" untuk ditampilkan di gambar.
  const displayBadge =
    item.badges.find((b) => b === 'best-seller') ??
    item.badges.find((b) => b !== 'halal') ??
    item.badges[0];

  return (
    <Link href={`/menu/${item.id}`} className="block h-full">
      <Card className="flex flex-col h-full">
        <div className="relative h-40 border-b-2 border-outline overflow-hidden bg-surface-container">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          {displayBadge && (
            <Badge tone={BADGE_TONE[displayBadge]} className="absolute top-2 left-2">
              {BADGE_LABEL[displayBadge]}
            </Badge>
          )}
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-on-background/70 flex items-center justify-center">
              <Badge tone="error">Habis</Badge>
            </div>
          )}
        </div>
        <div className="p-4 flex flex-col gap-3 flex-1">
          <h3 className="font-headline-md text-lg font-extrabold uppercase leading-tight">{item.name}</h3>
          <p className="font-body-md text-sm text-on-surface-variant line-clamp-2">{item.description}</p>
          <div className="mt-auto flex items-center justify-between gap-2">
            <span className="font-mono font-bold text-primary bg-surface-container-lowest border-2 border-outline px-2 py-1 whitespace-nowrap">
              {formatRupiah(item.discountPrice ?? item.price)}
            </span>
            <span
              aria-hidden
              className="squishy w-9 h-9 shrink-0 bg-primary-container text-on-primary border-2 border-outline flex items-center justify-center font-black text-lg"
            >
              +
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
