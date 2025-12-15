"use client";
import React, { useEffect, useState } from "react";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { Lightbulb, WebcamIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

function Interview({ params }) {
  const [interviewData, setInterviewData] = useState();
  const [webCamEnabled, setWebCamEnabled] = useState(false);

  useEffect(() => {
    GetInterviewDetails();
  }, []);

  const GetInterviewDetails = async () => {
    const result = await db
      .select()
      .from(MockInterview)
      .where(eq(MockInterview.mockId, params.interviewId));
    setInterviewData(result[0]);
  };

  return (
    <div className="my-10 max-w-5xl mx-auto px-4">
      <h2 className="font-bold text-3xl text-gray-800">Let's Get Started</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10">
        <div className="flex flex-col gap-5 justify-between">
          <div className="flex flex-col p-5 rounded-lg border gap-5 bg-white shadow-sm">
            <h2 className="text-lg"><strong>Job Role/Position: </strong>{interviewData?.jobPosition}</h2>
            <h2 className="text-lg"><strong>Job Description/Tech Stack: </strong>{interviewData?.jobDesc}</h2>
            <h2 className="text-lg"><strong>Years of Experience: </strong>{interviewData?.jobExperience}</h2>
          </div>
          
          <div className="p-5 border rounded-lg border-yellow-300 bg-yellow-50 text-yellow-700 flex items-start gap-3">
            <Lightbulb className="h-6 w-6 mt-1 flex-shrink-0" />
            <div>
              <h2 className="font-semibold text-lg">Information</h2>
              <p className="mt-1 text-sm leading-relaxed">
                Enable your Web Camera and Microphone to start the AI Mock Interview.
                It consists of 5 questions generated based on your experience and technology stack.
                We do NOT store your video, only your voice transcript is analyzed to generate instant AI feedback.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center border rounded-lg p-5 bg-gray-50">
          {webCamEnabled ? (
            <div className="w-full aspect-video rounded-lg overflow-hidden border bg-black flex justify-center items-center">
              <span className="text-white text-sm">Webcam Enabled</span>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center">
              <Image src="/webcam.png" width={200} height={200} alt="webcam" className="opacity-60" />
              <Button variant="ghost" className="mt-5 w-full bg-secondary" onClick={() => setWebCamEnabled(true)}>
                Enable Web Camera and Microphone
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end mt-10">
        <Link href={'/dashboard/interview/' + params.interviewId + '/start'}>
          <Button size="lg">Start Interview</Button>
        </Link>
      </div>
    </div>
  );
}

export default Interview;
