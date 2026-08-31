import React from 'react';

export function LoadingSpinner({ text = 'Loading...', size = 'md' }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
      <svg className={`animate-spin ${sizes[size]} text-indigo-500 mb-2`} fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      {text && <p className="text-xs">{text}</p>}
    </div>
  );
}
