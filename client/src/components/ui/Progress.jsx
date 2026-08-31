import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Progress({ value = 0, max = 100, variant = 'primary', className = '' }) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const variants = {
    primary: 'bg-indigo-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
  };

  return (
    <div className={twMerge(clsx('w-full bg-slate-800 rounded-full h-2 overflow-hidden', className))}>
      <div
        className={clsx('h-full transition-all duration-300', variants[variant])}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
