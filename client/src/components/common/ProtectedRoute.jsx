import React from 'react';
import { useAuth, SignInButton } from '@clerk/clerk-react';
import { LoadingSpinner } from './LoadingSpinner.jsx';
import { Button } from '../ui/Button.jsx';
import { Lock } from 'lucide-react';

export function ProtectedRoute({ children }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Checking authentication status..." />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 mb-4">
          <Lock size={20} />
        </div>
        <h2 className="text-lg font-semibold text-slate-100 mb-1">Authentication Required</h2>
        <p className="text-xs text-slate-400 max-w-sm mb-6">
          Please sign in with Clerk to access mock interviews, personalized practice plans, and reports.
        </p>
        <SignInButton mode="modal">
          <Button variant="primary" size="md">
            Sign In to Continue
          </Button>
        </SignInButton>
      </div>
    );
  }

  return children;
}
