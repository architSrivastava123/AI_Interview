import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { db } from "@/utils/db";
import { eq } from "drizzle-orm";
import { MockInterview } from "@/utils/schema";
import { Trash, Calendar, Sparkles, Award } from "lucide-react";
import { toast } from "sonner";

const InterviewItemCard = ({ interview }) => {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const trackLabel = interview?.interviewTrack || "General";

  const onStart = () => {
    router.push(`/dashboard/interview/${interview?.mockId}`);
  };

  const onFeedbackPress = () => {
    router.push(`/dashboard/interview/${interview?.mockId}/feedback`);
  };

  const onDelete = async () => {
    try {
      await db.delete(MockInterview).where(eq(MockInterview.mockId, interview?.mockId));
      setIsDialogOpen(false);
      toast.success("Interview session deleted");
      router.refresh();
    } catch (error) {
      console.error("Error deleting interview:", error);
      toast.error("Failed to delete interview");
    }
  };

  return (
    <div className="glass-panel p-5 rounded-2xl relative border border-white/5 hover:border-indigo-500/30 transition-all duration-300 group shadow-lg flex flex-col justify-between min-h-[220px]">
      
      {/* Delete button in the top-right corner */}
      <button
        className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 border border-white/5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all duration-200"
        onClick={() => setIsDialogOpen(true)}
        aria-label="Delete Session"
      >
        <Trash size={15} />
      </button>

      {/* Card Content */}
      <div className="space-y-3.5 pr-8">
        <div className="inline-flex px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-wider">
          {trackLabel} Track
        </div>

        <div>
          <h4 className="font-extrabold text-white text-lg tracking-wide group-hover:text-indigo-300 transition-colors line-clamp-1">
            {interview?.jobPosition}
          </h4>
          <div className="flex flex-col gap-1 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <Award size={13} className="text-gray-500" />
              {interview?.jobExperience} Year(s) Experience
            </span>
            <span className="flex items-center gap-1.5 mt-0.5">
              <Calendar size={13} className="text-gray-500" />
              Created: {interview?.createdAt}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-5">
        <Button 
          size="sm" 
          variant="ghost" 
          className="w-full rounded-xl border border-white/5 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 text-xs font-bold py-2.5" 
          onClick={onFeedbackPress}
        >
          Feedback
        </Button>
        <Button 
          className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs py-2.5 shadow-md shadow-indigo-500/20 hover:scale-[1.02] transition-all" 
          size="sm" 
          onClick={onStart}
        >
          Start Session
        </Button>
      </div>

      {/* Confirmation Dialog Overlay */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#0b0f19]/95 border border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <h3 className="text-lg font-bold text-white tracking-wide">Confirm Deletion</h3>
            <p className="text-gray-400 text-sm mt-2 leading-relaxed">
              Are you sure you want to permanently delete this mock interview session? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <Button 
                variant="ghost" 
                className="rounded-xl border border-white/5 text-gray-400 hover:text-white hover:bg-white/5 text-xs font-semibold"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                className="rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold transition-all"
                onClick={onDelete}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewItemCard;
