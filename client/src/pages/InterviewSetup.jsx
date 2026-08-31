import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader.jsx';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input, Textarea, Select } from '../components/ui/Input.jsx';
import { interviewService } from '../services/interviewService.js';
import { resumeService } from '../services/resumeService.js';
import { ResumeUploadModal } from '../components/resume/ResumeUploadModal.jsx';
import { Target, Layers, FileText, Sparkles, Upload } from 'lucide-react';

export default function InterviewSetup() {
  const navigate = useNavigate();

  const [targetRole, setTargetRole] = useState('Frontend Engineer');
  const [jobDescription, setJobDescription] = useState('');
  const [experience, setExperience] = useState('2-4 years');
  const [interviewType, setInterviewType] = useState('technical');
  const [totalQuestions, setTotalQuestions] = useState('5');
  const [difficulty, setDifficulty] = useState('Medium');
  const [resumeId, setResumeId] = useState('');

  const [resumes, setResumes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadResumes = async () => {
    try {
      const res = await resumeService.list();
      setResumes(res.data || []);
      if (res.data && res.data.length > 0 && !resumeId) {
        setResumeId(res.data[0]._id);
      }
    } catch (err) {
      console.warn('Could not load resumes:', err);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const handleStart = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setIsLoading(true);
      const res = await interviewService.create({
        targetRole,
        jobDescription,
        experience,
        interviewType,
        totalQuestions: parseInt(totalQuestions, 10),
        difficulty,
        resumeId: resumeId || null,
      });

      const interview = res.data;
      // Start the session to generate question 1
      await interviewService.start(interview._id);
      setIsLoading(false);
      navigate(`/interview/${interview._id}`);
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Failed to initialize mock interview.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Configure Mock Interview"
        description="Select your target role, experience level, and attach a resume to generate tailored technical questions."
      />

      <form onSubmit={handleStart} className="space-y-6">
        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-900/60 rounded-md text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Section 1: Role & Experience */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target size={16} className="text-indigo-400" />
              <CardTitle className="text-sm">Role & Track</CardTitle>
            </div>
            <CardDescription>Defines the knowledge base retrieval focus.</CardDescription>
          </CardHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Role</label>
              <Select value={targetRole} onChange={(e) => setTargetRole(e.target.value)}>
                <option value="Frontend Engineer">Frontend Engineer (React / JS)</option>
                <option value="Backend Engineer">Backend Engineer (Node.js / Express / MongoDB)</option>
                <option value="Full Stack Engineer">Full Stack Engineer (MERN / REST)</option>
                <option value="System Design Engineer">System Architecture & Scalability</option>
                <option value="General Software Engineer">General Software Engineer</option>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Experience Level</label>
              <Select value={experience} onChange={(e) => setExperience(e.target.value)}>
                <option value="Entry Level (0-1 years)">Entry Level (0-1 years)</option>
                <option value="Mid Level (2-4 years)">Mid Level (2-4 years)</option>
                <option value="Senior (5+ years)">Senior (5+ years)</option>
              </Select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Job Description / Focus Topics (Optional)
            </label>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste specific job requirements, company stack, or topics you want to practice..."
              rows={3}
            />
          </div>
        </Card>

        {/* Section 2: Resume Context (RAG) */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-indigo-400" />
              <CardTitle className="text-sm">Resume Personalization (RAG)</CardTitle>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="gap-1"
            >
              <Upload size={13} />
              <span>Upload New</span>
            </Button>
          </CardHeader>

          {resumes.length === 0 ? (
            <div className="text-center py-4 text-xs text-slate-400 bg-slate-900/60 rounded border border-slate-800">
              <p>No resumes uploaded. Questions will be generated from the technical knowledge base.</p>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="text-indigo-400 hover:underline mt-1 font-medium"
              >
                Upload your resume for personalized questions
              </button>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Select Active Resume</label>
              <Select value={resumeId} onChange={(e) => setResumeId(e.target.value)}>
                <option value="">Do not use resume (Knowledge base only)</option>
                {resumes.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.filename} ({r.targetRole}) — {r.chunks?.length || 0} vector chunks
                  </option>
                ))}
              </Select>
            </div>
          )}
        </Card>

        {/* Section 3: Interview Parameters */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-indigo-400" />
              <CardTitle className="text-sm">Session Parameters</CardTitle>
            </div>
          </CardHeader>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Interview Type</label>
              <Select value={interviewType} onChange={(e) => setInterviewType(e.target.value)}>
                <option value="technical">Technical Depth</option>
                <option value="behavioral">Behavioral (STAR)</option>
                <option value="system_design">System Design</option>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Starting Difficulty</label>
              <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="Easy">Easy (Fundamentals)</option>
                <option value="Medium">Medium (Standard)</option>
                <option value="Hard">Hard (Deep Dive)</option>
                <option value="Expert">Expert (Architecture)</option>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Number of Questions</label>
              <Select value={totalQuestions} onChange={(e) => setTotalQuestions(e.target.value)}>
                <option value="3">3 Questions (Quick Drill)</option>
                <option value="5">5 Questions (Standard)</option>
                <option value="7">7 Questions (Comprehensive)</option>
              </Select>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-4 pt-2">
          <Button variant="primary" size="lg" type="submit" isLoading={isLoading} className="w-full sm:w-auto">
            Launch Mock Interview
          </Button>
        </div>
      </form>

      <ResumeUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUploadSuccess={loadResumes}
      />
    </div>
  );
}
