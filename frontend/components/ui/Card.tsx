import { HTMLAttributes } from 'react';
import clsx from '@/lib/clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  lift?: boolean;
}

/**
 * Kartu dasar (DS v3.0 Bagian 6.4 "floating-card"): border tebal + hard
 * shadow. Jika `lift` true, kartu terangkat saat hover (dipakai untuk
 * menu card yang bisa diklik). Untuk kartu statis (mis. Order Summary),
 * set lift={false}.
 */
export default function Card({ lift = true, className, children, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-surface-container-lowest border-3 shadow-lg',
        lift && 'liftable hover:shadow-xl cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
