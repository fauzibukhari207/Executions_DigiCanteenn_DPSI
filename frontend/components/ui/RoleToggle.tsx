'use client';

import clsx from '@/lib/clsx';
import type { UserRole } from '@/lib/types';

interface RoleToggleProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
}

const OPTIONS: { id: UserRole; label: string; icon: string }[] = [
  { id: 'siswa', label: 'Siswa', icon: '🎓' },
  { id: 'penjual', label: 'Penjual', icon: '🏪' },
];

/**
 * Kontrol pilihan peran (siswa/penjual) dipakai di halaman
 * Login & Register. Opsi aktif memakai efek "tertekan" seperti
 * kategori di SideNav (DS v3.0 Bagian 6.3), konsisten secara visual.
 */
export default function RoleToggle({ value, onChange }: RoleToggleProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {OPTIONS.map((opt) => {
        const isActive = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={clsx(
              'flex items-center justify-center gap-2 px-4 py-3 border-2 border-outline',
              'font-mono text-label-bold uppercase transition-all duration-100',
              isActive
                ? 'bg-primary-container text-on-primary translate-x-1 translate-y-1 shadow-none'
                : 'bg-surface-container-lowest shadow-sm'
            )}
          >
            <span aria-hidden>{opt.icon}</span>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
