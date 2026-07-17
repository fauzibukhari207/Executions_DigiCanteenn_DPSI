'use client';

import { useState, ReactNode } from 'react';
import clsx from '@/lib/clsx';

export interface SideNavItem {
  id: string;
  label: string;
  icon: string;
}

interface SideNavProps {
  items: SideNavItem[];
  defaultActiveId?: string;
  /** Jika diisi, komponen jadi "controlled" — state aktif dipegang parent. */
  activeId?: string;
  onSelect?: (id: string) => void;
  /** Konten tambahan di bawah daftar kategori, mis. filter diet. */
  children?: ReactNode;
}

/**
 * DS v3.0 Bagian 6.3: kategori sidebar desktop. Item aktif memakai
 * efek "tertekan" (translate + shadow dihilangkan), BUKAN sekadar
 * warna berbeda.
 *
 * Bisa dipakai uncontrolled (state internal, seperti di Batch 1 style
 * guide) atau controlled (kirim prop `activeId` + `onSelect`, dipakai
 * di halaman Daftar Menu supaya kategori & grid menu tetap sinkron).
 */
export default function SideNav({
  items,
  defaultActiveId,
  activeId: activeIdProp,
  onSelect,
  children,
}: SideNavProps) {
  const [internalActiveId, setInternalActiveId] = useState(defaultActiveId ?? items[0]?.id);
  const activeId = activeIdProp ?? internalActiveId;

  const handleSelect = (id: string) => {
    setInternalActiveId(id);
    onSelect?.(id);
  };

  return (
    <nav className="hidden lg:flex flex-col w-72 shrink-0 bg-surface-container-low border-r-4 border-outline py-margin px-4 gap-3">
      <div className="px-2 mb-4">
        <h2 className="font-headline-md text-headline-md font-black uppercase">Categories</h2>
        <div className="h-1 w-12 bg-primary mt-1" />
      </div>
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            onClick={() => handleSelect(item.id)}
            className={clsx(
              'flex items-center gap-3 px-4 py-3 border-2 border-outline font-mono text-label-bold uppercase text-left transition-all duration-100',
              isActive
                ? 'bg-primary-container text-on-primary translate-x-1 translate-y-1 shadow-none'
                : 'bg-surface-container-lowest shadow-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-md'
            )}
          >
            <span aria-hidden>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        );
      })}

      {children && <div className="mt-8 pt-6 border-t-2 border-outline px-2 flex flex-col gap-4">{children}</div>}
    </nav>
  );
}
