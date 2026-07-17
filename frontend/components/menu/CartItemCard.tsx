'use client';

import QuantityStepper from '@/components/ui/QuantityStepper';
import type { MenuItem, CartItemOption } from '@/lib/types';

interface CartItemCardProps {
  item: MenuItem;
  quantity: number;
  selectedOptions: CartItemOption[];
  onQuantityChange: (next: number) => void;
  onRemove: () => void;
}

function formatRupiah(amount: number) {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

export default function CartItemCard({
  item,
  quantity,
  selectedOptions,
  onQuantityChange,
  onRemove,
}: CartItemCardProps) {
  const unitPrice = (item.discountPrice ?? item.price) + selectedOptions.reduce((s, o) => s + o.extraPrice, 0);
  const lineTotal = unitPrice * quantity;

  return (
    <div className="bg-surface-container-lowest border-3 border-outline shadow-md p-4 flex flex-col md:flex-row gap-4">
      <div className="w-full md:w-32 h-32 border-2 border-outline shrink-0 overflow-hidden bg-surface-container">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 flex flex-col justify-between gap-3">
        <div>
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-headline-md text-lg font-extrabold uppercase">{item.name}</h3>
            <span className="font-mono font-bold text-primary whitespace-nowrap">{formatRupiah(lineTotal)}</span>
          </div>
          {selectedOptions.length > 0 && (
            <p className="font-mono text-label-sm uppercase text-on-surface-variant mt-1">
              {selectedOptions.map((o) => o.label).join(', ')}
            </p>
          )}
        </div>
        <div className="flex justify-between items-end flex-wrap gap-3">
          <QuantityStepper value={quantity} onChange={onQuantityChange} size="compact" />
          <button
            type="button"
            onClick={onRemove}
            className="squishy flex items-center gap-2 px-3 py-2 border-2 border-outline font-mono text-label-sm uppercase hover:bg-tertiary-container hover:text-on-tertiary transition-colors"
          >
            🗑 Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
