'use client';

import { useState } from 'react';
import clsx from '@/lib/clsx';

interface StarRatingInputProps {
  value: number;
  onChange: (stars: 1 | 2 | 3 | 4 | 5) => void;
  size?: 'default' | 'large';
}

/**
 * Input rating bintang 1-5 (DS v3.0 gaya kotak/border, bukan bulat
 * halus). Preview saat hover dibedakan (border kuning putus-putus)
 * dari bintang yang BENERAN sudah dipilih (latar kuning solid) --
 * supaya jelas mana yang baru dilihat vs yang sudah benar-benar
 * diklik, dan tombol "Kirim Rating" tidak terasa "nyangkut" padahal
 * pengguna kira sudah memilih bintang.
 */
export default function StarRatingInput({ value, onChange, size = 'default' }: StarRatingInputProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const starSize = size === 'large' ? 'text-4xl' : 'text-2xl';

  return (
    <div className="flex gap-2" onMouseLeave={() => setHovered(null)}>
      {[1, 2, 3, 4, 5].map((n) => {
        const isSelected = value >= n;
        const isPreview = !isSelected && hovered !== null && hovered >= n;
        return (
          <button
            key={n}
            type="button"
            aria-label={`${n} bintang`}
            aria-pressed={isSelected}
            onMouseEnter={() => setHovered(n)}
            onClick={() => onChange(n as 1 | 2 | 3 | 4 | 5)}
            className={clsx(
              'squishy w-12 h-12 flex items-center justify-center border-2 shadow-sm',
              starSize,
              isSelected
                ? 'bg-secondary-container border-outline'
                : isPreview
                  ? 'bg-surface-container-lowest border-dashed border-secondary'
                  : 'bg-surface-container-lowest border-outline'
            )}
          >
            <span className={isSelected || isPreview ? 'grayscale-0' : 'grayscale opacity-40'} aria-hidden>
              ⭐
            </span>
          </button>
        );
      })}
    </div>
  );
}
