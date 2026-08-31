import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton, useUser, SignInButton } from '@clerk/clerk-react';
import { Terminal, LayoutDashboard, FileText, Target, Award, ListChecks } from 'lucide-react';

export function Navbar() {
  const location = useLocation();
  const { isSignedIn, user } = useUser();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Interviews', path: '/interview/setup', icon: Target },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Resumes', path: '/resumes', icon: ListChecks },
    { name: 'Practice', path: '/recommendations', icon: Award },
  ];

  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 text-slate-100 font-semibold tracking-tight text-sm">
            <div className="p-1.5 rounded-md bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Terminal size={16} />
            </div>
            <span>MockMate <span className="text-indigo-400 code-font text-xs">AI</span></span>
          </Link>

          {isSignedIn && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-slate-800 text-indigo-300 border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs text-slate-400">
                {user?.primaryEmailAddress?.emailAddress}
              </span>
              <UserButton afterSignOutUrl="/" />
            </div>
          ) : (
            <SignInButton mode="modal">
              <button className="px-3 py-1.5 text-xs font-medium rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
  );
}
