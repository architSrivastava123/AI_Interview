'use client'

import { useState } from 'react'
import { 
  Book, 
  Code, 
  PenTool, 
  Target, 
  FileText, 
  Globe, 
  Award, 
  Brain,
  ArrowRight,
  Sparkles,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import HeroSection from './dashboard/_components/HeroSection'

const ResourceCard = ({ icon, title, description, links }) => (
  <div className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col h-full relative group overflow-hidden border border-white/5">
    {/* Inner card glow element */}
    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-colors" />

    <div className="flex items-center gap-4 mb-4">
      <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">{title}</h3>
    </div>
    
    <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">{description}</p>
    
    <div className="space-y-2.5">
      {links.map((link, index) => (
        <a
          key={index}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group/link flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-xs font-semibold text-gray-300 hover:text-white"
        >
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            {link.name}
          </span>
          <ExternalLink 
            size={14}
            className="text-gray-500 group-hover/link:text-indigo-400 transition-colors" 
          />
        </a>
      ))}
    </div>
  </div>
)

export default function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState('tech')

  const resourceCategories = {
    tech: {
      icon: <Code className="w-5 h-5" />,
      resources: [
        {
          title: "Coding Platforms",
          description: "Practice algorithmic puzzles, data structures, and competitive problem-solving on core industry sandboxes.",
          icon: <Code size={22} />,
          links: [
            { name: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/" },
            { name: "LeetCode", url: "https://leetcode.com/" },
            { name: "HackerRank", url: "https://www.hackerrank.com/" },
            { name: "CodeChef", url: "https://www.codechef.com/" }
          ]
        },
        {
          title: "Technical Interview Prep",
          description: "Explore enterprise-level systems engineering concepts, microservice design structures, and whiteboard simulations.",
          icon: <Target size={22} />,
          links: [
            { name: "InterviewBit", url: "https://www.interviewbit.com/" },
            { name: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer" },
            { name: "Pramp Peer Mocks", url: "https://www.pramp.com/" }
          ]
        }
      ]
    },
    aptitude: {
      icon: <Brain className="w-5 h-5" />,
      resources: [
        {
          title: "Aptitude & Reasoning",
          description: "Hone your numerical analytical skills, spatial intelligence, and logical deduction metrics under time boundaries.",
          icon: <PenTool size={22} />,
          links: [
            { name: "IndiaBix", url: "https://www.indiabix.com/" },
            { name: "Freshersworld Aptitude", url: "https://www.freshersworld.com/aptitude-questions" },
            { name: "MathsGuru Reasoning", url: "https://www.mathsguru.com/reasoning-questions/" }
          ]
        },
        {
          title: "Competitive Exam Prep",
          description: "Access rigorous practice questions, mock tests, and syllabus blueprints for premium national and corporate assessments.",
          icon: <Award size={22} />,
          links: [
            { name: "GATE Overflow", url: "https://gateoverflow.in/" },
            { name: "Career Power", url: "https://careerpower.in/" },
            { name: "Brilliant.org", url: "https://brilliant.org/" }
          ]
        }
      ]
    },
    interview: {
      icon: <FileText className="w-5 h-5" />,
      resources: [
        {
          title: "Interview Guides",
          description: "Read peer feedback, structured compensation reports, and experience breakdowns from leading technical employers.",
          icon: <Book size={22} />,
          links: [
            { name: "AmbitionBox", url: "https://www.ambitionbox.com/" },
            { name: "InterviewStreet", url: "https://www.interviewstreet.com/" },
            { name: "Shiksha Career Guidance", url: "https://www.shiksha.com/" }
          ]
        },
        {
          title: "Global E-Learning",
          description: "Accelerate your mastery of specialized technical stacks via certified coursework from top global academic entities.",
          icon: <Globe size={22} />,
          links: [
            { name: "Coursera", url: "https://www.coursera.org/" },
            { name: "edX Platform", url: "https://www.edx.org/" },
            { name: "Udacity Nanodegrees", url: "https://www.udacity.com/" }
          ]
        }
      ]
    }
  }

  return (
    <div className="bg-[#070a13] min-h-screen text-white relative">
      <HeroSection />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-16 relative z-10 space-y-16">
        
        {/* Header Title Section */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Comprehensive <span className="text-gradient-indigo-purple">Placement Hub</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
            Harness our curated technical and strategic material to elevate your placement preparation and master your interviews.
          </p>
        </div>

        {/* Categories Tab Selector */}
        <div className="flex flex-wrap justify-center gap-3 max-w-xl mx-auto p-1.5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
          {Object.keys(resourceCategories).map((category) => {
            const cat = resourceCategories[category];
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300
                ${isActive 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 scale-105' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                {cat.icon}
                {category}
              </button>
            )
          })}
        </div>

        {/* Resources Cards Grid */}
        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8">
          {resourceCategories[activeCategory].resources.map((resource, index) => (
            <ResourceCard key={index} {...resource} />
          ))}
        </div>

        {/* Strategic Tips Highlight Panel */}
        <div className="glass-panel p-8 sm:p-12 rounded-3xl relative overflow-hidden border border-white/5">
          {/* Decorative design glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
            <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
              <Sparkles size={24} />
            </div>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
              Placement Preparation Tips
            </h3>
            <p className="text-gray-400 text-sm">
              Level up your hiring potential with our supplementary engineering checklists.
            </p>
          </div>

          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Resume Architecting",
                description: "Design a crisp, ATS-optimized technical resume showcasing core business metrics.",
                icon: <Book size={28} className="text-indigo-400" />,
                url: "https://www.canva.com/resumes/templates/"
              },
              {
                title: "Mock Interview Prep",
                description: "Access our customized AI suite to test your response flow and review metrics.",
                icon: <Target size={28} className="text-purple-400" />,
                url: "/dashboard"
              },
              {
                title: "Skill Verification",
                description: "Diagnose and verify your coding speed metrics using automated compilers.",
                icon: <Brain size={28} className="text-pink-400" />,
                url: "https://www.skillvalue.com/"
              }
            ].map((tip, index) => (
              <div 
                key={index} 
                className="bg-white/5 hover:bg-white/10 border border-white/5 p-6 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 group text-center"
              >
                <div className="inline-flex p-3.5 rounded-xl bg-white/5 border border-white/5 mb-4 group-hover:scale-110 transition-transform">
                  {tip.icon}
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{tip.title}</h4>
                <p className="text-gray-400 text-xs leading-relaxed mb-6">{tip.description}</p>
                <a
                  href={tip.url}
                  target={tip.url.startsWith('/') ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Explore Link
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}