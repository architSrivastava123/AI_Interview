"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { chatSession } from "@/utils/GeminiAIModal";
import { 
  Handshake, 
  Sparkles, 
  Send, 
  Activity, 
  ArrowLeft, 
  Briefcase, 
  Coins, 
  Scale, 
  ShieldAlert, 
  CheckCircle2, 
  HelpCircle,
  Lightbulb
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const SCENARIOS = [
  {
    id: "lowball",
    name: "The Lowball Tech Offer",
    icon: <Briefcase className="text-rose-400" size={24} />,
    description: "An HR recruiter offers you $90,000 for a Senior Frontend Engineer role when market rate is $125,000. Negotiate upwards using market research and your specific project value without losing the offer.",
    initialOffer: "$90,000 base salary, standard health insurance, 2 weeks PTO.",
    systemContext: "The company is eager to hire you, but HR is under strict pressure to keep base salaries under $95,000 unless you prove extraordinary architectural expertise or leverage clear competing market anchors."
  },
  {
    id: "exploding",
    name: "The Exploding Offer Deadline",
    icon: <Coins className="text-cyan-400" size={24} />,
    description: "You receive an offer with an aggressive 24-hour expiration deadline. The offer is decent, but you need an extension to complete other interviews and want a $10,000 sign-on bonus to commit early.",
    initialOffer: "$110,000 base salary, 10% annual bonus target. Must accept within 24 hours.",
    systemContext: "HR is extremely nervous about losing candidates to competing offers. They will yield on a 1-week extension or a partial sign-on bonus if you convey absolute enthusiasm to join immediately."
  },
  {
    id: "leverage",
    name: "The Dual Offer Leverage",
    icon: <Scale className="text-purple-400" size={24} />,
    description: "You have two active offers. Your preferred company offered $105,000, while your second-choice offered $120,000. Leverage the second offer to get your preferred company to match or exceed $115,000.",
    initialOffer: "$105,000 base salary, hybrid model (3 days in office).",
    systemContext: "HR loves your profile but has a tight budget. They can stretch the offer to $116,000 or grant fully-remote status if you communicate collaboratively and avoid sounding demanding or arrogant."
  }
];

export default function NegotiationSimulator() {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Real-Time Tactic Analytics
  const [tacticAnalytics, setTacticAnalytics] = useState({
    tone: "N/A",
    leverage: "N/A",
    score: 50,
    tips: "Recruiter is waiting for your opening statement. Start by stating your high appreciation for the offer."
  });
  
  const [simulationEnded, setSimulationEnded] = useState(false);
  const [outcome, setOutcome] = useState("");
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation]);

  const selectScenario = (scenario) => {
    setSelectedScenario(scenario);
    setConversation([
      {
        role: "recruiter",
        text: `Hi there! I'm Sarah from HR. We are absolutely thrilled about your technical rounds! I'm excited to present you with our official offer: ${scenario.initialOffer}. Let me know your thoughts so we can get everything finalized!`
      }
    ]);
    setTacticAnalytics({
      tone: "Pending",
      leverage: "Pending",
      score: 50,
      tips: "State your genuine appreciation for the team first, then pivot to market rates or competing packages."
    });
    setSimulationEnded(false);
    setOutcome("");
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMessage = inputText.trim();
    setInputText("");
    setLoading(true);

    const updatedConversation = [...conversation, { role: "user", text: userMessage }];
    setConversation(updatedConversation);

    try {
      const prompt = `You are a professional corporate HR Recruiter named Sarah conducting a salary negotiation with a candidate.
      Scenario selected: ${selectedScenario.name}
      Recruiter Guidelines: ${selectedScenario.systemContext}
      
      Here is the entire conversation log:
      ${updatedConversation.map(c => `${c.role === 'user' ? 'Candidate' : 'Sarah'}: ${c.text}`).join("\n")}
      
      Evaluate the candidate's latest response: "${userMessage}".
      Respond in character as Sarah. Keep your reply realistic, professional, and within budget, but respond favorably to collaborative anchors.
      
      You MUST respond strictly in valid JSON format matching this schema. Do not output any markdown formatting, backticks, or extra text.
      {
        "reply": "<Sarah's recruiter response in character>",
        "evaluation": {
          "tone": "Collaborative" | "Passive" | "Demanding",
          "leverage": "Low" | "Medium" | "High",
          "score": <Number between 0 and 100 representing their current negotiation performance>,
          "tips": "<A single line of actionable coaching advice based on their negotiation tactic>"
        },
        "simulationEnded": <true or false representing whether a final settlement has been agreed upon, or if negotiations broke down due to extreme candidate demands>
      }`;

      const result = await chatSession.sendMessage(prompt);
      const rawText = result.response.text();
      const cleaned = rawText.replace(/```json|```/gi, "").trim();

      let jsonResp;
      try {
        jsonResp = JSON.parse(cleaned);
      } catch (parseErr) {
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (match) {
          jsonResp = JSON.parse(match[0]);
        } else {
          throw new Error("Unable to parse structured simulation output");
        }
      }

      setConversation(prev => [...prev, { role: "recruiter", text: jsonResp.reply }]);
      
      if (jsonResp.evaluation) {
        setTacticAnalytics(jsonResp.evaluation);
      }

      if (jsonResp.simulationEnded) {
        setSimulationEnded(true);
        // Compute outcome based on score
        if (jsonResp.evaluation.score >= 75) {
          setOutcome("SUCCESS: Deal Finalized! You successfully maximized your base compensation, bonuses, and terms without breaking the recruiter's budget. Excellent collaboration!");
        } else if (jsonResp.evaluation.score >= 50) {
          setOutcome("ACCEPTABLE: Offer accepted, but minor concessions were left on the table. Focus on firmer anchoring in your next negotiation.");
        } else {
          setOutcome("FAILED: Recruiter walked away or rescinded. The negotiation was either too demanding/rigid or lacked appropriate market leverage.");
        }
      }

    } catch (err) {
      console.error(err);
      toast.error("Simulation connection timed out. Please try sending your statement again.");
    } finally {
      setLoading(false);
    }
  };

  const resetSimulator = () => {
    setSelectedScenario(null);
    setConversation([]);
    setSimulationEnded(false);
    setOutcome("");
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-white relative pb-20 pt-8">
      {/* Decorative Orbs */}
      <div className="glow-orb animate-glow-slow bg-indigo-500/10 w-[400px] h-[400px] top-10 left-10" />
      <div className="glow-orb animate-glow-medium bg-purple-500/10 w-[500px] h-[500px] bottom-10 right-10" />
      
      {/* Cyber Grid Lines */}
      <div className="absolute inset-0 cyber-grid opacity-[0.12] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10 space-y-8">
        
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-extrabold uppercase text-[10px] tracking-widest">
              <Handshake size={14} />
              Training Module
            </div>
            <h1 className="text-3xl font-black text-white tracking-wide mt-1 flex items-center gap-2">
              Salary & HR Negotiator
              <Sparkles className="text-indigo-400 animate-pulse animate-glow-slow" size={22} />
            </h1>
            <p className="text-gray-500 text-xs mt-0.5">Simulate salary reviews, explode deadlines, and secure competing offers with real-time tactical grading.</p>
          </div>
          {selectedScenario ? (
            <Button 
              onClick={resetSimulator}
              className="rounded-xl bg-white/5 border border-white/5 text-gray-300 hover:text-white hover:bg-white/10 text-xs font-bold py-2.5 flex items-center gap-2"
            >
              <ArrowLeft size={14} /> Back to Scenarios
            </Button>
          ) : (
            <Link href="/dashboard">
              <Button className="rounded-xl bg-white/5 border border-white/5 text-gray-300 hover:text-white hover:bg-white/10 text-xs font-bold py-2.5 flex items-center gap-2">
                <ArrowLeft size={14} /> Dashboard
              </Button>
            </Link>
          )}
        </div>

        {!selectedScenario ? (
          /* Scenario Selector Panels */
          <div className="space-y-6">
            <div className="p-5 rounded-3xl border border-yellow-500/10 bg-yellow-500/5 flex items-start gap-3.5">
              <Lightbulb className="text-yellow-400 shrink-0 mt-0.5" size={18} />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">How to Practice Salary Negotiations:</h4>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Select an HR negotiation module below. Sarah, the AI Recruiter, will present an initial lowball or fast-expiring offer. 
                  Use objective market anchors, state your value projects, and work collaboratively to unlock salary boosts without triggering recruiter retreat!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SCENARIOS.map((scenario) => (
                <div 
                  key={scenario.id}
                  className="glass-panel p-6 rounded-3xl border border-white/5 hover:border-indigo-500/20 transition-all flex flex-col justify-between space-y-6 relative overflow-hidden group bg-gradient-to-br from-indigo-500/5 to-transparent"
                >
                  <div className="space-y-4">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5 inline-block group-hover:scale-110 transition-transform">
                      {scenario.icon}
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-wide group-hover:text-indigo-400 transition-colors">
                      {scenario.name}
                    </h3>
                    <p className="text-gray-500 text-xs leading-relaxed">
                      {scenario.description}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-[#090d16] border border-white/5 text-[11px] text-gray-400 space-y-1 leading-relaxed">
                      <span className="font-extrabold text-[9px] uppercase tracking-widest text-indigo-400 block">Initial Offer:</span>
                      "{scenario.initialOffer}"
                    </div>
                    <Button 
                      onClick={() => selectScenario(scenario)}
                      className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs py-3 shadow-lg shadow-indigo-500/10 hover:scale-[1.02] transition-all"
                    >
                      Start Session
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Active Simulation Area */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Box: Active Recruiter Chat Log */}
            <div className="lg:col-span-2 flex flex-col h-[580px] glass-panel rounded-3xl border border-white/5 overflow-hidden relative">
              <div className="absolute inset-0 cyber-grid opacity-[0.04] pointer-events-none" />
              
              {/* Recruiter Header */}
              <div className="p-4 bg-white/[0.01] border-b border-white/5 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute bottom-0 right-0 border border-[#070a13] animate-ping" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute bottom-0 right-0 border border-[#070a13]" />
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 text-xs font-bold">
                      HR
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-white tracking-wide text-sm">Sarah (HR Recruiter)</h3>
                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Active HR Negotiation Simulator</span>
                  </div>
                </div>
                <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded font-extrabold uppercase">
                  Turn {Math.floor(conversation.length / 2) + 1}
                </span>
              </div>

              {/* Message scroll container */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0 z-10">
                {conversation.map((msg, index) => (
                  <div 
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-lg ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border border-indigo-500/10 rounded-tr-none'
                        : 'bg-white/5 border border-white/5 text-gray-300 rounded-tl-none'
                    }`}>
                      <span className="font-bold block text-[10px] text-gray-500 mb-1 capitalize tracking-wide">
                        {msg.role === 'user' ? 'You' : 'Sarah'}
                      </span>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%] text-xs text-gray-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                      Sarah is reviewing budget parameters...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white/[0.01] border-t border-white/5 z-10">
                {simulationEnded ? (
                  <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left space-y-1">
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 justify-center sm:justify-start">
                        <CheckCircle2 size={12} /> Simulation Finished
                      </span>
                      <p className="text-gray-400 text-xs font-semibold leading-relaxed">
                        The recruiter has concluded compiling the final terms of the offer.
                      </p>
                    </div>
                    <Button 
                      type="button" 
                      onClick={resetSimulator}
                      className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs px-5 py-2.5 hover:scale-[1.02] transition-all"
                    >
                      Negotiate Again
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      disabled={loading}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Type your diplomatic counter-proposal here..."
                      className="flex-1 rounded-xl bg-slate-950/60 border border-white/5 px-4 py-3 text-xs sm:text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <Button 
                      type="submit" 
                      disabled={loading || !inputText.trim()}
                      className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold px-4 h-11 shadow-lg shadow-indigo-500/10 hover:scale-[1.01] transition-all flex items-center justify-center"
                    >
                      <Send size={16} />
                    </Button>
                  </div>
                )}
              </form>

            </div>

            {/* Right Box: Live Recruiter Analysis Dashboard */}
            <div className="space-y-6">
              
              {/* Active Scenario Overview Card */}
              <div className="glass-panel p-5 rounded-3xl border border-white/5 space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                  <Briefcase size={12} />
                  Active Scenario Context
                </span>
                <h4 className="font-bold text-white text-sm">{selectedScenario.name}</h4>
                <p className="text-gray-400 text-[11px] leading-relaxed">
                  {selectedScenario.description}
                </p>
              </div>

              {/* Real-time Tactic Analytics Card */}
              <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-6 relative overflow-hidden bg-gradient-to-br from-indigo-500/5 to-transparent">
                
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                  <Activity size={12} className="animate-pulse" />
                  Negotiation Tactician Logs
                </span>

                <div className="space-y-4">
                  {/* Score Meter */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-white">
                      <span>Tactics Score</span>
                      <span className="text-indigo-400">{tacticAnalytics.score}/100</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" 
                        style={{ width: `${tacticAnalytics.score}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Tone Badge */}
                    <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 block mb-1">Tone Analysis</span>
                      <span className={`text-xs font-black uppercase tracking-wider ${
                        tacticAnalytics.tone === 'Collaborative' 
                          ? 'text-emerald-400' 
                          : tacticAnalytics.tone === 'Demanding' 
                          ? 'text-rose-400 animate-pulse' 
                          : tacticAnalytics.tone === 'Passive'
                          ? 'text-yellow-400'
                          : 'text-gray-500'
                      }`}>
                        {tacticAnalytics.tone}
                      </span>
                    </div>

                    {/* Leverage Applied Badge */}
                    <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 block mb-1">Leverage Applied</span>
                      <span className={`text-xs font-black uppercase tracking-wider ${
                        tacticAnalytics.leverage === 'High' 
                          ? 'text-emerald-400' 
                          : tacticAnalytics.leverage === 'Medium' 
                          ? 'text-indigo-400' 
                          : tacticAnalytics.leverage === 'Low'
                          ? 'text-yellow-400 animate-pulse'
                          : 'text-gray-500'
                      }`}>
                        {tacticAnalytics.leverage}
                      </span>
                    </div>
                  </div>

                  {/* Recruiter Coaching Tip Panel */}
                  <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10 space-y-1.5">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-purple-400 flex items-center gap-1.5">
                      <Lightbulb size={11} className="animate-pulse" />
                      Live Recruiter Coaching Advice
                    </span>
                    <p className="text-gray-400 text-xs leading-relaxed italic">
                      "{tacticAnalytics.tips}"
                    </p>
                  </div>

                </div>

              </div>

              {/* Simulation Conclusion outcome box */}
              {simulationEnded && (
                <div className={`p-5 rounded-3xl border flex flex-col justify-between space-y-4 ${
                  tacticAnalytics.score >= 75 
                    ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300' 
                    : tacticAnalytics.score >= 50
                    ? 'border-yellow-500/20 bg-yellow-500/5 text-yellow-300'
                    : 'border-rose-500/20 bg-rose-500/5 text-rose-300'
                }`}>
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest block">Final Settlement Outcome:</span>
                    <p className="text-xs leading-relaxed font-semibold">
                      {outcome}
                    </p>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
