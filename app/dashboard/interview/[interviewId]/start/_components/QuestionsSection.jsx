"use client";
import React, { useState } from 'react';
import { Volume2, Code, Terminal, BookOpen, Play, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";

const MOCK_BOILERPLATES = {
  javascript: `// Write your algorithmic solution here\nfunction solve(input) {\n    // O(N) time complexity approach\n    return input;\n}`,
  python: `# Write your algorithmic solution here\ndef solve(input_val):\n    # O(N) time complexity approach\n    return input_val`,
  cpp: `// Write your algorithmic solution here\n#include <iostream>\nusing namespace std;\n\nint solve(int input) {\n    return input;\n}`,
  java: `// Write your algorithmic solution here\npublic class Solution {\n    public int solve(int input) {\n        return input;\n    }\n}`
};

function QuestionsSection({ mockInterviewQuestion, activeQuestionIndex }) {
  const [activeTab, setActiveTab] = useState('question'); // 'question' | 'code'
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [codeContent, setCodeContent] = useState(MOCK_BOILERPLATES.javascript);
  const [terminalOutput, setTerminalOutput] = useState("Console terminal ready. Press 'Run Test Suite' to execute dry runs.");
  const [isRunning, setIsRunning] = useState(false);

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    setCodeContent(MOCK_BOILERPLATES[lang]);
  };

  const executeCode = () => {
    setIsRunning(true);
    setTerminalOutput("Compiling visual assets and staging parameters...");
    
    setTimeout(() => {
      setIsRunning(false);
      setTerminalOutput(
        `[SUCCESS] 4/4 local mock test cases passed!\n` +
        `Execution Time: 12ms\n` +
        `Memory Profile: 4.2 MB\n` +
        `Time Complexity Audit: O(N) Linear Time complexity detected.\n` +
        `Feedback: Excellent modular structure. Code is fully clean and optimized!`
      );
    }, 1500);
  };

  const textToSpeech = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const speech = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(speech);
    } else {
      alert('Your browser does not support text to speech');
    }
  };

  return mockInterviewQuestion && (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-indigo-500/5 to-transparent shadow-2xl space-y-6">
      
      {/* 🚀 Top Tabs Selector */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('question')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'question'
                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 shadow-md'
                : 'text-gray-400 hover:text-white bg-white/0'
            }`}
          >
            <BookOpen size={14} />
            Question Details
          </button>
          
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'code'
                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 shadow-md'
                : 'text-gray-400 hover:text-white bg-white/0'
            }`}
          >
            <Code size={14} />
            Algorithmic Sandbox
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Volume2 
            className="cursor-pointer text-indigo-400 h-8 w-8 p-1.5 rounded-xl bg-white/5 border border-white/5 hover:scale-110 transition-all shrink-0" 
            onClick={() => textToSpeech(mockInterviewQuestion[activeQuestionIndex]?.question)} 
          />
        </div>
      </div>

      {activeTab === 'question' ? (
        /* Tab 1: Question Details View */
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2.5">
            {mockInterviewQuestion.map((question, index) => (
              <h2 
                key={index}
                className={`px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold text-center border transition-all ${
                  activeQuestionIndex === index 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-indigo-500/30 shadow-lg shadow-indigo-500/10' 
                    : 'bg-white/5 text-gray-400 border-white/5 hover:text-white'
                }`}
              >
                Question #{index + 1}
              </h2>
            ))}
          </div>
          
          <div className="p-5 rounded-2xl bg-[#090d16] border border-white/5 relative overflow-hidden min-h-[140px] flex items-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
            <h2 className="text-sm sm:text-base font-medium text-gray-200 leading-relaxed relative z-10">
              {mockInterviewQuestion[activeQuestionIndex]?.question}
            </h2>
          </div>
          
          <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10 flex items-start gap-3">
            <span className="text-yellow-400 text-xs shrink-0 mt-0.5">⚠️</span>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              <strong>Evaluation Tip:</strong> Avoid explaining raw steps. Focus on analyzing Big-O space complexity optimizations, database indexing alternatives, and edge case scenarios first.
            </p>
          </div>
        </div>
      ) : (
        /* Tab 2: Monaco-style Algorithmic Code Editor Sandbox */
        <div className="space-y-4">
          
          {/* Editor Header controls */}
          <div className="flex items-center justify-between bg-[#090d16] border border-white/5 px-4 py-2.5 rounded-2xl">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal size={12} className="text-indigo-400" />
              Editor Workspace
            </span>

            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="rounded-lg bg-slate-950/60 border border-white/10 text-gray-300 text-[10px] font-bold px-2 py-1 outline-none cursor-pointer"
            >
              <option value="javascript">JavaScript (Node.js)</option>
              <option value="python">Python 3.10</option>
              <option value="cpp">C++ (GCC 11)</option>
              <option value="java">Java (OpenJDK 17)</option>
            </select>
          </div>

          {/* Monaco Visual Simulator */}
          <div className="relative border border-white/5 rounded-2xl overflow-hidden bg-slate-950 font-mono text-xs text-gray-300">
            {/* Editor Gutter Line Numbers */}
            <div className="absolute left-0 top-0 bottom-0 w-9 bg-[#090d16] border-r border-white/5 flex flex-col items-center pt-3 select-none text-[10px] text-gray-600 leading-[18px]">
              {Array.from({ length: 9 }).map((_, i) => (
                <span key={i}>{i + 1}</span>
              ))}
            </div>
            
            <textarea
              value={codeContent}
              onChange={(e) => setCodeContent(e.target.value)}
              className="w-full h-44 bg-transparent outline-none border-none py-3 pl-12 pr-4 leading-[18px] text-[11px] resize-none font-mono focus:ring-0 focus:outline-none"
              style={{ tabSize: 4 }}
            />
          </div>

          {/* Execution triggers */}
          <div className="flex justify-end">
            <Button
              onClick={executeCode}
              disabled={isRunning}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs px-4 py-2.5 hover:scale-[1.02] shadow-lg shadow-indigo-500/10 flex items-center gap-2 transition-all"
            >
              <Play size={12} className={isRunning ? "animate-spin" : ""} />
              {isRunning ? "Executing Dry Runs..." : "Run Test Suite"}
            </Button>
          </div>

          {/* Output Terminal Console */}
          <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-4 space-y-2 relative overflow-hidden">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
              <CheckCircle size={10} />
              Sandbox Terminal Console
            </span>
            <pre className="text-[10px] font-mono text-gray-400 leading-relaxed whitespace-pre-wrap">
              {terminalOutput}
            </pre>
          </div>

        </div>
      )}

    </div>
  );
}

export default QuestionsSection;
