"use client";

import React from "react";
import { Bot, UserCheck, Settings, Play, Send, ChartBar, Repeat, Sparkles, ArrowRight } from "lucide-react";

const HowItWorksPage = () => {
  const steps = [
    {
      icon: <UserCheck size={28} className="text-indigo-400" />,
      title: "Authentication Setup",
      description: "Securely sign in using Clerk. Create a personalized dev-profile to log stats, ratings, and track question iterations."
    },
    {
      icon: <Settings size={28} className="text-purple-400" />,
      title: "Configure Custom Parameters",
      description: "Pick your specific track (Frontend, Backend, DevOps, PM) and enter your experience and target role. Auto-suggest will pull optimized tech stacks."
    },
    {
      icon: <Play size={28} className="text-pink-400" />,
      title: "Launch Mock Interview",
      description: "Gemini AI instantly synthesizes 5 core technical questions custom-matched to your background profile, loaded one by one."
    },
    {
      icon: <Send size={28} className="text-indigo-400" />,
      title: "Provide Your Answers",
      description: "Use advanced speech-to-text to speak your answers naturally or type directly. Our WebRTC wave tracker shows audio signals in real-time."
    },
    {
      icon: <ChartBar size={28} className="text-emerald-400" />,
      title: "Instant AI Scoring",
      description: "Gemini grades each response technical depth and awards rating scores. It details exactly what references and tech specs you missed."
    },
    {
      icon: <Repeat size={28} className="text-cyan-400" />,
      title: "Track Progression",
      description: "Access a detailed stats card history log in your workspace dashboard. Run infinite variations to boost interview success rates."
    }
  ];

  return (
    <div className="min-h-screen bg-[#070a13] text-white relative pb-20 pt-8">
      {/* Decorative Orbs */}
      <div className="glow-orb animate-glow-slow bg-indigo-500/10 w-[400px] h-[400px] top-10 left-10" />
      <div className="glow-orb animate-glow-medium bg-purple-500/10 w-[500px] h-[500px] bottom-10 right-10" />
      
      {/* Cyber Grid Lines */}
      <div className="absolute inset-0 cyber-grid opacity-[0.12] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10 space-y-12">
        {/* Header Title */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={12} />
            System Blueprint
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            How <span className="text-gradient-indigo-purple">MockMate AI</span> Works
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
            Our orchestration pipeline leverages the power of generative LLMs to train developers and engineers for actual hiring assessments.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div 
              key={step.title} 
              className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all duration-300 transform hover:-translate-y-1 group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Step {index + 1}</span>
                  <h2 className="text-lg font-bold text-white tracking-wide mt-0.5">
                    {step.title}
                  </h2>
                </div>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="text-center pt-8">
          <a 
            href="/dashboard" 
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-500/20 hover:scale-[1.03] transition-all"
          >
            Start Your Interview Journey
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;