import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth, SignInButton } from '@clerk/clerk-react';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import {
  Terminal,
  Target,
  FileText,
  Activity,
  Cpu,
  Layers,
  Award,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export default function LandingPage() {
  const { isSignedIn } = useAuth();

  const features = [
    {
      icon: Cpu,
      title: 'Resume & Technical RAG',
      desc: 'Retrieves your real projects and technical knowledge base chunks to craft tailored, grounded interview questions.',
    },
    {
      icon: Layers,
      title: 'Stateful LangGraph Workflow',
      desc: 'Orchestrates multi-turn adaptive interviews that adjust difficulty deterministically based on your performance.',
    },
    {
      icon: Activity,
      title: 'Speech & Pacing Analytics',
      desc: 'Tracks words per minute (WPM), filler word count, and speech fluency directly in the browser via Web Speech API.',
    },
    {
      icon: Award,
      title: 'Actionable Skill Gap Plans',
      desc: 'Benchmarks dimension scores against role standards and generates prioritized next steps with documentation links.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800/60 text-xs text-indigo-300 code-font">
          <Terminal size={13} />
          <span>Production GenAI Architecture</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-100 leading-tight">
          Adaptive Technical Mock Interviews Driven by RAG & LangGraph
        </h1>

        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Prepare for software engineering interviews with personalized questions grounded in your resume and technical domain knowledge, evaluated with deterministic scoring metrics.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          {isSignedIn ? (
            <Link to="/dashboard">
              <Button variant="primary" size="lg" className="gap-2">
                <span>Go to Dashboard</span>
                <ArrowRight size={16} />
              </Button>
            </Link>
          ) : (
            <SignInButton mode="modal">
              <Button variant="primary" size="lg" className="gap-2">
                <span>Get Started with Clerk</span>
                <ArrowRight size={16} />
              </Button>
            </SignInButton>
          )}

          <Link to="/interview/setup">
            <Button variant="outline" size="lg">
              Configure Interview
            </Button>
          </Link>
        </div>
      </div>

      {/* Tech Architecture Stack Banner */}
      <div className="mt-16 p-4 rounded-lg bg-surface border border-surface-border text-center">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-3">
          End-to-End Verified Engineering Stack
        </span>
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300 code-font">
          <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-indigo-400" /> React + Vite</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-indigo-400" /> Node + Express</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-indigo-400" /> MongoDB + Mongoose</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-indigo-400" /> Clerk Auth</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-indigo-400" /> LangGraph</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-indigo-400" /> LangChain + RAG</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-indigo-400" /> Google Gemini</span>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <Card key={idx} className="bg-slate-900/60 border-slate-800">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded bg-indigo-950/60 border border-indigo-800/60 text-indigo-400 mt-1 flex-shrink-0">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-100 mb-1">{feat.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
