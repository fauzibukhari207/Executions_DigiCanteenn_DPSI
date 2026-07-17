'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import clsx from '@/lib/clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

/**
 * Input teks sesuai DS v3.0: kotak (radius 0), border tebal, shadow
 * hilang lalu muncul saat fokus (efek "masuk ke slot").
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className, ...props }, ref) => {
    const inputId = id ?? `input-${label.replace(/\s+/g, '-').toLowerCase()}`;
    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={inputId} className="font-mono text-label-bold uppercase tracking-wide">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'border-2 border-outline bg-surface-container-lowest px-4 py-3',
            'font-body-md text-body-md outline-none transition-shadow duration-100',
            'focus:shadow-sm',
            error && 'border-error',
            className
          )}
          {...props}
        />
        {error && <span className="font-mono text-label-sm text-error uppercase">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export default Input;
