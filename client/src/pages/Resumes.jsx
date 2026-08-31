import React, { useState, useEffect } from 'react';
import { resumeService } from '../services/resumeService.js';
import { PageHeader } from '../components/common/PageHeader.jsx';
import { ResumeCard } from '../components/resume/ResumeCard.jsx';
import { ResumeUploadModal } from '../components/resume/ResumeUploadModal.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { Upload, FileText, Cpu } from 'lucide-react';

export default function Resumes() {
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadResumes = async () => {
    try {
      setIsLoading(true);
      const res = await resumeService.list();
      setResumes(res.data || []);
    } catch (err) {
      console.error('Failed to load resumes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resume and its vector embeddings?')) return;
    try {
      await resumeService.delete(id);
      setResumes((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete resume.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Resume Context & RAG Ingestion"
        description="Upload your PDF resumes. The system extracts technical skills, chunks projects, and stores embeddings for personalized question retrieval."
        actions={
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} className="gap-1.5">
            <Upload size={14} />
            <span>Upload Resume</span>
          </Button>
        }
      />

      {isLoading ? (
        <div className="py-20 flex items-center justify-center">
          <LoadingSpinner text="Fetching stored vector resumes..." />
        </div>
      ) : resumes.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-indigo-400 mb-3">
            <FileText size={20} />
          </div>
          <h3 className="text-sm font-semibold text-slate-200 mb-1">No resumes uploaded</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Upload your resume so the AI can ask contextual questions about your actual experience and projects.
          </p>
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            Upload Resume PDF
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {resumes.map((resume) => (
            <ResumeCard key={resume._id} resume={resume} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <ResumeUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUploadSuccess={loadResumes}
      />
    </div>
  );
}
