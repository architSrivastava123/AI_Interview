"use client";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import QuestionsSection from "./_components/QuestionsSection";
import RecordAnswerSection from "./_components/RecordAnswerSection";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldAlert, Zap, Clock, Activity, CheckCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const StartInterview = ({ params }) => {
  const [interViewData, setInterviewData] = useState();
  const [mockInterviewQuestion, setMockInterviewQuestion] = useState();
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // High-Pressure Incident Triage Stress round states
  const [isIncidentActive, setIsIncidentActive] = useState(false);
  const [hasIncidentFired, setHasIncidentFired] = useState(false);

  useEffect(() => {
    GetInterviewDetails();
  }, []);

  useEffect(() => {
    // Automatically trigger a surprise live production outage round on the 3rd question (index 2)
    if (activeQuestionIndex === 2 && !hasIncidentFired) {
      setIsIncidentActive(true);
      setHasIncidentFired(true);
      toast.error("🚨 SYSTEM OUTAGE FIRED! Transitioning to high-pressure emergency triage round!");
    }
  }, [activeQuestionIndex]);

  const GetInterviewDetails = async () => {
    try {
      setIsLoading(true);
      const result = await db
        .select()
        .from(MockInterview)
        .where(eq(MockInterview.mockId, params.interviewId));
      
      const jsonMockResp = JSON.parse(result[0].jsonMockResp);
      setMockInterviewQuestion(jsonMockResp);
      setInterviewData(result[0]);
    } catch (error) {
      console.error("Failed to fetch interview details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSave = (answerRecord) => {
    if (isIncidentActive) {
      setIsIncidentActive(false);
      toast.success("Incident recovery strategy saved! Outage triage successfully resolved.");
    } else {
      if (activeQuestionIndex < mockInterviewQuestion.length - 1) {
        setActiveQuestionIndex(prev => prev + 1);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070a13] text-white flex items-center justify-center relative">
        <div className="absolute inset-0 cyber-grid opacity-[0.12] pointer-events-none" />
        <div className="text-center relative z-10 space-y-4">
          <Loader2 className="mx-auto h-12 w-12 text-indigo-400 animate-spin" />
          <p className="text-gray-400 text-sm font-semibold tracking-wide">Retrieving interview parameters...</p>
        </div>
      </div>
    );
  }

  if (!mockInterviewQuestion || mockInterviewQuestion.length === 0) {
    return (
      <div className="min-h-screen bg-[#070a13] text-white flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-rose-500 font-bold">No active questions parsed for this mock session.</p>
          <Link href="/dashboard">
            <Button className="rounded-xl mt-4">Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Create temporary incident question to inject in the record section
  const incidentMockQuestion = [{
    question: "🚨 CRITICAL OUTAGE EMERGENCY TRIAGE: Describe your step-by-step resolution plan to address database locking transaction locks and API gateway timeouts under production stress.",
    answer: "Triage DB locks by querying pg_stat_activity, killing blocked processes, configuring read-replicas, and scaling database connection pools."
  }];

  return (
    <div className="min-h-screen bg-[#070a13] text-white relative pb-20 pt-8">
      {/* Decorative Orbs */}
      <div className="glow-orb animate-glow-slow bg-indigo-500/10 w-[400px] h-[400px] top-10 left-10" />
      <div className="glow-orb animate-glow-medium bg-purple-500/10 w-[500px] h-[500px] bottom-10 right-10" />
      
      {/* Cyber Grid Lines */}
      <div className="absolute inset-0 cyber-grid opacity-[0.12] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10 space-y-8">
        
        {/* Dynamic header display */}
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              {isIncidentActive ? "Production Incident Response Console" : "AI Technical Live Session"}
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
              {isIncidentActive 
                ? "Simulated Production triage round. Explain your disaster recovery steps." 
                : "Deliver detailed technical responses to prove domain mastery."
              }
            </p>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-xs font-semibold text-gray-300">
            <Clock size={14} className="text-indigo-400 animate-pulse" />
            Session ID: {interViewData?.mockId.substring(0, 8)}
          </div>
        </div>

        {/* 🚨 Emergency Outage Card Overlay */}
        {isIncidentActive ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            
            {/* Red alert incident telemetry card */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-rose-500/30 bg-gradient-to-br from-rose-500/10 to-rose-500/0 space-y-6 relative overflow-hidden shadow-2xl animate-pulse">
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-md">
                  <ShieldAlert size={30} className="animate-bounce" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-wide uppercase">
                    EMERGENCY OUTAGE OVERRIDE 🚨
                  </h3>
                  <span className="text-[9px] bg-rose-500/20 border border-rose-500/30 text-rose-400 px-2 py-0.5 rounded font-extrabold uppercase mt-1 inline-block">
                    Out-Of-Band Assessment Active
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold border-b border-white/5 pb-2">
                    <span className="flex items-center gap-1.5"><Activity size={12} className="text-rose-400" /> Metric Telemetry</span>
                    <span className="text-rose-400">ALERT FIRED</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="text-[9px] text-gray-500 block">APIs SLA</span>
                      <strong className="text-rose-400 text-sm font-black">58%</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="text-[9px] text-gray-500 block">DB Lock Duration</span>
                      <strong className="text-rose-400 text-sm font-black">8.4s</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="text-[9px] text-gray-500 block">Checkout Drops</span>
                      <strong className="text-rose-400 text-sm font-black">-42%</strong>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#090d16] border border-white/5 text-xs sm:text-sm leading-relaxed text-gray-300">
                  <span className="font-extrabold text-[10px] uppercase tracking-wider text-rose-400 block mb-1">Incident Scenario Details:</span>
                  "A locking write transaction in the database checkout sequence is locking the main transactions table. All API requests are backing up, triggering 504 Gateway Timeouts at the payment gate. Explain your step-by-step incident triage and recovery strategy to stabilize the platform immediately."
                </div>
              </div>
            </div>

            {/* Outage Answer Recorder */}
            <RecordAnswerSection
              mockInterviewQuestion={incidentMockQuestion}
              activeQuestionIndex={0}
              interviewData={interViewData}
              onAnswerSave={handleAnswerSave}
            />

          </div>
        ) : (
          /* Normal Interview Questions Layout */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <QuestionsSection
              mockInterviewQuestion={mockInterviewQuestion}
              activeQuestionIndex={activeQuestionIndex}
            />
            
            <RecordAnswerSection
              mockInterviewQuestion={mockInterviewQuestion}
              activeQuestionIndex={activeQuestionIndex}
              interviewData={interViewData}
              onAnswerSave={handleAnswerSave}
            />
          </div>
        )}

        {/* Action button row */}
        {!isIncidentActive && (
          <div className="flex justify-end gap-4 mt-6">
            {activeQuestionIndex > 0 && (
              <Button 
                onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}
                className="rounded-xl bg-white/5 border border-white/5 text-gray-300 hover:text-white hover:bg-white/10 text-xs font-bold px-4 py-2.5 transition-all"
              >
                Previous Question
              </Button>
            )}
            
            {activeQuestionIndex !== mockInterviewQuestion?.length - 1 ? (
              <Button 
                onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 shadow-lg shadow-indigo-500/10 transition-all"
              >
                Next Question
              </Button>
            ) : (
              <Link href={'/dashboard/interview/' + interViewData?.mockId + '/feedback'}>
                <Button className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs px-5 py-3 shadow-lg shadow-indigo-500/25 hover:scale-[1.01] transition-all">
                  End Mock Interview
                </Button>
              </Link>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default StartInterview;