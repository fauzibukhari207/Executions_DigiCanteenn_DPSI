'use client';

import { InputHTMLAttributes } from 'react';
import clsx from '@/lib/clsx';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

/**
 * DS v3.0 Bagian 6.10: checkbox kotak kustom, bukan bulat bawaan
 * browser. Style utamanya ada di .brutal-checkbox (app/globals.css).
 */
export default function Checkbox({ label, className, id, ...props }: CheckboxProps) {
  const inputId = id ?? `checkbox-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <label
      htmlFor={inputId}
      className={clsx(
        'inline-flex items-center gap-3 font-mono text-label-bold uppercase cursor-pointer select-none',
        className
      )}
    >
      <input id={inputId} type="checkbox" className="brutal-checkbox" {...props} />
      {label}
    </label>
  );
}
