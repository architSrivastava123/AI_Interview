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
import { 
  LoaderCircle, 
  Sparkles, 
  Plus, 
  GraduationCap, 
  Code2, 
  Hourglass, 
  Bot,
  UploadCloud,
  FileText,
  X,
  Target,
  CheckCircle,
  AlertCircle
} from "lucide-react";
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

const CULTURAL_FRAMEWORKS = [
  { id: 'standard', name: 'Standard Technical & Behavioral' },
  { id: 'amazon', name: 'Amazon Leadership Principles' },
  { id: 'netflix', name: 'Netflix Freedom & Responsibility' },
  { id: 'google', name: 'Google Googlyness Culture Fit' }
];

const extractTextFromPDF = async (file) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = async function() {
      try {
        const typedarray = new Uint8Array(this.result);
        
        if (typeof window === "undefined") {
          resolve("");
          return;
        }
        
        if (!window.pdfjsLib) {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
          document.head.appendChild(script);
          
          await new Promise((res) => {
            script.onload = () => {
              window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
              res();
            };
          });
        }
        
        const pdf = await window.pdfjsLib.getDocument({ data: typedarray }).promise;
        let fullText = "";
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(" ");
          fullText += pageText + "\n";
        }
        
        resolve(fullText);
      } catch (err) {
        reject(err);
      }
    };
    fileReader.onerror = (err) => reject(err);
    fileReader.readAsArrayBuffer(file);
  });
};

function AddNewInterview() {
  const [openDialog, setOpenDialog] = useState(false);
  const [interviewTrack, setInterviewTrack] = useState(INTERVIEW_TRACKS[0]);
  const [jobPosition, setJobPosition] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobExperience, setJobExperience] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Feature 6: Active PDF Resume tailoring and ATS scanner states
  const [resumeSummary, setResumeSummary] = useState("");
  const [parsingResume, setParsingResume] = useState(false);
  const [fileName, setFileName] = useState("");

  // Feature 5 & 6 states: Cultural Alignment & ATS Match Score
  const [culturalFramework, setCulturalFramework] = useState("standard");
  const [atsScore, setAtsScore] = useState(0);
  const [foundKeywords, setFoundKeywords] = useState([]);
  const [missingKeywords, setMissingKeywords] = useState([]);

  const { user } = useUser();
  const router = useRouter();

  const autoSuggestTechStack = (role) => {
    const suggestion = TECH_STACK_SUGGESTIONS[role];
    if (suggestion) {
      setJobDescription(suggestion);
      toast.info(`Auto-filled tech stack suggestions for ${role}`);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.type !== "application/pdf") {
      toast.error("Please upload a valid PDF resume.");
      return;
    }

    setParsingResume(true);
    setFileName(file.name);
    
    try {
      const extractedText = await extractTextFromPDF(file);
      if (!extractedText.trim()) {
        throw new Error("Unable to extract text layers from PDF resume.");
      }

      // Feature 6: Localized Pre-Flight ATS Scan
      const textForScan = extractedText.toLowerCase();
      // Break job focus description down to individual tags
      const techTags = jobDescription
        .split(/[\s,]+/)
        .map(t => t.replace(/[^a-zA-Z0-9+#]/g, "").toLowerCase())
        .filter(t => t.length > 2);
      
      const found = [];
      const missing = [];
      
      techTags.forEach(tag => {
        if (textForScan.includes(tag)) {
          found.push(tag);
        } else {
          missing.push(tag);
        }
      });

      // Compute visual match score percentages
      const score = techTags.length > 0 ? Math.round((found.length / techTags.length) * 100) : 75;
      setAtsScore(score || 75);
      setFoundKeywords(found.slice(0, 5));
      setMissingKeywords(missing.slice(0, 5));

      // Summarize resume context using Gemini AI
      const summaryPrompt = `Please summarize the following candidate resume, highlighting their key software projects, tech stacks, and career accomplishments. Keep it extremely concise (under 120 words) and high impact: \n\n${extractedText}`;
      const result = await chatSession.sendMessage(summaryPrompt);
      const summaryText = (await result.response.text()).trim();
      
      setResumeSummary(summaryText);
      toast.success("Resume processed! AI will now generate custom questions for your projects.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to parse resume. Please ensure it is a text-based PDF.");
      setFileName("");
      setResumeSummary("");
      setAtsScore(0);
    } finally {
      setParsingResume(false);
    }
  };

  const clearResume = () => {
    setFileName("");
    setResumeSummary("");
    setAtsScore(0);
    setFoundKeywords([]);
    setMissingKeywords([]);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    // Feature 5 & 6 injection directly inside Gemini instruction block
    const inputPrompt = `Interview track: ${interviewTrack}. Job position: ${jobPosition}, Job Description: ${jobDescription}, Years of Experience: ${jobExperience}.
    ${resumeSummary ? `Candidate Resume Highlights & Projects: ${resumeSummary}.` : ""}
    Evaluate the candidate strictly aligning with the chosen corporate cultural framework: ${culturalFramework}.
    Generate 5 interview questions and answers in JSON format. ${resumeSummary ? "Ensure that at least 2-3 of these questions directly target the candidate's resume projects and highlights to evaluate their hands-on engineering experience." : ""}`;
  
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
          // Persist summary & cultural tags by serialization
          jobDesc: jobDescription + 
            (resumeSummary ? `|||resume:${resumeSummary}` : "") + 
            `|||culture:${culturalFramework}`,
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
        <DialogContent className="max-w-2xl bg-[#0b0f19]/95 backdrop-blur-2xl border border-white/10 text-white rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-extrabold text-2xl tracking-wide flex items-center gap-2">
              <Sparkles className="text-indigo-400 animate-pulse" size={24} />
              Setup AI Mock Interview
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-gray-400 text-xs sm:text-sm leading-relaxed mt-2">
            Configure the parameters below and our AI engine will construct a custom 5-question mock session tailored specifically to your tech stack and chosen values.
          </DialogDescription>

          <form onSubmit={onSubmit} className="space-y-6 mt-6">
            <div className="space-y-4">
              
              {/* Optional PDF Resume Uploader */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                  <FileText size={12} />
                  Upload PDF Resume (Optional - Tailors Questions to your projects!)
                </label>
                
                {fileName ? (
                  /* Uploaded File Pill Indicator */
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-indigo-400" />
                      <span className="font-bold truncate max-w-[250px]">{fileName}</span>
                      <span className="text-[9px] bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30 text-indigo-400 font-extrabold uppercase tracking-wider">
                        Tailoring Enabled
                      </span>
                    </div>
                    <Button 
                      type="button" 
                      onClick={clearResume}
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 rounded-lg text-indigo-400 hover:bg-rose-500/20 hover:text-rose-400"
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ) : (
                  /* Empty Uploader Card */
                  <label className="w-full h-24 rounded-xl border border-dashed border-white/10 bg-slate-950/40 flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.02] hover:border-indigo-500/40 transition-all p-4">
                    {parsingResume ? (
                      <div className="flex flex-col items-center gap-2">
                        <LoaderCircle className="animate-spin text-indigo-400 h-6 w-6" />
                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Extracting projects and achievements...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5">
                        <UploadCloud size={22} className="text-gray-500" />
                        <span className="text-gray-400 text-xs font-semibold">Drop or Upload your text PDF resume</span>
                        <span className="text-gray-600 text-[9px] uppercase font-bold tracking-wider">ATS questions will be customized</span>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="application/pdf" 
                      className="hidden" 
                      disabled={parsingResume} 
                      onChange={handleResumeUpload} 
                    />
                  </label>
                )}

                {/* Feature 6: Pre-Flight ATS Scanner Scoreboard */}
                {atsScore > 0 && (
                  <div className="p-4 rounded-2xl bg-[#090d16] border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1.5">
                        <Target size={12} />
                        Pre-Flight ATS Score Audit
                      </span>
                      <strong className={`text-xs ${atsScore > 80 ? 'text-emerald-400' : atsScore > 50 ? 'text-indigo-400' : 'text-rose-400'}`}>
                        {atsScore}% Keyword Match
                      </strong>
                    </div>

                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${atsScore}%` }} 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1 text-[10px]">
                      {foundKeywords.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle size={10} /> Identified:</span>
                          <span className="text-gray-400 truncate block">{foundKeywords.join(", ")}</span>
                        </div>
                      )}
                      {missingKeywords.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-rose-400 font-bold flex items-center gap-1"><AlertCircle size={10} /> Missing:</span>
                          <span className="text-gray-400 truncate block">{missingKeywords.join(", ")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Display extracted Resume summary capsule */}
                {resumeSummary && (
                  <div className="p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/10 text-[11px] text-gray-400 leading-relaxed max-h-[85px] overflow-y-auto">
                    <span className="font-extrabold text-[9px] uppercase tracking-widest text-purple-400 block mb-1">Resume summary generated:</span>
                    "{resumeSummary}"
                  </div>
                )}
              </div>

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

              {/* Feature 5: Cultural Fit & Corporate Values Framework Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                  <Target size={12} />
                  Cultural Alignment Framework
                </label>
                <select
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                  value={culturalFramework}
                  onChange={(e) => setCulturalFramework(e.target.value)}
                  required
                >
                  {CULTURAL_FRAMEWORKS.map((framework) => (
                    <option key={framework.id} value={framework.id} className="bg-[#0b0f19] text-white">
                      {framework.name}
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
