'use client';

import { ButtonHTMLAttributes } from 'react';
import clsx from '@/lib/clsx';

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

/**
 * DS v3.0 Bagian 6.9: filter chip / kategori horizontal. Chip aktif
 * memakai latar warna terang TAPI shadow tetap tampil (beda dengan
 * kategori sidebar yang memakai efek "tertekan" — lihat SideNav.tsx).
 */
export default function Chip({ active, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      className={clsx(
        'squishy whitespace-nowrap border-3 border-outline px-6 py-3 shadow-sm',
        'font-mono text-label-bold uppercase',
        active ? 'bg-secondary-container' : 'bg-surface-container-lowest',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
