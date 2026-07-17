'use client';

import clsx from '@/lib/clsx';

interface QuantityStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: 'default' | 'compact';
}

/**
 * DS v3.0 Bagian 6.6: kontrol kotak (bukan pill), border tebal,
 * minus - angka - plus. Ukuran "compact" dipakai di Cart Item Card,
 * "default" dipakai di halaman Detail Menu.
 */
export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'default',
}: QuantityStepperProps) {
  const btnSize = size === 'compact' ? 'w-10 h-10 text-lg' : 'w-14 h-14 text-2xl';
  const numWidth = size === 'compact' ? 'w-10' : 'w-14';

  return (
    <div className="inline-flex border-3 border-outline bg-surface-container-lowest">
      <button
        type="button"
        aria-label="Kurangi jumlah"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className={clsx(
          btnSize,
          'squishy border-r-3 border-outline font-mono font-black flex items-center justify-center disabled:opacity-40'
        )}
      >
        &minus;
      </button>
      <span
        className={clsx(
          numWidth,
          'flex items-center justify-center font-headline-md font-extrabold text-headline-md'
        )}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Tambah jumlah"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className={clsx(
          btnSize,
          'squishy border-l-3 border-outline font-mono font-black flex items-center justify-center disabled:opacity-40'
        )}
      >
        +
      </button>
    </div>
  );
}
