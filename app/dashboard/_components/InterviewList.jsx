"use client";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { desc, eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import InterviewItemCard from "./InterviewItemCard"
import { CalendarRange, Sparkles } from "lucide-react";

const InterviewList = () => {
  const { user } = useUser();
  const [interviewList, setInterviewList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getInterviewList();
    }
  }, [user]);

  const getInterviewList = async () => {
    try {
      const result = await db
        .select()
        .from(MockInterview)
        .where(
          eq(MockInterview.createdBy, user?.primaryEmailAddress?.emailAddress)
        )
        .orderBy(desc(MockInterview.id));

      setInterviewList(result);
    } catch (err) {
      console.error("Error retrieving past interviews:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="glass-panel p-6 rounded-2xl h-[220px] animate-pulse border border-white/5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-16 h-5 rounded bg-white/5" />
                <div className="w-3/4 h-6 rounded bg-white/5" />
                <div className="w-1/2 h-4 rounded bg-white/5" />
              </div>
              <div className="flex gap-3 mt-4">
                <div className="w-full h-8 rounded bg-white/5" />
                <div className="w-full h-8 rounded bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      ) : interviewList && interviewList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interviewList.map((interview, index) => (
            <InterviewItemCard interview={interview} key={index} />
          ))}
        </div>
      ) : (
        /* Emtpy State Visual representation */
        <div className="glass-panel p-8 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center max-w-md mx-auto py-12">
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-4 animate-pulse">
            <CalendarRange size={24} />
          </div>
          <h4 className="font-bold text-white text-base tracking-wide">No History Found</h4>
          <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">
            You haven't conducted any AI mock interviews yet. Launch your first session above to test your skills!
          </p>
        </div>
      )}
    </div>
  );
};

export default InterviewList;