"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { chatSession } from "@/utils/GeminiAIModal";
import { LoaderCircle, Sparkles, Plus, GraduationCap, Code2, Hourglass, Bot } from "lucide-react";
import { MockInterview } from "@/utils/schema";
import { v4 as uuidv4 } from 'uuid';
import { db } from "@/utils/db";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const JOB_ROLE_SUGGESTIONS = [
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Software Engineer',
  'DevOps Engineer',
  'Data Scientist',
  'Machine Learning Engineer',
  'Cloud Engineer',
  'Mobile App Developer',
  'UI/UX Designer'
];

const INTERVIEW_TRACKS = [
  'Frontend',
  'Backend',
  'Full Stack',
  'Data Science',
  'Machine Learning',
  'Product Manager',
  'DevOps',
  'Cybersecurity'
];

const TECH_STACK_SUGGESTIONS = {
  'Full Stack Developer': 'React, Node.js, Express, MongoDB, TypeScript',
  'Frontend Developer': 'React, Vue.js, Angular, TypeScript, Tailwind CSS',
  'Backend Developer': 'Python, Django, Flask, Java Spring, PostgreSQL',
  'Software Engineer': 'Java, C++, Python, AWS, Microservices',
  'DevOps Engineer': 'Docker, Kubernetes, Jenkins, AWS, Azure',
  'Data Scientist': 'Python, TensorFlow, PyTorch, Pandas, NumPy',
  'Machine Learning Engineer': 'Python, scikit-learn, Keras, TensorFlow',
  'Cloud Engineer': 'AWS, Azure, GCP, Terraform, Kubernetes',
  'Mobile App Developer': 'React Native, Flutter, Swift, Kotlin',
  'UI/UX Designer': 'Figma, Sketch, Adobe XD, InVision'
};

function AddNewInterview() {
  const [openDialog, setOpenDialog] = useState(false);
  const [interviewTrack, setInterviewTrack] = useState(INTERVIEW_TRACKS[0]);
  const [jobPosition, setJobPosition] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobExperience, setJobExperience] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  const autoSuggestTechStack = (role) => {
    const suggestion = TECH_STACK_SUGGESTIONS[role];
    if (suggestion) {
      setJobDescription(suggestion);
      toast.info(`Auto-filled tech stack suggestions for ${role}`);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const inputPrompt = `Interview track: ${interviewTrack}. Job position: ${jobPosition}, Job Description: ${jobDescription}, Years of Experience: ${jobExperience}.
    Generate 5 interview questions and answers in JSON format.`;
  
    try {
      const result = await chatSession.sendMessage(inputPrompt);
      const responseText = await result.response.text();
      
      const cleanedResponse = responseText.replace(/```json\n?|```/g, '').trim();
      const mockResponse = JSON.parse(cleanedResponse);
      
      const res = await db.insert(MockInterview)
        .values({
          mockId: uuidv4(),
          jsonMockResp: JSON.stringify(mockResponse),
          jobPosition: jobPosition,
          jobDesc: jobDescription,
          jobExperience: jobExperience,
          interviewTrack: interviewTrack,
          createdBy: user?.primaryEmailAddress?.emailAddress,
          createdAt: moment().format('DD-MM-YYYY'),
        }).returning({ mockId: MockInterview.mockId });
      
      toast.success('Interview questions generated successfully!');
      router.push(`dashboard/interview/${res[0]?.mockId}`);
    } catch (error) {
      console.error("Error generating interview:", error);
      toast.error('Failed to generate interview questions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Create Card Trigger */}
      <div
        className="glass-panel glass-panel-hover p-8 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer border-2 border-dashed border-indigo-500/20 hover:border-indigo-500/50 group h-full min-h-[180px]"
        onClick={() => setOpenDialog(true)}
      >
        <div className="p-4 rounded-full bg-indigo-500/10 text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/15 transition-all duration-300 shadow-md">
          <Plus size={28} />
        </div>
        <h3 className="mt-4 text-lg font-bold text-white tracking-wide group-hover:text-indigo-400 transition-colors">
          Add New Session
        </h3>
        <p className="text-gray-500 text-xs mt-1 leading-relaxed">
          Spin up a new customized AI interview panel.
        </p>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl bg-[#0b0f19]/95 backdrop-blur-2xl border border-white/10 text-white rounded-3xl p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="font-extrabold text-2xl tracking-wide flex items-center gap-2">
              <Sparkles className="text-indigo-400 animate-pulse" size={24} />
              Setup AI Mock Interview
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-gray-400 text-xs sm:text-sm leading-relaxed mt-2">
            Configure the parameters below and our AI engine will construct a custom 5-question mock session tailored specifically to your tech stack.
          </DialogDescription>

          <form onSubmit={onSubmit} className="space-y-6 mt-6">
            <div className="space-y-4">
              
              {/* Interview Track */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                  <GraduationCap size={12} />
                  Interview Track
                </label>
                <select
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                  value={interviewTrack}
                  onChange={(e) => setInterviewTrack(e.target.value)}
                  required
                >
                  {INTERVIEW_TRACKS.map((track) => (
                    <option key={track} value={track} className="bg-[#0b0f19] text-white">
                      {track}
                    </option>
                  ))}
                </select>
              </div>

              {/* Job Position */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                  <Bot size={12} />
                  Job Position / Role
                </label>
                <div className="flex items-center gap-2 relative">
                  <Input
                    className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white shadow-sm focus-visible:ring-1 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus:outline-none h-11"
                    placeholder="Ex. Full Stack Developer"
                    value={jobPosition}
                    required
                    onChange={(e) => setJobPosition(e.target.value)}
                    list="jobRoles"
                  />
                  <datalist id="jobRoles">
                    {JOB_ROLE_SUGGESTIONS.map(role => (
                      <option key={role} value={role} />
                    ))}
                  </datalist>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-11 w-11 rounded-xl bg-white/5 border border-white/5 hover:bg-indigo-500/10 hover:border-indigo-500/20 text-indigo-400"
                    onClick={() => autoSuggestTechStack(jobPosition)}
                    disabled={!jobPosition}
                    title="Auto-fill Tech Stack"
                  >
                    <Sparkles className="h-4.5 w-4.5 animate-pulse" />
                  </Button>
                </div>
              </div>

              {/* Tech Stack */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                  <Code2 size={12} />
                  Tech Stack / Focus
                </label>
                <Textarea
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white shadow-sm focus-visible:ring-1 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus:outline-none min-h-[90px]"
                  placeholder="Ex. React, Node.js, Express, PostgreSQL"
                  value={jobDescription}
                  required
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>

              {/* Experience */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                  <Hourglass size={12} />
                  Years of Experience
                </label>
                <Input
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white shadow-sm focus-visible:ring-1 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus:outline-none h-11"
                  placeholder="Ex. 3"
                  type="number"
                  min="0"
                  max="50"
                  value={jobExperience}
                  required
                  onChange={(e) => setJobExperience(e.target.value)}
                />
              </div>

            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end pt-4 border-t border-white/5">
              <Button 
                type="button" 
                variant="ghost" 
                className="rounded-xl border border-white/5 text-gray-400 hover:text-white hover:bg-white/5 px-5 h-11"
                onClick={() => setOpenDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold px-6 h-11 shadow-lg shadow-indigo-500/20 hover:scale-[1.02] transition-all"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoaderCircle className="animate-spin mr-2" size={16} /> Generating Panel
                  </>
                ) : (
                  'Start Session'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewInterview;
