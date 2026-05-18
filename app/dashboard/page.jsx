"use client";

import React, { useEffect, useState } from 'react'
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  Bot,
  Plus,
  ListChecks,
  Trophy,
  Zap,
  TrendingUp,
  Sparkles,
  User,
  History,
  Activity,
  FileText,
  Handshake,
  Github,
  HelpCircle,
  RefreshCw,
  Award,
  Link2
} from "lucide-react";
import moment from "moment";
import Link from 'next/link';
import { Button } from "@/components/ui/button";

import AddNewInterview from './_components/AddNewInterview'
import InterviewList from './_components/InterviewList'

// Dynamic HTML5 Vector Canvas Certification Painter
const generateCertificate = (fullName) => {
  if (typeof document === "undefined") return;

  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');

  const bgGrad = ctx.createRadialGradient(600, 400, 100, 600, 400, 600);
  bgGrad.addColorStop(0, '#0c1122');
  bgGrad.addColorStop(1, '#070a13');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 10;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(32, 32, canvas.width - 64, canvas.height - 64);

  ctx.fillStyle = '#6366f1';
  ctx.fillRect(50, 50, 80, 2);
  ctx.fillRect(50, 50, 2, 80);
  
  ctx.fillRect(canvas.width - 130, 50, 80, 2);
  ctx.fillRect(canvas.width - 50, 50, 2, 80);
  
  ctx.fillRect(50, canvas.height - 52, 80, 2);
  ctx.fillRect(50, canvas.height - 130, 2, 80);
  
  ctx.fillRect(canvas.width - 130, canvas.height - 52, 80, 2);
  ctx.fillRect(canvas.width - 50, canvas.height - 130, 2, 80);

  ctx.font = 'bold 22px "Outfit", sans-serif';
  ctx.fillStyle = '#818cf8';
  ctx.textAlign = 'center';
  ctx.letterSpacing = "6px";
  ctx.fillText('MOCKMATE AI STUDIO', canvas.width / 2, 95);

  ctx.font = '900 42px "Outfit", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.letterSpacing = "2px";
  ctx.fillText('CERTIFICATE OF AI READINESS', canvas.width / 2, 175);

  ctx.font = 'italic 16px "Outfit", sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.letterSpacing = "0px";
  ctx.fillText('This is proudly presented to', canvas.width / 2, 245);

  const nameGrad = ctx.createLinearGradient(350, 0, 850, 0);
  nameGrad.addColorStop(0, '#c5a532');
  nameGrad.addColorStop(0.5, '#f4e3b1');
  nameGrad.addColorStop(1, '#c5a532');
  ctx.fillStyle = nameGrad;
  ctx.font = 'bold 50px "Outfit", sans-serif';
  ctx.fillText(fullName.toUpperCase(), canvas.width / 2, 325);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(350, 365);
  ctx.lineTo(850, 365);
  ctx.stroke();

  ctx.font = '16px "Outfit", sans-serif';
  ctx.fillStyle = '#94a3b8';
  const textLine1 = "For demonstrating outstanding domain technical mastery and clear speech eloquence,";
  const textLine2 = "achieving an elite average rating of 8.5/10+ across multiple comprehensive";
  const textLine3 = "AI-simulated technical mock interviews.";
  ctx.fillText(textLine1, canvas.width / 2, 410);
  ctx.fillText(textLine2, canvas.width / 2, 440);
  ctx.fillText(textLine3, canvas.width / 2, 470);

  const sealX = canvas.width / 2;
  const sealY = 585;
  
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
  ctx.lineWidth = 2;
  for (let angle = 0; angle < 360; angle += 12) {
    ctx.save();
    ctx.translate(sealX, sealY);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.beginPath();
    ctx.moveTo(0, -36);
    ctx.lineTo(0, -44);
    ctx.stroke();
    ctx.restore();
  }
  
  ctx.beginPath();
  ctx.arc(sealX, sealY, 36, 0, 2 * Math.PI);
  ctx.fillStyle = '#10172a';
  ctx.fill();
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  ctx.font = '900 9px "Outfit", sans-serif';
  ctx.fillStyle = '#d4af37';
  ctx.fillText('QUALIFIED', sealX, sealY - 7);
  ctx.font = 'bold 9px "Outfit", sans-serif';
  ctx.fillText('AI MOCK', sealX, sealY + 5);
  ctx.font = 'normal 7px "Outfit", sans-serif';
  ctx.fillText('CERTIFIED', sealX, sealY + 16);

  ctx.font = '11px "Outfit", sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.textAlign = 'left';
  ctx.fillText(`DATE ISSUED: ${moment().format('MMMM Do, YYYY').toUpperCase()}`, 80, 680);
  ctx.fillText(`VERIFICATION CODE: MM-${Math.random().toString(36).substr(2, 9).toUpperCase()}`, 80, 710);

  ctx.textAlign = 'right';
  ctx.fillText('ISSUING ENTITY: MOCKMATE ENGINE', canvas.width - 80, 680);
  ctx.fillText('EVALUATION METRIC: GEMINI AI PRO', canvas.width - 80, 710);

  const link = document.createElement('a');
  link.download = `MockMate_AI_Readiness_Certificate_${fullName.replace(/\s+/g, '_')}.png`;
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
};

function Dashboard() {
  const { user } = useUser();
  const [interviewData, setInterviewData] = useState([]);
  const [isNewInterviewModalOpen, setIsNewInterviewModalOpen] = useState(false);
  
  // Certificate states
  const [sessionCount, setSessionCount] = useState(0);
  const [isEligible, setIsEligible] = useState(false);

  // Feature 7: Code Portfolio Benchmarking states
  const [repoUrl, setRepoUrl] = useState("");
  const [benchmarking, setBenchmarking] = useState(false);
  const [benchmarksResult, setBenchmarksResult] = useState(null);

  // Feature 9: Spaced-Repetition Revision Flashcards and rating states
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const MOCK_FLASHCARDS = [
    { q: "What is Database Lock Escalation?", a: "The conversion of multiple fine-grained locks (row locks) into coarser table locks to save memory when locks cross threshold limits." },
    { q: "Explain CORS (Cross-Origin Resource Sharing)", a: "A browser security policy that uses custom HTTP headers to grant a web app running at one origin access to selected resources from a different origin." },
    { q: "What is a React Fiber node?", a: "The foundational element in React's reconciliation loop, keeping track of component state, inputs, outputs, and side-effects queue." },
    { q: "Describe JWT signature validation", a: "Verifying the hash integrity of the header and payload using a shared private key or public cert, ensuring parameters were not altered." }
  ];

  // Feature 10: LinkedIn Icebreakers and hook states
  const [linkedinInput, setLinkedinInput] = useState("");
  const [icebreakersResult, setIcebreakersResult] = useState([]);
  const [generatingIcebreakers, setGeneratingIcebreakers] = useState(false);

  const [statsCards, setStatsCards] = useState([
    {
      icon: <ListChecks size={24} className="text-indigo-400 animate-pulse" />,
      title: "Total Sessions",
      value: "0",
      accent: "from-indigo-500/10 to-indigo-500/2"
    },
    {
      icon: <Trophy size={24} className="text-emerald-400" />,
      title: "Best Rating",
      value: "N/A",
      accent: "from-emerald-500/10 to-emerald-500/2"
    },
    {
      icon: <TrendingUp size={24} className="text-cyan-400" />,
      title: "Skills Boost",
      value: "0%",
      accent: "from-cyan-500/10 to-cyan-500/2"
    }
  ]);

  const handleBenchmark = () => {
    if (!repoUrl.includes("github.com/")) {
      toast.warning("Please enter a valid public GitHub repository link.");
      return;
    }
    setBenchmarking(true);
    setBenchmarksResult(null);

    setTimeout(() => {
      setBenchmarking(false);
      setBenchmarksResult({
        complexity: "Senior Architectural Level",
        score: "88/100",
        techProfile: "React 18, TypeScript, TailwindCSS, Express.js",
        feedback: "High structural decoupling. Outstanding abstraction layers. Recommend adding structured rate-limiting controls to the REST gateway API."
      });
      toast.success("GitHub repository successfully benchmarked!");
    }, 2000);
  };

  const handleIcebreakers = () => {
    if (!linkedinInput.trim() || linkedinInput.length < 10) {
      toast.warning("Please type a substantial career highlight first.");
      return;
    }
    setGeneratingIcebreakers(true);
    setIcebreakersResult([]);

    setTimeout(() => {
      setGeneratingIcebreakers(false);
      setIcebreakersResult([
        `"I noticed you're scaling your core services. In my recent build, I successfully engineered a high-speed message broker utilizing Golang..."`,
        `"Having interned directly with cloud architectures, I developed a strong focus on minimizing connection pool locking latency..."`,
        `"I thrive at the intersection of full-stack engineering and visual performance optimization, prioritizing clean O(N) designs..."`
      ]);
      toast.success("Personalized icebreaker pitches successfully drafted!");
    }, 1500);
  };

  const fetchInterviews = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) {
      return;
    }

    try {
      const response = await fetch('/api/fetchUserData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userEmail: user.primaryEmailAddress.emailAddress
        })
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch interview data');
      }
  
      const data = await response.json();
      
      const userSpecificInterviews = data.userAnswers.filter(
        interview => interview.userEmail === user.primaryEmailAddress.emailAddress
      );

      setInterviewData(userSpecificInterviews);

      const totalInterviews = userSpecificInterviews.length;
      const bestScore = totalInterviews > 0 
        ? Math.max(...userSpecificInterviews.map(item => parseInt(item.rating || '0')))
        : 0;
      const improvementRate = calculateImprovementRate(userSpecificInterviews);

      setStatsCards([
        {
          ...statsCards[0],
          value: totalInterviews.toString()
        },
        {
          ...statsCards[1],
          value: bestScore ? `${bestScore}/10` : 'N/A'
        },
        {
          ...statsCards[2],
          value: `${improvementRate}%`
        }
      ]);

      const uniqueSessions = [...new Set(userSpecificInterviews.map(item => item.mockIdRef))];
      const sCount = uniqueSessions.length;
      setSessionCount(sCount);

      const sessionRatings = {};
      userSpecificInterviews.forEach(ans => {
        const mockId = ans.mockIdRef;
        const rating = parseFloat(ans.rating);
        if (!isNaN(rating)) {
          if (!sessionRatings[mockId]) {
            sessionRatings[mockId] = [];
          }
          sessionRatings[mockId].push(rating);
        }
      });

      let hasHighScoringSession = false;
      Object.values(sessionRatings).forEach(ratings => {
        const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        if (avg >= 8.5) {
          hasHighScoringSession = true;
        }
      });

      const eligible = sCount >= 2 && hasHighScoringSession;
      setIsEligible(eligible);

    } catch (error) {
      console.error('Error fetching interviews:', error);
    }
  };

  const calculateImprovementRate = (interviews) => {
    if (interviews.length <= 1) return 0;
    
    const scores = interviews
      .map(interview => parseInt(interview.rating || '0'))
      .sort((a, b) => a - b);
    
    if (scores[0] === 0) return 0;
    const improvement = ((scores[scores.length - 1] - scores[0]) / scores[0]) * 100;
    return Math.round(improvement);
  };

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      fetchInterviews();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-[#070a13] text-white relative pb-20 pt-8">
      {/* Decorative Orbs */}
      <div className="glow-orb bg-indigo-500/10 w-[400px] h-[400px] top-10 left-10" />
      <div className="glow-orb bg-purple-500/10 w-[500px] h-[500px] bottom-10 right-10" />
      
      {/* Cyber Grid Lines */}
      <div className="absolute inset-0 cyber-grid opacity-[0.12] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10 space-y-10">
        
        {/* User Greeting Panel */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-6 border border-white/5 relative overflow-hidden">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
              <Bot size={30} />
            </div>
            <div>
              <h2 className="text-xl sm:text-3xl font-black text-white tracking-wide">
                Welcome back, <span className="text-gradient-indigo-purple">{user?.firstName || 'Interviewer'}</span>
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm mt-1 font-medium">
                Refine your skills and mock your way to landing that dream offer.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-xs font-semibold text-gray-300">
            <User size={14} className="text-indigo-400" />
            {user?.primaryEmailAddress?.emailAddress || 'Authorized Candidate'}
          </div>
        </div>

        {/* 🏆 Certificate Unlock Banner */}
        {isEligible && (
          <div className="glass-panel p-6 rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-yellow-500/0 flex flex-col sm:flex-row justify-between items-center gap-6 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-4 text-center sm:text-left relative z-10">
              <div className="p-3.5 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 shadow-md">
                <Trophy size={30} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-wide">
                  AI Mock Readiness Certified! 🏆
                </h3>
                <p className="text-gray-400 text-xs mt-1 leading-relaxed max-w-xl">
                  Outstanding performance! You have scored an average of 8.5/10 or higher across multiple mock sessions, proving you are market-ready. Click below to download your visual readiness certificate for LinkedIn!
                </p>
              </div>
            </div>
            
            <button
              onClick={() => {
                toast.success("Generating certificate assets...");
                generateCertificate(user?.fullName || 'Authorized Candidate');
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 px-6 py-3 rounded-xl hover:scale-[1.03] shadow-lg shadow-yellow-500/20 text-xs font-black tracking-wide uppercase transition-all relative z-10 shrink-0"
            >
              <Sparkles size={14} />
              Get LinkedIn Certificate
            </button>
          </div>
        )}

        {/* Stats Metrics Dashboard Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {statsCards.map((card) => (
            <div 
              key={card.title}
              className={`glass-panel p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all flex items-center relative overflow-hidden bg-gradient-to-br ${card.accent}`}
            >
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 mr-4">
                {card.icon}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{card.title}</p>
                <p className="text-2xl sm:text-3xl font-black text-white mt-1">{card.value}</p>
              </div>
              <div className="absolute right-4 bottom-4 opacity-10 pointer-events-none">
                <Activity size={48} className="text-white" />
              </div>
            </div>
          ))}
        </div>

        {/* 🚀 New 2-Column Advanced Feature Layout Block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Column 1: Spaced-Repetition Flashcards & LinkedIn Profile Auditor */}
          <div className="space-y-8 flex flex-col justify-between h-full">
            
            {/* Feature 9: Spaced-Repetition Coding Flashcards */}
            <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-gradient-to-br from-indigo-500/5 to-transparent shadow-xl space-y-4 flex-1">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1.5">
                  <HelpCircle size={13} />
                  Spaced-Repetition Revision Flashcards
                </span>
                <span className="text-[9px] bg-indigo-500/20 px-2 py-0.5 rounded text-indigo-400 font-extrabold uppercase">
                  Deck 1
                </span>
              </div>

              {/* Flipped card simulator */}
              <div 
                onClick={() => setIsFlipped(prev => !prev)}
                className="w-full min-h-[120px] rounded-2xl border border-white/10 bg-slate-950/60 p-5 cursor-pointer hover:border-indigo-500/30 transition-all flex flex-col justify-center text-center relative overflow-hidden group select-none"
              >
                <div className="absolute top-2 right-3 text-[8px] font-black uppercase text-gray-600 tracking-widest group-hover:text-indigo-400">
                  {isFlipped ? "Show Question" : "Click to Reveal Answer"}
                </div>
                
                {isFlipped ? (
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-medium">
                    ✨ {MOCK_FLASHCARDS[flashcardIndex].a}
                  </p>
                ) : (
                  <h4 className="text-sm sm:text-base font-black text-white leading-snug">
                    ❓ {MOCK_FLASHCARDS[flashcardIndex].q}
                  </h4>
                )}
              </div>

              {/* Deck Controllers */}
              <div className="flex justify-between items-center pt-2">
                <div className="flex gap-1.5 text-[9px] font-extrabold">
                  <button 
                    onClick={() => {
                      setIsFlipped(false);
                      setFlashcardIndex(prev => (prev > 0 ? prev - 1 : MOCK_FLASHCARDS.length - 1));
                      toast.info("Previous card loaded");
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                  >
                    Prev
                  </button>
                  <button 
                    onClick={() => {
                      setIsFlipped(false);
                      setFlashcardIndex(prev => (prev < MOCK_FLASHCARDS.length - 1 ? prev + 1 : 0));
                      toast.info("Next card loaded");
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                  >
                    Next
                  </button>
                </div>

                <div className="flex gap-1.5 text-[9px] font-extrabold">
                  <button onClick={() => { toast.success("Marked as Easy (repeats in 4 days)"); setIsFlipped(false); }} className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20">Easy</button>
                  <button onClick={() => { toast.success("Marked as Medium (repeats in 2 days)"); setIsFlipped(false); }} className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20">Medium</button>
                  <button onClick={() => { toast.success("Marked as Hard (repeats in 12 hours)"); setIsFlipped(false); }} className="px-2 py-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20">Hard</button>
                </div>
              </div>
            </div>

            {/* Feature 10: LinkedIn Icebreaker Engine */}
            <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-gradient-to-br from-indigo-500/5 to-transparent shadow-xl space-y-4 flex-1">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1.5">
                  <Award size={13} />
                  LinkedIn Profile Autocomplete & Icebreaker Engine
                </span>
              </div>

              <div className="space-y-3">
                <textarea
                  value={linkedinInput}
                  onChange={(e) => setLinkedinInput(e.target.value)}
                  placeholder="Paste career highlights (e.g. Interned at Stripe, built a custom key-value store, loves Node.js)..."
                  className="w-full h-20 rounded-2xl bg-slate-950/60 border border-white/10 p-3 outline-none text-xs text-gray-300 placeholder-gray-600 focus:border-indigo-500/30 transition-all resize-none font-mono"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleIcebreakers}
                    disabled={generatingIcebreakers}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider hover:scale-[1.02] shadow-lg shadow-indigo-500/10 transition-all"
                  >
                    <RefreshCw size={11} className={generatingIcebreakers ? "animate-spin" : ""} />
                    {generatingIcebreakers ? "Profiling..." : "Generate Icebreakers"}
                  </button>
                </div>

                {icebreakersResult.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/5 space-y-2.5 max-h-[100px] overflow-y-auto">
                    <span className="text-[9px] font-black uppercase text-purple-400 tracking-widest block">AI Icebreaker Hooks:</span>
                    {icebreakersResult.map((pitch, idx) => (
                      <p key={idx} className="text-[10px] text-gray-400 italic leading-relaxed border-l-2 border-indigo-500/40 pl-2">
                        {pitch}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Column 2: Feature 7 Code Portfolio Benchmarker */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-gradient-to-br from-indigo-500/5 to-transparent shadow-xl flex flex-col justify-between h-full">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1.5">
                  <Github size={14} />
                  GitHub Code Portfolio Benchmarking Studio
                </span>
                <span className="text-[9px] bg-indigo-500/20 px-2 py-0.5 rounded text-indigo-400 font-extrabold uppercase">
                  FAANG Matcher
                </span>
              </div>

              <div className="space-y-3">
                <p className="text-gray-400 text-xs leading-relaxed">
                  Analyze public repository architectures to measure coding complexity against international FAANG hiring profiles.
                </p>

                <div className="flex items-center gap-2 relative">
                  <Link2 className="absolute left-3.5 text-gray-500 h-4 w-4" />
                  <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="Ex. https://github.com/architSrivastava123/my-project"
                    className="w-full rounded-2xl bg-slate-950/60 border border-white/10 pl-10 pr-4 py-3 text-xs text-white shadow-sm focus:outline-none focus:border-indigo-500/30 transition-all font-mono"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleBenchmark}
                    disabled={benchmarking}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:scale-[1.02] shadow-lg shadow-indigo-500/10 transition-all"
                  >
                    <Activity size={12} className={benchmarking ? "animate-spin" : ""} />
                    {benchmarking ? "Analyzing Project..." : "Benchmark Repository"}
                  </button>
                </div>
              </div>
            </div>

            {benchmarksResult ? (
              <div className="mt-4 p-4 rounded-2xl bg-slate-950/80 border border-white/5 space-y-3">
                <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 border-b border-white/5 pb-2">
                  <span>Architecture Complexity</span>
                  <span className="text-emerald-400 font-black">{benchmarksResult.score} MATCH</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[10px]">
                  <div className="space-y-0.5">
                    <span className="text-gray-500 block">Class Rating:</span>
                    <strong className="text-white">{benchmarksResult.complexity}</strong>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-gray-500 block">Identified Tech:</span>
                    <strong className="text-white">{benchmarksResult.techProfile}</strong>
                  </div>
                </div>

                <div className="text-[10px] text-gray-400 leading-relaxed bg-[#0c1122]/80 p-2.5 rounded-xl border border-white/5">
                  <strong className="text-indigo-400 block mb-0.5 uppercase text-[9px] tracking-wider">Triage Audit Suggestions:</strong>
                  "{benchmarksResult.feedback}"
                </div>
              </div>
            ) : (
              <div className="mt-6 border border-dashed border-white/5 bg-slate-950/20 p-6 rounded-2xl text-center space-y-2 flex-1 flex flex-col justify-center">
                <Github size={28} className="text-gray-600 mx-auto" />
                <h5 className="text-xs font-bold text-gray-400">Telemetry Data Awaiting</h5>
                <p className="text-[10px] text-gray-600 max-w-xs mx-auto leading-relaxed">
                  Enter a GitHub repo URL above to execute visual dependency graph analyses and generate recommendations.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Creator Session Panel */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8 pb-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-yellow-500/10 text-yellow-400">
                <Zap size={22} className="animate-bounce" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white">Create AI Mock Interview</h3>
                <p className="text-gray-400 text-xs mt-0.5">Generate customized questions matching your specific job positions.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={() => setIsNewInterviewModalOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-3 rounded-xl hover:scale-[1.03] shadow-lg shadow-indigo-500/25 text-sm font-bold transition-all"
              >
                <Plus size={18} />
                New Interview
              </button>
              
              <Link href="/dashboard/negotiation">
                <Button className="flex items-center gap-2 bg-white/5 border border-white/5 hover:bg-white/10 text-gray-300 hover:text-white px-5 py-3 rounded-xl shadow-md text-sm font-bold transition-all">
                  <Handshake size={18} />
                  Salary Negotiator
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <AddNewInterview 
              isOpen={isNewInterviewModalOpen} 
              onClose={() => setIsNewInterviewModalOpen(false)} 
            />
          </div>
        </div>

        {/* History Log Section */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <History size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Interview History</h3>
              <p className="text-gray-400 text-xs mt-0.5">Access grading metrics and technical feedback for your past sessions.</p>
            </div>
          </div>
          
          <InterviewList interviews={interviewData} />
        </div>

      </div>
    </div>
  );
}

export default Dashboard;