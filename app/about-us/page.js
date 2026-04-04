'use client'

import { useState } from 'react'
import { 
  Users, 
  Target, 
  Award, 
  Briefcase, 
  BookOpen, 
  Rocket,
  Sparkles
} from 'lucide-react'

const AboutUsPage = () => {
  const [activeTab, setActiveTab] = useState('mission')

  const tabContent = {
    mission: {
      icon: <Target size={18} />,
      title: "Our Mission",
      content: (
        <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
          <p>MockMate AI is dedicated to elevating career opportunities globally by offering highly customized, dynamic mock coaching engines powered by cutting-edge intelligence.</p>
          <p>We bridge the gaps between learning, assessment, and confidence, ensuring every developer is thoroughly prepared for corporate evaluation criteria.</p>
        </div>
      )
    },
    story: {
      icon: <BookOpen size={18} />,
      title: "Our Journey",
      content: (
        <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
          <p>This studio arose from analyzing recruitment bottlenecks. Realizing that peer-to-peer prep is often scheduling-dependent and expensive, we designed an instant AI companion capable of authentic grading and voice recognition.</p>
          <p>MockMate AI stands as a robust playground enabling thousands of developers to iterate on code explanations and behavioral metrics with zero friction.</p>
        </div>
      )
    },
    approach: {
      icon: <Rocket size={18} />,
      title: "Our Approach",
      content: (
        <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
          <p>By marrying speech-to-text with advanced Gemini evaluation schemas, our system provides precise rating insights, addressing missing microservices, tech terms, and edge-cases directly.</p>
          <p>We enforce rigorous standards so that candidates gain measurable improvement feedback with every single interview run.</p>
        </div>
      )
    }
  }

  const coreValues = [
    {
      icon: <Award className="w-8 h-8 text-indigo-400" />,
      title: "Unyielding Innovation",
      description: "Pushing limits of LLM integrations to give candidates accurate corporate simulations."
    },
    {
      icon: <Users className="w-8 h-8 text-purple-400" />,
      title: "Universal Growth",
      description: "Providing premium, specialized preparation resources to candidates everywhere."
    },
    {
      icon: <Briefcase className="w-8 h-8 text-pink-400" />,
      title: "Engineering Pride",
      description: "Building resilient, fast, and feature-rich interfaces that elevate developer learning."
    }
  ]

  return (
    <div className="min-h-screen bg-[#070a13] text-white relative pb-20 pt-8">
      {/* Decorative Orbs */}
      <div className="glow-orb animate-glow-slow bg-indigo-500/10 w-[400px] h-[400px] top-10 left-10" />
      <div className="glow-orb animate-glow-medium bg-purple-500/10 w-[500px] h-[500px] bottom-10 right-10" />
      
      {/* Cyber Grid Lines */}
      <div className="absolute inset-0 cyber-grid opacity-[0.12] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative z-10 space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={12} />
            Studio Manifesto
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            About <span className="text-gradient-indigo-purple">MockMate AI</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
            Empowering modern engineers to bypass placement hurdles through immersive artificial interview environments.
          </p>
        </div>

        {/* Dynamic Tab Panel */}
        <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
          <div className="flex border-b border-white/5 p-1 bg-white/5 backdrop-blur-md">
            {Object.keys(tabContent).map((tab) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300
                    ${active 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  {tabContent[tab].icon}
                  {tabContent[tab].title}
                </button>
              )
            })}
          </div>
          <div className="p-6 sm:p-8 min-h-[160px] flex items-center">
            {tabContent[activeTab].content}
          </div>
        </div>

        {/* Core Values Section */}
        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/5">
          <h2 className="text-2xl font-black text-center text-white tracking-wide mb-8">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coreValues.map((value, index) => (
              <div 
                key={index} 
                className="bg-white/5 border border-white/5 p-6 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 group"
              >
                <div className="inline-flex p-3 rounded-xl bg-white/5 border border-white/5 mb-4 group-hover:scale-110 transition-transform">
                  {value.icon}
                </div>
                <h3 className="text-base font-bold text-white mb-2">{value.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

export default AboutUsPage