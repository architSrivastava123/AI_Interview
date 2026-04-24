"use client";
import { db } from '@/utils/db';
import { UserAnswer } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  CheckCircle2, 
  XCircle, 
  ChevronsUpDown, 
  Activity, 
  Target,
  Sparkles,
  Mic,
  Award,
  Flame,
  CornerDownRight,
  Gauge,
  Info
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

const FILLER_WORDS = ['um', 'ah', 'uh', 'like', 'basically', 'you know', 'actually', 'literally'];

const analyzeFluency = (text) => {
  if (!text) return { score: 100, count: 0, details: {} };
  
  const cleanText = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
  const words = cleanText.toLowerCase().split(/\s+/);
  let fillerCount = 0;
  const details = {};
  
  FILLER_WORDS.forEach(word => {
    const escaped = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    const matches = cleanText.match(regex);
    const count = matches ? matches.length : 0;
    
    if (count > 0) {
      fillerCount += count;
      details[word] = count;
    }
  });

  const score = Math.max(20, 100 - (fillerCount * 6));
  
  return {
    score,
    count: fillerCount,
    details
  };
};

const Feedback = ({ params }) => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  
  // Speech Fluency
  const [globalFluency, setGlobalFluency] = useState(100);
  const [globalFillersCount, setGlobalFillersCount] = useState(0);
  const [globalFillersDetails, setGlobalFillersDetails] = useState({});
  
  // WPM Pace
  const [globalWpm, setGlobalWpm] = useState(0);
  const [globalPaceStatus, setGlobalPaceStatus] = useState("N/A");
  
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    GetFeedback();
  }, []);

  const GetFeedback = async () => {
    setLoading(true);
    try {
      const result = await db.select()
        .from(UserAnswer)
        .where(eq(UserAnswer.mockIdRef, params.interviewId))
        .orderBy(UserAnswer.id);

      setFeedbackList(result);

      // Average Rating
      const validRatings = result
        .map((item) => parseFloat(item.rating))
        .filter((rating) => !isNaN(rating));

      const totalRating = validRatings.reduce((sum, rating) => sum + rating, 0);
      const avgRating = validRatings.length > 0 
        ? (totalRating / validRatings.length).toFixed(1) 
        : "N/A";

      setAverageRating(avgRating);

      // Fluency & WPM Pace Calculations
      let totalScore = 0;
      let totalFillers = 0;
      const globalDetails = {};
      
      let totalRecordedWords = 0;
      let totalRecordedDuration = 0;

      result.forEach(item => {
        // Parse answer text and duration metadata
        const parts = item.userAns ? item.userAns.split("|||") : [""];
        const answerText = parts[0];
        let duration = 0;
        if (parts[1] && parts[1].startsWith("duration:")) {
          duration = parseInt(parts[1].replace("duration:", ""));
        }

        const cleanTextForWords = answerText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
        const wordCount = cleanTextForWords.trim().split(/\s+/).filter(w => w.length > 0).length;

        // Fluency Calculations on clean text
        const analysis = analyzeFluency(answerText);
        totalScore += analysis.score;
        totalFillers += analysis.count;
        Object.entries(analysis.details).forEach(([word, count]) => {
          globalDetails[word] = (globalDetails[word] || 0) + count;
        });

        // WPM calculations
        if (duration > 0) {
          totalRecordedWords += wordCount;
          totalRecordedDuration += duration;
        }
      });

      const avgFluency = result.length > 0 ? Math.round(totalScore / result.length) : 100;
      setGlobalFluency(avgFluency);
      setGlobalFillersCount(totalFillers);
      setGlobalFillersDetails(globalDetails);

      const avgWpm = totalRecordedDuration > 0 
        ? Math.round((totalRecordedWords / totalRecordedDuration) * 60) 
        : 0;
      
      setGlobalWpm(avgWpm);

      let paceStatus = "Typed Response";
      if (avgWpm > 0) {
        if (avgWpm < 110) paceStatus = "Too Slow";
        else if (avgWpm > 150) paceStatus = "Too Fast";
        else paceStatus = "Ideal Pace";
      }
      setGlobalPaceStatus(paceStatus);

    } catch (err) {
      console.error("Error retrieving feedback list:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating) => {
    const numRating = parseFloat(rating);
    if (numRating >= 8) return "text-emerald-400";
    if (numRating >= 5) return "text-yellow-400";
    return "text-rose-400";
  };

  const getFluencyFeedback = (score) => {
    if (score >= 90) return { label: "Excellent Eloquence", desc: "Superb confidence. Your speech is extremely clear and structured.", color: "text-emerald-400" };
    if (score >= 70) return { label: "Good Communication", desc: "Very steady, though minor pauses or filler words were noticed.", color: "text-yellow-400" };
    return { label: "Hesitations Detected", desc: "Try to slow down, pause silently instead of using verbal filler words.", color: "text-rose-400" };
  };

  const getPaceFeedback = (wpm, status) => {
    if (wpm === 0) return { title: "Typed Input", desc: "No voice recordings were captured for pace analysis.", color: "text-gray-400" };
    if (status === "Ideal Pace") return { title: "Ideal Speed (110-150 WPM)", desc: "Excellent professional speaking speed. Great conversational cadence!", color: "text-emerald-400" };
    if (status === "Too Fast") return { title: "Rapid Cadence (>150 WPM)", desc: "Speaking too fast may make you sound nervous. Try slowing down.", color: "text-rose-400" };
    return { title: "Slow Cadence (<110 WPM)", desc: "Speaking too slowly can sound hesitant. Focus on fluid delivery.", color: "text-yellow-400" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070a13] text-white flex items-center justify-center relative">
        <div className="absolute inset-0 cyber-grid opacity-[0.12] pointer-events-none" />
        <div className="text-center relative z-10 space-y-4">
          <Activity className="mx-auto h-12 w-12 text-indigo-400 animate-pulse" />
          <p className="text-gray-400 text-sm font-semibold tracking-wide">Compiling Speech Analytics & AI Grading...</p>
        </div>
      </div>
    );
  }

  const fluencyInfo = getFluencyFeedback(globalFluency);
  const paceInfo = getPaceFeedback(globalWpm, globalPaceStatus);

  return (
    <div className="min-h-screen bg-[#070a13] text-white relative pb-20 pt-8">
      {/* Background Neon glows */}
      <div className="glow-orb animate-glow-slow bg-indigo-500/10 w-[450px] h-[450px] top-10 left-10" />
      <div className="glow-orb animate-glow-medium bg-purple-500/10 w-[450px] h-[450px] bottom-10 right-10" />
      
      {/* Cyber Grid overlay */}
      <div className="absolute inset-0 cyber-grid opacity-[0.12] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-10">
        
        {feedbackList.length === 0 ? (
          <div className="glass-panel p-8 rounded-3xl border border-white/5 text-center max-w-md mx-auto py-14">
            <XCircle className="mx-auto h-14 w-14 text-rose-500 animate-pulse" />
            <h2 className="text-xl font-bold text-white tracking-wide mt-6">
              No Feedback Stored
            </h2>
            <p className="text-gray-400 text-xs mt-2 leading-relaxed">
              This session was exited before responses could be successfully cataloged or parsed.
            </p>
            <Button 
              onClick={() => router.replace('/dashboard')}
              className="mt-6 w-full rounded-xl bg-white/5 border border-white/5 text-gray-300 hover:text-white hover:bg-white/10 text-xs font-bold py-3.5 transition-all"
            >
              Return to Dashboard
            </Button>
          </div>
        ) : (
          <>
            {/* Top Success Banner */}
            <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6 bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400 shadow-md">
                  <CheckCircle2 size={30} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-wide flex items-center justify-center sm:justify-start gap-1.5">
                    Grading Complete 
                    <Sparkles className="text-indigo-400 animate-pulse" size={18} />
                  </h2>
                  <p className="text-gray-400 text-xs mt-0.5">Your answer transcript has been indexed by Gemini AI and mapped against grading rubrics.</p>
                </div>
              </div>
            </div>

            {/* Performance Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Overall Score Card */}
              <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-indigo-500/10 to-indigo-500/0">
                <div className="absolute right-4 top-4 opacity-5 pointer-events-none">
                  <Award size={80} className="text-white" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                    <Target size={12} />
                    Evaluation Rating
                  </span>
                  <h3 className={`text-4xl font-black mt-4 ${getRatingColor(averageRating)}`}>
                    {averageRating ? `${averageRating}` : '0'}<span className="text-lg text-gray-500">/10</span>
                  </h3>
                </div>
                <p className="text-gray-400 text-[10px] mt-6 leading-relaxed">
                  Average grade across all answers. High scoring requires direct domain keywords and architectural design specifics.
                </p>
              </div>

              {/* Speech Fluency Tracker Card */}
              <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-purple-500/0">
                <div className="absolute right-4 top-4 opacity-5 pointer-events-none">
                  <Mic size={80} className="text-white" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400 flex items-center gap-1.5">
                    <Mic size={12} />
                    Speech Analytics
                  </span>
                  <h3 className="text-4xl font-black text-purple-400 mt-4">
                    {globalFluency}%
                  </h3>
                </div>
                <div className="mt-6 space-y-1">
                  <div className="text-[11px] font-bold text-white flex justify-between">
                    <span>{fluencyInfo.label}</span>
                    <span className="text-purple-400">{globalFillersCount} fillers</span>
                  </div>
                  <p className="text-gray-400 text-[10px] leading-relaxed">
                    {fluencyInfo.desc}
                  </p>
                </div>
              </div>

              {/* Words-Per-Minute Speaking Pace Meter */}
              <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-cyan-500/10 to-cyan-500/0">
                <div className="absolute right-4 top-4 opacity-5 pointer-events-none">
                  <Gauge size={80} className="text-white" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                    <Gauge size={12} />
                    Speaking Pace
                  </span>
                  <h3 className={`text-4xl font-black mt-4 ${paceInfo.color}`}>
                    {globalWpm > 0 ? `${globalWpm}` : 'N/A'}<span className="text-lg text-gray-500">{globalWpm > 0 ? ' WPM' : ''}</span>
                  </h3>
                </div>
                <div className="mt-6 space-y-1">
                  <div className="text-[11px] font-bold text-white flex justify-between">
                    <span>{paceInfo.title}</span>
                  </div>
                  <p className="text-gray-400 text-[10px] leading-relaxed">
                    {paceInfo.desc}
                  </p>
                </div>
              </div>

            </div>

            {/* Global Filler Words Breakdown */}
            {globalFillersCount > 0 && (
              <div className="glass-panel p-5 rounded-2xl border border-white/5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400 flex items-center gap-1.5 mb-3">
                  <Flame size={12} className="animate-pulse" />
                  Hesitation Word Frequency
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {Object.entries(globalFillersDetails).map(([word, count]) => (
                    <div 
                      key={word} 
                      className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-300 flex items-center gap-2 hover:border-purple-500/30 transition-all"
                    >
                      <span className="font-bold text-white capitalize">{word}</span>
                      <span className="h-4.5 px-1.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-[10px] font-black text-purple-400">
                        {count}x
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Question Review List */}
            <div className="space-y-5">
              <div className="border-b border-white/5 pb-2">
                <h3 className="text-xl font-bold text-white tracking-wide">
                  Detailed Answer Review
                </h3>
                <p className="text-gray-400 text-xs mt-0.5">
                  Expand each interview item to examine the speech speed, stutters, correct answers, and AI feedback.
                </p>
              </div>

              {feedbackList.map((item, index) => {
                // Parse WPM and duration metadata
                const parts = item.userAns ? item.userAns.split("|||") : [""];
                const answerText = parts[0];
                let duration = 0;
                if (parts[1] && parts[1].startsWith("duration:")) {
                  duration = parseInt(parts[1].replace("duration:", ""));
                }

                const cleanText = answerText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
                const wordCount = cleanText.trim().split(/\s+/).filter(w => w.length > 0).length;

                // Fluency score
                const questionFluency = analyzeFluency(answerText);
                
                // WPM Pace
                const qWpm = duration > 0 ? Math.round((wordCount / duration) * 60) : 0;
                let qPaceStatus = "Typed Response";
                if (qWpm > 0) {
                  if (qWpm < 110) qPaceStatus = "Too Slow";
                  else if (qWpm > 150) qPaceStatus = "Too Fast";
                  else qPaceStatus = "Ideal Pace";
                }
                const qPaceInfo = getPaceFeedback(qWpm, qPaceStatus);

                const isHighRating = parseFloat(item.rating) >= 7;
                const isMediumRating = parseFloat(item.rating) >= 4;

                return (
                  <Collapsible key={index} className="glass-panel rounded-2xl overflow-hidden border border-white/5 hover:border-indigo-500/20 transition-all duration-300">
                    <CollapsibleTrigger className="w-full text-left group">
                      <div className="flex items-center justify-between p-5 bg-white/[0.01] hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4 pr-6">
                          <div className={`p-2.5 rounded-xl ${
                            isHighRating 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                              : isMediumRating 
                              ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" 
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}>
                            <Target size={18} />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Question {index + 1}</span>
                            <h4 className="font-bold text-white tracking-wide text-sm sm:text-base mt-0.5 line-clamp-1 group-hover:text-indigo-400 transition-colors">
                              {item.question}
                            </h4>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-extrabold px-2.5 py-1 rounded bg-white/5 border border-white/5 ${getRatingColor(item.rating)}`}>
                            {item.rating}/10
                          </span>
                          <ChevronsUpDown className="h-4.5 w-4.5 text-gray-500 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="p-6 border-t border-white/5 space-y-5 bg-[#0b0f19]/30">
                      
                      {/* Grid for User Answer and Correct Answer */}
                      <div className="grid md:grid-cols-2 gap-5">
                        
                        {/* User Answer Panel */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-extrabold uppercase tracking-widest text-rose-400 flex items-center gap-1.5">
                            <XCircle size={12} />
                            Your Response
                          </label>
                          <div className="bg-rose-500/5 p-4 rounded-2xl text-xs sm:text-sm text-gray-300 border border-rose-500/10 leading-relaxed min-h-[100px]">
                            {answerText || "No response transcribed."}
                          </div>
                        </div>

                        {/* Correct Criteria Panel */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 size={12} />
                            Target Baseline Answer
                          </label>
                          <div className="bg-emerald-500/5 p-4 rounded-2xl text-xs sm:text-sm text-gray-300 border border-emerald-500/10 leading-relaxed min-h-[100px]">
                            {item.correctAns}
                          </div>
                        </div>

                      </div>

                      {/* Question Speech Analytics Tracker Panel */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10">
                        
                        {/* Hesitation stutters */}
                        <div className="space-y-1.5 border-r border-white/5 pr-4">
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400 flex items-center gap-1.5">
                            <Mic size={12} />
                            Speech Hesitations
                          </span>
                          {questionFluency.count > 0 ? (
                            <p className="text-gray-400 text-xs leading-relaxed flex items-center gap-1.5 flex-wrap">
                              <CornerDownRight size={13} className="text-purple-400 shrink-0" />
                              Detected <span className="text-rose-400 font-extrabold">{questionFluency.count} fillers</span>: 
                              {Object.entries(questionFluency.details).map(([w, c]) => (
                                <span key={w} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] font-bold text-gray-300">
                                  "{w}" ({c}x)
                                </span>
                              ))}
                            </p>
                          ) : (
                            <p className="text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                              🌟 Flawless speech patterns. Zero fillers detected!
                            </p>
                          )}
                          <span className="inline-block mt-2 text-[10px] font-black text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                            Fluency: {questionFluency.score}%
                          </span>
                        </div>

                        {/* Speaking Pace speed WPM */}
                        <div className="space-y-1.5 pl-0 sm:pl-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                            <Gauge size={12} />
                            Speaking Pace (WPM)
                          </span>
                          {qWpm > 0 ? (
                            <div className="space-y-1">
                              <p className="text-gray-300 text-xs flex items-center gap-1">
                                <CornerDownRight size={13} className="text-cyan-400 shrink-0" />
                                Speed rate: <span className={`font-black ${qPaceInfo.color}`}>{qWpm} WPM</span> ({qPaceStatus})
                              </p>
                              <p className="text-gray-400 text-[10px] leading-relaxed">
                                {duration}s talk-time / {wordCount} words spoken.
                              </p>
                            </div>
                          ) : (
                            <p className="text-gray-400 text-xs flex items-center gap-1.5">
                              <Info size={13} />
                              Typed answer (Speed metrics unavailable).
                            </p>
                          )}
                        </div>

                      </div>

                      {/* AI Detailed Feedback Panel */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                          <Sparkles size={12} className="animate-pulse" />
                          AI Evaluator Feedback
                        </label>
                        <div className="bg-indigo-500/5 p-4 rounded-2xl text-xs sm:text-sm text-gray-300 border border-indigo-500/10 leading-relaxed">
                          {item.feedback}
                        </div>
                      </div>

                    </CollapsibleContent>
                  </Collapsible>
                );
              })}

              {/* Bottom Nav Action */}
              <div className="text-center pt-6">
                <Button 
                  onClick={() => router.replace('/dashboard')}
                  className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm px-8 py-3.5 shadow-lg shadow-indigo-500/20 hover:scale-[1.02] transition-all"
                >
                  Return to Dashboard
                </Button>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Feedback;