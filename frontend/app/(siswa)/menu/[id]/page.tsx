'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import QuantityStepper from '@/components/ui/QuantityStepper';
import Checkbox from '@/components/ui/Checkbox';
import { getMenuItemById } from '@/lib/data/menu';
import { useCart } from '@/lib/cart/CartContext';
import { getAverageRatingForMenuItem } from '@/lib/data/ratings';
import type { CartItemOption, MenuItem } from '@/lib/types';

function formatRupiah(amount: number) {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

export default function MenuDetailPage({ params }: { params: { id: string } }) {
  const { addItem } = useCart();

  const [item, setItem] = useState<MenuItem | null | undefined>(undefined); // undefined = masih dicek
  const [rating, setRating] = useState({ average: 0, count: 0 });
  const [quantity, setQuantity] = useState(1);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMenuItemById(params.id).then((found) => {
      if (cancelled) return;
      setItem(found ?? null);
      if (found) {
        getAverageRatingForMenuItem(found.id).then((r) => {
          if (!cancelled) setRating(r);
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (item === null) {
    notFound();
  }

  if (item === undefined) {
    return (
      <div className="max-w-container-max mx-auto px-gutter py-margin text-center">
        <p className="font-mono text-label-bold uppercase text-on-surface-variant animate-pulse">Memuat menu...</p>
      </div>
    );
  }

  const selectedOptions: CartItemOption[] = (item.customOptions ?? []).filter((o) =>
    selectedOptionIds.includes(o.id)
  );

  const basePrice = item.discountPrice ?? item.price;
  const optionsPrice = selectedOptions.reduce((sum, o) => sum + o.extraPrice, 0);
  const unitPrice = basePrice + optionsPrice;
  const totalPrice = unitPrice * quantity;

  const toggleOption = (optionId: string) => {
    setSelectedOptionIds((prev) =>
      prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
    );
  };

  const handleAddToOrder = () => {
    addItem(item.id, quantity, selectedOptions);
    setJustAdded(true);
  };

  return (
    <div className="max-w-container-max mx-auto md:px-gutter grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:mt-8 pb-32 lg:pb-12">
      {/* Gambar */}
      <section className="lg:col-span-7 relative w-full border-4 lg:border-5 border-outline shadow-lg bg-on-background overflow-hidden h-[300px] lg:h-[500px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        <div className="absolute top-4 right-4">
          <div className="bg-secondary-container border-2 border-outline shadow-sm px-4 py-2 flex items-center gap-2">
            <span aria-hidden>⭐</span>
            <span className="font-mono text-label-bold uppercase">
              {rating.count > 0 ? `${rating.average.toFixed(1)} (${rating.count})` : 'Belum Ada Rating'}
            </span>
          </div>
        </div>
      </section>

      {/* Info & Interaksi */}
      <section className="lg:col-span-5 px-gutter lg:px-0 flex flex-col gap-6 pt-6 lg:pt-0">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile lg:text-[48px] uppercase italic bg-secondary-container border-2 border-outline px-4 py-2 inline-block leading-tight">
              {item.name}
            </h1>
            <span className="font-mono font-black text-[28px] text-primary bg-surface-container-lowest border-2 border-outline px-4 py-2 shadow-sm">
              {formatRupiah(basePrice)}
            </span>
          </div>
          <p className="font-body-md text-body-md border-l-4 border-primary pl-4 py-2 mt-2 text-on-surface-variant">
            {item.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {item.badges.map((b) => (
              <Badge key={b} tone={b === 'best-seller' || b === 'spicy' ? 'tertiary' : 'neutral'}>
                {b}
              </Badge>
            ))}
          </div>
        </div>

        {/* Statistik gizi */}
        <div className="grid grid-cols-3 gap-4">
          <div className="border-2 border-outline bg-surface-container-lowest p-4 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="font-headline-md text-headline-md text-primary">{item.calories}</span>
            <span className="font-mono text-label-sm uppercase text-on-surface-variant">Kalori</span>
          </div>
          <div className="border-2 border-outline bg-surface-container-lowest p-4 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="font-headline-md text-headline-md text-secondary">{item.protein ?? '-'}g</span>
            <span className="font-mono text-label-sm uppercase text-on-surface-variant">Protein</span>
          </div>
          <div className="border-2 border-outline bg-surface-container-lowest p-4 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="font-headline-md text-headline-md text-tertiary">{item.fat ?? '-'}g</span>
            <span className="font-mono text-label-sm uppercase text-on-surface-variant">Lemak</span>
          </div>
        </div>

        {/* Bahan */}
        <div className="border-4 border-outline bg-surface-container-highest p-6">
          <h3 className="font-mono text-label-bold uppercase mb-4 border-b-2 border-outline pb-2 inline-block">
            Bahan Utama
          </h3>
          <div className="flex flex-wrap gap-3">
            {item.ingredients.map((ing) => (
              <span
                key={ing}
                className="border-2 border-outline bg-surface-container-lowest px-4 py-2 font-mono text-label-sm uppercase"
              >
                {ing}
              </span>
            ))}
          </div>
        </div>

        {/* Custom options */}
        {item.customOptions && item.customOptions.length > 0 && (
          <div className="border-4 border-outline bg-surface-container-lowest p-6 shadow-lg">
            <h3 className="font-mono text-label-bold uppercase mb-4 border-b-2 border-outline pb-2 inline-block">
              Kustomisasi
            </h3>
            <div className="flex flex-col gap-3">
              {item.customOptions.map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center justify-between p-4 border-2 border-outline bg-surface-container-low cursor-pointer hover:bg-secondary-container transition-colors"
                >
                  <Checkbox
                    label={opt.label}
                    checked={selectedOptionIds.includes(opt.id)}
                    onChange={() => toggleOption(opt.id)}
                  />
                  <span className="font-mono text-label-bold text-secondary">
                    {opt.extraPrice > 0 ? `+${formatRupiah(opt.extraPrice)}` : 'Gratis'}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Aksi */}
        <div className="fixed bottom-20 lg:bottom-0 left-0 w-full bg-surface-container-lowest border-t-4 border-outline p-6 z-40 lg:relative lg:bg-transparent lg:border-none lg:p-0 lg:mt-4">
          <div className="flex flex-col sm:flex-row items-stretch gap-4 max-w-container-max mx-auto">
            <QuantityStepper value={quantity} onChange={setQuantity} />
            <Button variant="primary" fullWidth onClick={handleAddToOrder} className="!py-4">
              {justAdded ? 'Ditambahkan ✓' : `Tambah — ${formatRupiah(totalPrice)}`}
            </Button>
          </div>
          {justAdded && (
            <div className="max-w-container-max mx-auto mt-3 flex flex-wrap gap-3">
              <Link href="/keranjang">
                <Button variant="outline">Lihat Keranjang</Button>
              </Link>
              <Link href="/menu">
                <Button variant="outline">Tambah Menu Lain</Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
