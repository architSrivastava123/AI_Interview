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
  Activity
} from "lucide-react";

import AddNewInterview from './_components/AddNewInterview'
import InterviewList from './_components/InterviewList'

function Dashboard() {
  const { user } = useUser();
  const [interviewData, setInterviewData] = useState([]);
  const [isNewInterviewModalOpen, setIsNewInterviewModalOpen] = useState(false);
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

  const fetchInterviews = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) {
      toast.error("User email not found");
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch interview data');
      }
  
      const data = await response.json();
      
      // Filter interviews specific to the current user's email
      const userSpecificInterviews = data.userAnswers.filter(
        interview => interview.userEmail === user.primaryEmailAddress.emailAddress
      );

      setInterviewData(userSpecificInterviews);

      // Calculate and update stats
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

      if (totalInterviews > 0) {
        toast.success(`Loaded ${totalInterviews} interview(s)`);
      }

    } catch (error) {
      console.error('Error fetching interviews:', error);
      toast.error(error.message || 'Failed to fetch interviews');
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
      <div className="glow-orb animate-glow-slow bg-indigo-500/10 w-[400px] h-[400px] top-10 left-10" />
      <div className="glow-orb animate-glow-medium bg-purple-500/10 w-[500px] h-[500px] bottom-10 right-10" />
      
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

            <button 
              onClick={() => setIsNewInterviewModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-3 rounded-xl hover:scale-[1.03] shadow-lg shadow-indigo-500/25 text-sm font-bold transition-all"
            >
              <Plus size={18} />
              New Interview
            </button>
          </div>

          {/* Add New Interview component inline list holder */}
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