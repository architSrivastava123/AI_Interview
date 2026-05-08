"use client";
import { Button } from "@/components/ui/button";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { Lightbulb, WebcamIcon, Sparkles, GraduationCap, Video, ShieldAlert, LoaderCircle } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";
import { toast } from "sonner";

function Interview({ params }) {
  const [interviewData, setInterviewData] = useState(null);
  const [webCamEnabled, setWebCamEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const trackLabel = interviewData?.interviewTrack || "General";

  useEffect(() => {
    GetInterviewDetails();
  }, []);

  const GetInterviewDetails = async () => {
    try {
      setLoading(true);
      const result = await db
        .select()
        .from(MockInterview)
        .where(eq(MockInterview.mockId, params.interviewId));

      if (result.length > 0) {
        setInterviewData(result[0]);
      } else {
        toast.error("Interview details not found");
      }
    } catch (error) {
      toast.error("Error fetching interview details");
      console.error("Interview details fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWebcamToggle = () => {
    if (!webCamEnabled) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(() => {
          setWebCamEnabled(true);
          toast.success("Webcam and microphone enabled");
        })
        .catch((error) => {
          toast.error("Failed to access webcam or microphone");
          console.error("Webcam access error:", error);
        });
    } else {
      setWebCamEnabled(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070a13] text-white flex items-center justify-center relative">
        <div className="absolute inset-0 cyber-grid opacity-[0.12] pointer-events-none" />
        <div className="text-center relative z-10 space-y-4">
          <LoaderCircle className="mx-auto h-12 w-12 text-indigo-400 animate-spin" />
          <p className="text-gray-400 text-sm font-semibold tracking-wide">Retrieving interview parameters...</p>
        </div>
      </div>
    );
  }

  if (!interviewData) {
    return (
      <div className="min-h-screen bg-[#070a13] text-white flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm glass-panel p-8 border border-white/5 rounded-3xl">
          <ShieldAlert className="mx-auto text-rose-500 h-12 w-12 animate-pulse" />
          <h2 className="text-xl font-bold tracking-wide">Interview Session Invalid</h2>
          <p className="text-gray-500 text-xs leading-relaxed">This mock ID has expired or does not match active records.</p>
          <Button onClick={() => window.location.replace('/dashboard')} className="w-full mt-4">Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  // Parse custom resume tailoring metadata suffix
  const descParts = interviewData.jobDesc ? interviewData.jobDesc.split("|||") : [""];
  const techStackText = descParts[0];
  let resumeSummary = null;
  if (descParts[1] && descParts[1].startsWith("resume:")) {
    resumeSummary = descParts[1].replace("resume:", "");
  }

  return (
    <div className="my-10 relative z-10 px-6 max-w-6xl mx-auto space-y-8">
      {/* Decorative Orbs */}
      <div className="glow-orb animate-glow-slow bg-indigo-500/5 w-[350px] h-[350px] top-10 left-10" />

      <div className="border-b border-white/5 pb-2">
        <h2 className="font-black text-3xl text-white tracking-wide flex items-center gap-2">
          Ready to Start?
          <Sparkles className="text-indigo-400 animate-pulse" size={22} />
        </h2>
        <p className="text-gray-500 text-xs mt-1">Review the parameters, test your hardware, and initialize the AI mock assessment.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* Left Column: Job parameters */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col p-6 rounded-3xl border border-white/5 bg-[#0b0f19]/40 backdrop-blur-md gap-5">
            <h2 className="text-base text-gray-300">
              <strong className="text-indigo-400 font-extrabold uppercase text-[10px] tracking-widest block mb-1">Interview Track</strong>
              {trackLabel}
            </h2>
            <h2 className="text-base text-gray-300">
              <strong className="text-indigo-400 font-extrabold uppercase text-[10px] tracking-widest block mb-1">Job Role / Position</strong>
              {interviewData.jobPosition}
            </h2>
            <h2 className="text-base text-gray-300">
              <strong className="text-indigo-400 font-extrabold uppercase text-[10px] tracking-widest block mb-1">Job Description / Tech Stack</strong>
              {techStackText}
            </h2>
            <h2 className="text-base text-gray-300">
              <strong className="text-indigo-400 font-extrabold uppercase text-[10px] tracking-widest block mb-1">Years of Experience</strong>
              {interviewData.jobExperience} Year(s)
            </h2>

            {/* Custom Resume highlights uploader display banner */}
            {resumeSummary && (
              <div className="mt-2 p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10 text-purple-200">
                <h3 className="text-xs font-black uppercase tracking-widest text-purple-400 flex items-center gap-1.5">
                  <Sparkles size={14} className="animate-pulse" />
                  ATS Resume Project Tailoring Active
                </h3>
                <p className="text-gray-400 text-xs mt-2 leading-relaxed italic">
                  "{resumeSummary}"
                </p>
              </div>
            )}
          </div>

          <div className="p-6 border rounded-3xl border-yellow-500/10 bg-yellow-500/5 space-y-3">
            <h2 className="flex gap-2 items-center text-yellow-400 font-bold text-sm">
              <Lightbulb size={16} />
              <span>Session Directives</span>
            </h2>
            <p className="text-gray-400 text-xs leading-relaxed">
              Enable your Web Cam and Microphone to initialize the AI Mock Interview Studio. 
              The session consists of 5 technical and behavioral questions curated by Gemini AI. 
              Speak naturally, review your transcription on screen, and end the session to check your grading metrics!
            </p>
          </div>
        </div>

        {/* Right Column: Hardware check uploader/webcam */}
        <div className="flex flex-col items-center justify-center glass-panel p-6 rounded-3xl border border-white/5 relative overflow-hidden min-h-[300px]">
          {webCamEnabled ? (
            <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden border border-white/5 relative">
              <Webcam
                mirrored={true}
                className="w-full h-full object-cover rounded-2xl"
                onUserMedia={() => setWebCamEnabled(true)}
                onUserMediaError={() => {
                  toast.error("Webcam access error");
                  setWebCamEnabled(false);
                }}
              />
              <div className="absolute top-4 left-4 z-20 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Camera Active
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4 py-8">
              <div className="p-5 rounded-full bg-white/[0.02] border border-white/5 inline-block text-gray-500">
                <WebcamIcon size={36} />
              </div>
              <h4 className="text-sm font-bold text-white tracking-wide">Test Your Video Hardware</h4>
              <p className="text-gray-500 text-[11px] leading-relaxed max-w-xs mx-auto">
                Prepare your alignment and lighting. Toggling the webcam here helps you verify permissions before entering.
              </p>
              <Button
                className="rounded-xl px-5 py-2.5 text-xs font-bold bg-white/5 border border-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-all flex items-center gap-2 mx-auto"
                onClick={handleWebcamToggle}
              >
                <Video size={14} /> Enable Camera & Mic
              </Button>
            </div>
          )}
        </div>

      </div>

      {/* Start Button */}
      <div className="flex justify-end pt-4 border-t border-white/5">
        <Link href={`/dashboard/interview/${params.interviewId}/start`}>
          <Button className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-sm px-8 py-4 shadow-lg shadow-indigo-500/20 hover:scale-[1.02] transition-all">
            Initialize Studio Panel
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default Interview;
