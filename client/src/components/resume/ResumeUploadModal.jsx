import React, { useState } from 'react';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { Input, Textarea, Select } from '../ui/Input.jsx';
import { resumeService } from '../../services/resumeService.js';
import { Upload, FileText, CheckCircle } from 'lucide-react';

export function ResumeUploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [rawText, setRawText] = useState('');
  const [targetRole, setTargetRole] = useState('Frontend');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!file && (!rawText || rawText.trim().length < 30)) {
      setError('Please attach a PDF resume file or paste your resume text (minimum 30 characters).');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      if (file) {
        formData.append('resume', file);
      } else {
        formData.append('rawText', rawText);
        formData.append('filename', `${targetRole} Resume (Pasted)`);
      }
      formData.append('targetRole', targetRole);

      await resumeService.upload(formData);
      setIsUploading(false);
      onUploadSuccess();
      onClose();
    } catch (err) {
      setIsUploading(false);
      setError(err.message || 'Failed to upload and parse resume.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Resume for RAG Context">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 bg-rose-950/40 border border-rose-900/60 rounded text-xs text-rose-300">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Target Role Focus</label>
          <Select value={targetRole} onChange={(e) => setTargetRole(e.target.value)}>
            <option value="Frontend">Frontend Engineer</option>
            <option value="Backend">Backend Engineer</option>
            <option value="Full Stack">Full Stack Engineer</option>
            <option value="System Design">System Architecture</option>
            <option value="General">General Software Engineering</option>
          </Select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Upload Resume (PDF)</label>
          <div className="border-2 border-dashed border-slate-700 rounded-lg p-4 text-center hover:border-slate-600 transition-colors">
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileChange}
              className="hidden"
              id="resume-file-input"
            />
            <label htmlFor="resume-file-input" className="cursor-pointer flex flex-col items-center gap-1.5">
              <Upload size={20} className="text-slate-400" />
              <span className="text-xs font-medium text-indigo-400 hover:text-indigo-300">
                {file ? file.name : 'Choose PDF file'}
              </span>
              <span className="text-[11px] text-slate-500">PDF or TXT up to 5MB</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Or Paste Resume Text</label>
          <Textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste raw resume text, skills, or projects..."
            rows={4}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isUploading}>
            Process & Ingest Vectors
          </Button>
        </div>
      </form>
    </Modal>
  );
}
