import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from '@/lib/clsx';

type Variant = 'primary' | 'secondary' | 'outline' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

/**
 * Tombol dasar sesuai Design_System__DS_.md v3.0, Bagian 5.2 & 6.
 * Semua tombol WAJIB memakai efek "squishy" (tertekan saat diklik):
 * bergeser 3px + shadow hilang. Lihat .squishy di app/globals.css.
 */
const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary-container text-on-primary border-outline',
  secondary: 'bg-secondary-container text-on-surface border-outline',
  outline: 'bg-surface-container-lowest text-on-surface border-outline',
  danger: 'bg-error text-on-error border-outline',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', fullWidth, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'squishy inline-flex items-center justify-center gap-2',
          'font-mono text-label-bold uppercase tracking-wide',
          'border-3 shadow-md px-6 py-3',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-md',
          variantClasses[variant],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export default Button;
