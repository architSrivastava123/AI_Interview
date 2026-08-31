import React from 'react';

export function Footer() {
  return (
    <footer className="border-t border-surface-border bg-surface/50 py-6 text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© {new Date().getFullYear()} MockMate AI. Built for technical candidate preparation.</p>
        <p className="code-font text-slate-600">React · Express · MongoDB · LangGraph · LangChain · RAG · Gemini</p>
      </div>
    </footer>
  );
}
