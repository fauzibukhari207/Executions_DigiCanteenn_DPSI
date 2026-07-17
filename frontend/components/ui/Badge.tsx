import { HTMLAttributes } from 'react';
import clsx from '@/lib/clsx';

type BadgeTone = 'tertiary' | 'secondary' | 'primary' | 'error' | 'neutral';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  // Best Seller
  tertiary: 'bg-tertiary text-on-tertiary',
  // Kids Favorite
  secondary: 'bg-secondary-container text-on-secondary-container',
  // Healthy Choice
  primary: 'bg-primary text-on-primary',
  // Habis / peringatan
  error: 'bg-error text-on-error',
  neutral: 'bg-surface-container text-on-surface',
};

export default function Badge({ tone = 'neutral', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center border-2 border-outline px-3 py-1',
        'font-mono text-label-sm uppercase tracking-wide font-bold',
        toneClasses[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
