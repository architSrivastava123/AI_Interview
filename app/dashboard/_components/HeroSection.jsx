'use client'

import React from 'react'
import Link from 'next/link'
import { Sparkles, Bot, ArrowRight, ShieldCheck, Cpu, Mic } from 'lucide-react'

export default function HeroSection() {
  return (
    <div className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Dynamic Glow Orbs */}
      <div className="glow-orb animate-glow-slow bg-indigo-500/10 w-[500px] h-[500px] top-1/10 left-1/10" />
      <div className="glow-orb animate-glow-medium bg-purple-500/10 w-[600px] h-[600px] bottom-1/10 right-1/10" />
      <div className="glow-orb animate-glow-slow bg-pink-500/5 w-[400px] h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      
      {/* Cyber Grid Lines Overlay */}
      <div className="absolute inset-0 cyber-grid opacity-[0.15] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10 flex flex-col lg:flex-row items-center gap-12 sm:gap-16">
        
        {/* Left Side: Copy and Actions */}
        <div className="flex-1 text-center lg:text-left space-y-6 max-w-2xl">
          {/* Accent Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-400 text-xs font-bold uppercase tracking-wider animate-pulse mx-auto lg:mx-0">
            <Sparkles size={14} />
            Next-Gen AI Interviewer
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1] sm:leading-tight">
            Master Your Interviews with <span className="text-gradient-indigo-purple">MockMate AI</span>
          </h1>

          <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
            Double your offer rates. Practice tailored job simulations, record your verbal answers, and receive instant, deep technical grading powered by Google Gemini AI.
          </p>

          {/* Quick Metrics list */}
          <div className="grid grid-cols-3 gap-4 pt-2 max-w-md mx-auto lg:mx-0 text-left">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
              <span className="block text-2xl font-black text-white">96%</span>
              <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Success Rate</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
              <span className="block text-2xl font-black text-white">Gemini</span>
              <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Engine Power</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
              <span className="block text-2xl font-black text-white">Instant</span>
              <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">AI Feedback</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3.5 text-base font-bold text-white shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:scale-[1.03] transition-all duration-300"
            >
              Start Free Session
              <ArrowRight size={18} />
            </Link>
            <a 
              href="/how-it-works" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3.5 text-base font-semibold text-gray-300 hover:text-white transition-all duration-300"
            >
              How It Works
            </a>
          </div>
        </div>

        {/* Right Side: Immersive AI Interface Mockup */}
        <div className="flex-1 w-full max-w-lg relative group">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-600 opacity-20 rounded-2xl blur-3xl -z-10 group-hover:opacity-25 transition-opacity" />
          
          <div className="glass-panel rounded-2xl p-5 shadow-2xl relative border border-white/10">
            {/* Header console controls */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              </div>
              <span className="text-xs text-gray-500 font-mono tracking-widest">SESSION_ACTIVE //</span>
            </div>

            {/* AI Console Screen */}
            <div className="space-y-4 font-sans">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-indigo-500/20 flex gap-3">
                <div className="p-2 h-9 w-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0">
                  <Bot size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Mock AI Interviewer</h4>
                  <p className="text-sm text-gray-300 mt-1 leading-relaxed">
                    "Explain the concept of closures in JavaScript. Why are they useful?"
                  </p>
                </div>
              </div>

              {/* Speech waves demo */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mic className="text-purple-400 animate-pulse" size={16} />
                    <span className="text-xs font-bold uppercase text-purple-400 tracking-wider">Candidate Speech</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">RECORDING...</span>
                </div>
                {/* Simulated equalizer bars */}
                <div className="flex items-end gap-1.5 h-6 px-2 justify-center">
                  <span className="w-1.5 h-3 bg-purple-500/40 rounded-full animate-pulse" />
                  <span className="w-1.5 h-5 bg-purple-500/60 rounded-full" />
                  <span className="w-1.5 h-2 bg-purple-500/30 rounded-full animate-pulse" />
                  <span className="w-1.5 h-6 bg-purple-500/80 rounded-full" />
                  <span className="w-1.5 h-4 bg-purple-500/70 rounded-full" />
                  <span className="w-1.5 h-1 bg-purple-500/20 rounded-full" />
                </div>
              </div>

              {/* Feedback demo card */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/20 animate-in fade-in slide-in-from-bottom-2 duration-1000">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Gemini Scoring Engine</span>
                    <h5 className="text-sm font-bold text-white mt-0.5">Evaluation Feedback</h5>
                  </div>
                  <div className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black">
                    SCORE: 8/10
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  "Your definition of closures is solid. To improve, mention garbage collection and references."
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}