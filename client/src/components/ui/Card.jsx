import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-surface border border-surface-border rounded-lg p-5 shadow-sm text-slate-100',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={twMerge('mb-4 flex items-center justify-between', className)}>{children}</div>;
}

export function CardTitle({ children, className = '' }) {
  return <h3 className={twMerge('text-base font-semibold text-slate-100', className)}>{children}</h3>;
}

export function CardDescription({ children, className = '' }) {
  return <p className={twMerge('text-xs text-slate-400 mt-0.5', className)}>{children}</p>;
}
