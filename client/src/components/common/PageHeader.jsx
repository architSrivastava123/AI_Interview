import React from 'react';

export function PageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border mb-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-100">{title}</h1>
        {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
